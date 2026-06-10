import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/gemini'
import type { ProjectConfig } from '@/types/schema'

const SYSTEM_PROMPT = `You are a backend architect. The user has an existing stack-init configuration and wants to add or modify something.
Your job is to return a patch (partial config) that MERGES with their current configuration.

Return a JSON object with:
{
  "explanation": "What you're adding and why",
  "models": [
     // Array of NEW models to add. 
     // EACH model MUST follow the standard schema:
     // { "name": "PascalCase", "fields": [...], "relations": [...], "generate": {...}, "migration": {...} }
  ],
  "services": [
     // Array of service IDs to enable (e.g. "auth", "email", etc.)
  ],
  "patch": {
    // Only fields that need to change in the top-level config (e.g. stack-specific options).
    // DO NOT include models or services here, they go in the arrays above.
  }
}

ServiceIds: "auth" | "email" | "cache" | "websockets" | "queue" | "file-upload"

Rules:
- NEVER suggest removing existing models or fields.
- Be precise: if they ask for "billing", add "Subscription" and "Invoice" models.
- If they ask for "chat", add "Message" and "Conversation" models and enable "websockets".
- Ensure new models have logical relations to existing models if relevant.
`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })
  }

  try {
    const { currentConfig, instruction } = await req.json() as {
      currentConfig: ProjectConfig
      instruction: string
    }

    if (!instruction?.trim()) {
      return NextResponse.json({ error: 'Instruction is required' }, { status: 400 })
    }

    const contextSummary = JSON.stringify({
      stack: currentConfig.stack,
      existingModels: currentConfig.models?.map(m => ({
        name: m.name,
        fields: m.fields?.map(f => f.name),
      })),
      enabledServices: currentConfig.services ?? [],
    }, null, 2)

    const result = await generateJSON<any>(
      SYSTEM_PROMPT,
      `Current configuration:\n${contextSummary}\n\nInstruction: ${instruction}`
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('API refine-config error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while refining configuration' },
      { status: 500 }
    )
  }
}
