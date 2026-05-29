import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are a senior full-stack architect specializing in modern web stacks.
Given a project description, return a complete stack-init configuration that best fits the use case.

Return a JSON object matching EXACTLY this schema (no markdown, no explanation, pure JSON):

{
  "reasoning": "1-2 sentences on why this stack fits",
  "config": {
    "name": "kebab-case-project-name",
    "stack": "one of: laravel|express|nestjs|fastapi|laravel+react|express+react|nestjs+react|fastapi+react|nextjs",
    "models": [
      {
        "name": "PascalCase",
        "fields": [
          { "name": "camelCase", "type": "string|text|integer|decimal|boolean|date|datetime|json|enum|foreignId", "nullable": false, "unique": false }
        ],
        "relations": [],
        "generate": { "migration": true, "controller": true, "resource": true, "request": true, "policy": false, "factory": true, "seeder": false, "swagger": false, "softDelete": false, "repository": false, "service": false, "tests": false, "routes": true },
        "migration": { "timestamps": true, "primary_key": "id", "softDeletes": false }
      }
    ],
    "services": [],
    "laravel": { "pattern": "api-only", "auth": "sanctum", "php_version": "8.4", "laravel_version": "12", "db_engine": "mysql" },
    "express": { "architecture": "layered", "database": "prisma", "db_engine": "postgresql", "auth": "jwt" },
    "nestjs": { "architecture": "modular", "database": "prisma", "db_engine": "postgresql", "swagger": true, "auth": "jwt" },
    "fastapi": { "architecture": "layered", "orm": "sqlmodel", "db_engine": "postgresql", "auth": "jwt", "migrations": true, "cors": true, "swagger": true, "rate_limiting": false, "background_tasks": false, "websockets": false, "runner": "none", "python_version": "3.12", "async_mode": true },
    "react": { "state_lib": "zustand", "form_lib": "react-hook-form", "ui_lib": "shadcn", "http_lib": "axios", "router": "react-router", "css": "tailwind" }
  }
}

Rules for stack selection:
- Python/data science/ML projects → fastapi or fastapi+react
- PHP/WordPress background mentioned → laravel or laravel+react
- Enterprise/microservices/team project → nestjs or nestjs+react
- Simple REST API, Node.js preference → express or express+react
- Full-stack with SSR/SEO → nextjs
- Mention of "dashboard" or "admin" → add react frontend
- Include only the stack-specific config key that applies (laravel OR express OR nestjs OR fastapi), not all four
- Include react config only for +react stacks
- services: include based on keywords (payments/email → email, real-time/chat → websockets, background jobs/queues → queue, files/uploads → file-upload, Redis/caching → cache)
- models: generate 2-5 core models that match the use case described
- name: derive from project description (e.g. "e-commerce" → "ecommerce-api")
`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })
  }

  const { description } = await req.json() as { description: string }
  if (!description?.trim()) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 503 })
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent(
    `${SYSTEM_PROMPT}\n\nProject description: ${description}`
  )

  const text = result.response.text().trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
  }

  const parsed = JSON.parse(jsonMatch[0])
  return NextResponse.json(parsed)
}
