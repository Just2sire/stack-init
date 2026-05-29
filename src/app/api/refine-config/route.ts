import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import type { ProjectConfig } from '@/types/schema'

const SYSTEM_PROMPT = `You are a backend architect. The user has an existing stack-init configuration and wants to add or modify something.
Your job is to return a patch (partial config) that MERGES with their current configuration without overwriting what already exists.

Return a JSON object with:
{
  "explanation": "What you're adding and why",
  "models": [...new models to add, empty array if none],
  "services": [...new service IDs to enable, empty array if none],
  "patch": {
    // Only fields that need to change in the top-level config (e.g. stack-specific options)
    // Leave out everything that should stay the same
  }
}

ServiceIds: "auth" | "email" | "cache" | "websockets" | "queue" | "file-upload"

Model format:
{
  "name": "PascalCase",
  "fields": [{ "name": "camelCase", "type": "string|text|integer|decimal|boolean|date|datetime|json|enum|foreignId", "nullable": false }],
  "relations": [],
  "generate": { "migration": true, "controller": true, "resource": true, "request": true, "policy": false, "factory": true, "seeder": false, "swagger": false, "softDelete": false, "repository": false, "service": false, "tests": false, "routes": true },
  "migration": { "timestamps": true, "primary_key": "id", "softDeletes": false }
}

Rules:
- NEVER remove existing models or fields
- Only add what the instruction asks for
- For payments (Stripe) → add Subscription + Payment models, add "queue" service for webhook handling
- For notifications → add Notification model, add "email" service
- For real-time features → add "websockets" service
- For media → add Media model, add "file-upload" service
- Keep changes minimal and precise
`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })
  }

  const { currentConfig, instruction } = await req.json() as {
    currentConfig: ProjectConfig
    instruction: string
  }

  if (!instruction?.trim()) {
    return NextResponse.json({ error: 'Instruction is required' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 503 })
  }

  const contextSummary = JSON.stringify({
    stack: currentConfig.stack,
    existingModels: currentConfig.models?.map(m => ({
      name: m.name,
      fields: m.fields?.map(f => f.name),
    })),
    enabledServices: currentConfig.services ?? [],
  }, null, 2)

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent(
    `${SYSTEM_PROMPT}\n\nCurrent configuration:\n${contextSummary}\n\nInstruction: ${instruction}`
  )

  const text = result.response.text().trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
  }

  const parsed = JSON.parse(jsonMatch[0])
  return NextResponse.json(parsed)
}
