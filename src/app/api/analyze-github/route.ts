import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import {
  fetchRepoTree,
  selectKeyFiles,
  fetchFileContents,
  buildGeminiPrompt,
  extractOwnerRepo,
} from '@/lib/githubAnalyzer'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })
  }

  const { url } = await req.json() as { url: string }
  if (!url?.trim()) {
    return NextResponse.json({ error: 'GitHub URL is required' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 503 })
  }

  const githubToken = process.env.GITHUB_TOKEN

  try {
    const { owner, repo } = extractOwnerRepo(url)

    // 1. Fetch repo file tree
    const tree = await fetchRepoTree(url, githubToken)

    // 2. Select the most relevant files
    const keyFilePaths = selectKeyFiles(tree, 15)

    if (keyFilePaths.length === 0) {
      return NextResponse.json(
        { error: 'No recognizable project files found (no package.json, composer.json, migrations, models, etc.)' },
        { status: 422 }
      )
    }

    // 3. Fetch file contents
    const files = await fetchFileContents(owner, repo, keyFilePaths, githubToken)

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Could not read any files from the repository.' },
        { status: 422 }
      )
    }

    // 4. Build Gemini prompt and call API
    const prompt = buildGeminiPrompt(files, repo)

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // 5. Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
    }

    const config = JSON.parse(jsonMatch[0])
    return NextResponse.json({ config, filesAnalyzed: files.length, repoName: repo })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
