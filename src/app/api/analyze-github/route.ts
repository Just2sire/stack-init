import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/gemini'
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
    const { systemPrompt, userPrompt } = buildGeminiPrompt(files, repo)

    const config = await generateJSON<any>(systemPrompt, userPrompt)

    return NextResponse.json({ config, filesAnalyzed: files.length, repoName: repo })
  } catch (err) {
    console.error('API analyze-github error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
