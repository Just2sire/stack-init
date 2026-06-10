import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/gemini'
import type { ProjectConfig } from '@/types/schema'
import type { StepId } from '@/stores/useWizardStore'

const STEP_SYSTEM_PROMPTS: Partial<Record<StepId, string>> = {
  stack: `You are a tech stack consultant. Based on the project description, recommend the most suitable tech stack.
Return JSON: { "recommendation": "stack-id", "reasoning": "...", "services": ["auth", "email", ...], "tips": ["tip1", "tip2"] }`,

  database: `You are a database architect. Recommend the best ORM and database engine for the current stack.
Return JSON: { "recommendation": "...", "orm": "prisma|mongoose|typeorm|sequelize|sqlalchemy|sqlmodel", "db_engine": "postgresql|mysql|sqlite|mongodb", "reasoning": "...", "tips": ["tip1"] }`,

  services: `You are a backend architect. Recommend which infrastructure services to enable based on the models and description.
Return JSON: { "recommended": ["auth"|"email"|"cache"|"websockets"|"queue"|"file-upload"], "reasoning": { "auth": "...", "email": "..." }, "tips": ["tip1"] }`,

  models: `You are a data modeler. Suggest models or fields to add based on the user's requirements.
Return JSON: { "suggestion": "...", "modelsToAdd": [{ "name": "PascalCase", "reason": "..." }], "fieldsToAdd": [{ "model": "ExistingModel", "field": "fieldName", "type": "string|integer|...", "reason": "..." }], "tips": ["tip1"] }`,

  'laravel-setup': `You are a Laravel expert. Provide architectural setup recommendations for a Laravel project.
Return JSON: { "recommendation": "...", "auth": "sanctum|passport|breeze|jetstream|none", "pattern": "api-only|full|minimal", "reasoning": "...", "tips": ["tip1", "tip2"] }`,

  'nest-setup': `You are a NestJS expert. Provide architectural recommendations for a NestJS project.
Return JSON: { "recommendation": "...", "architecture": "modular|cqrs|layered", "orm": "prisma|typeorm|mongoose", "reasoning": "...", "tips": ["tip1"] }`,

  'fastapi-setup': `You are a FastAPI expert. Provide architectural recommendations for a FastAPI project.
Return JSON: { "recommendation": "...", "orm": "sqlmodel|sqlalchemy|tortoise-orm", "architecture": "flat|layered|feature-based", "reasoning": "...", "tips": ["tip1"] }`,

  routes: `You are an API designer. Suggest the best routing structure and standards (REST/GraphQL/etc).
Return JSON: { "recommendation": "...", "tips": ["tip1", "tip2"] }`,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })
  }

  try {
    const { step, context, question } = await req.json() as {
      step: StepId
      context: Partial<ProjectConfig>
      question?: string
    }

    const systemPrompt = STEP_SYSTEM_PROMPTS[step]
    if (!systemPrompt) {
      return NextResponse.json({ error: `No AI assist available for step: ${step}` }, { status: 400 })
    }

    const contextSummary = JSON.stringify({
      stack: context.stack,
      models: context.models?.map(m => ({ name: m.name, fields: m.fields?.map(f => f.name) })),
      services: context.services,
    }, null, 2)

    const userMessage = [
      `Current project context:\n${contextSummary}`,
      question ? `User question: ${question}` : '',
    ].filter(Boolean).join('\n\n')

    const result = await generateJSON<any>(systemPrompt, userMessage)

    return NextResponse.json({ step, result })
  } catch (error) {
    console.error('API ai-assist error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while getting AI assistance' },
      { status: 500 }
    )
  }
}
