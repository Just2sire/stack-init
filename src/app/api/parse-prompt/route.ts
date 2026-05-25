import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const MODEL_SCHEMA_DESCRIPTION = `
Return a JSON object with a "models" array. Each model has:
- name: PascalCase string
- fields: array of { name: camelCase string, type: one of [string|text|integer|decimal|boolean|date|datetime|json|enum|foreignId], required?: boolean, unique?: boolean, default?: string|number|boolean, values?: string[] (for enum) }
- relations: array of { type: one of [hasOne|hasMany|belongsTo|belongsToMany|morphTo|morphMany], model: PascalCase string }
- generate: { controller: boolean, service: boolean, migration: boolean, repository?: boolean }

Return ONLY valid JSON, no markdown, no explanation.
`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Connexion requise pour utiliser la génération IA.' },
      { status: 401 }
    )
  }

  const { prompt } = await req.json()
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 503 })
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent(
    `You are a backend schema designer. Given this project description, generate the data models.\n\n` +
    `Schema format:\n${MODEL_SCHEMA_DESCRIPTION}\n\n` +
    `Project description: ${prompt}`
  )

  const text = result.response.text().trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
  }

  const parsed = JSON.parse(jsonMatch[0])
  return NextResponse.json(parsed)
}
