import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import type { ProjectConfig } from '@/types/schema'
import type { StepId } from '@/stores/useWizardStore'

const STEP_SYSTEM_PROMPTS: Partial<Record<StepId, string>> = {
  stack: `You are a stack selector. Based on the user's description, recommend the best technology stack.
Return JSON: { "recommendation": "stack-id (e.g. laravel, express+react, nestjs)", "reasoning": "2-3 sentences", "services": ["auth", "email", ...], "tips": ["tip1", "tip2"] }`,

  database: `You are a database architect. Given the current stack and models, recommend the best ORM and database engine.
Return JSON: { "recommendation": "brief recommendation (1 sentence)", "orm": "prisma|mongoose|typeorm|sequelize|sqlalchemy", "db_engine": "postgresql|mysql|sqlite|mongodb", "reasoning": "2-3 sentences", "tips": ["tip1"] }`,

  services: `You are a backend architect. Given the existing models, recommend which services to enable.
Return JSON: { "recommended": ["auth"|"email"|"cache"|"websockets"|"queue"|"file-upload"], "reasoning": { "auth": "why auth", "email": "why email" ... only include recommended ones }, "tips": ["tip1"] }`,

  models: `You are a data modeler. Given the existing models and the user's question, suggest models or fields to add.
Return JSON: { "suggestion": "brief summary", "modelsToAdd": [{ "name": "PascalCase", "reason": "why" }], "fieldsToAdd": [{ "model": "ExistingModel", "field": "fieldName", "type": "string|integer|...", "reason": "why" }], "tips": ["tip1"] }`,

  'laravel-setup': `You are a Laravel expert. Given the user's question about their Laravel project, provide setup recommendations.
Return JSON: { "recommendation": "brief recommendation", "auth": "sanctum|passport|breeze|jetstream|none", "pattern": "api-only|full|minimal", "reasoning": "2-3 sentences", "tips": ["tip1", "tip2"] }`,

  'nest-setup': `You are a NestJS expert. Given the user's question about their NestJS project, provide setup recommendations.
Return JSON: { "recommendation": "brief recommendation", "architecture": "modular|cqrs|layered", "database": "prisma|typeorm|mongoose", "reasoning": "2-3 sentences", "tips": ["tip1"] }`,

  'fastapi-setup': `You are a FastAPI expert. Given the user's question about their FastAPI project, provide setup recommendations.
Return JSON: { "recommendation": "brief recommendation", "orm": "sqlmodel|sqlalchemy|tortoise-orm", "architecture": "flat|layered|feature-based", "reasoning": "2-3 sentences", "tips": ["tip1"] }`,

  routes: `You are an API designer. Given the existing models, suggest the best routing setup.
Return JSON: { "recommendation": "brief recommendation", "tips": ["tip1", "tip2"] }`,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })
  }

  const { step, context, question } = await req.json() as {
    step: StepId
    context: Partial<ProjectConfig>
    question?: string
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 503 })
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

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent(`${systemPrompt}\n\nReturn ONLY valid JSON, no markdown.\n\n${userMessage}`)

  const text = result.response.text().trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
  }

  const parsed = JSON.parse(jsonMatch[0])
  return NextResponse.json({ step, result: parsed })
}
