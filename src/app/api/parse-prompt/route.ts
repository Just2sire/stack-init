import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/gemini'

const SYSTEM_PROMPT = `You are a backend schema designer. Given a project description, generate the core data models.

Return a JSON object with a "models" array. Each model MUST follow this schema:
{
  "name": "PascalCase string",
  "fields": [
    { 
      "name": "camelCase string", 
      "type": "string|text|integer|decimal|boolean|date|datetime|json|enum|foreignId", 
      "required": boolean, 
      "unique": boolean, 
      "default": "optional string|number|boolean",
      "values": ["only for enum type"] 
    }
  ],
  "relations": [
    { "type": "hasOne|hasMany|belongsTo|belongsToMany", "model": "PascalCase string" }
  ],
  "generate": { "controller": true, "service": true, "migration": true, "repository": true },
  "migration": { "timestamps": true, "primary_key": "id", "softDeletes": false }
}

Rules:
- Generate 3-7 models that cover the main entities and their relationships.
- Use foreignId for fields that link to other models and ensure a corresponding relation is added.
- Be consistent with naming.
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

  try {
    const { prompt } = await req.json()
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateJSON<any>(
      SYSTEM_PROMPT,
      `Project description: ${prompt}`
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('API parse-prompt error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while parsing prompt' },
      { status: 500 }
    )
  }
}
