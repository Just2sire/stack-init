import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/gemini'

const SYSTEM_PROMPT = `You are a senior full-stack architect specializing in modern web stacks and database modeling.
Given a project description, you must return a complete stack-init configuration that best fits the use case.

Return a JSON object matching this schema:
{
  "reasoning": "A concise explanation of why this stack and architecture was chosen.",
  "config": {
    "name": "kebab-case-project-name",
    "stack": "one of: laravel|express|nestjs|fastapi|laravel+react|express+react|nestjs+react|fastapi+react|nextjs|fastapi+nextjs|laravel+nextjs",
    "models": [
      {
        "name": "PascalCase",
        "fields": [
          { 
            "name": "camelCase", 
            "type": "string|text|integer|decimal|boolean|date|datetime|json|enum|foreignId", 
            "nullable": boolean, 
            "unique": boolean,
            "values": ["only for enum type"]
          }
        ],
        "relations": [
          { "type": "hasOne|hasMany|belongsTo|belongsToMany", "model": "PascalCase" }
        ],
        "generate": { "migration": true, "controller": true, "resource": true, "request": true, "policy": false, "factory": true, "seeder": false, "swagger": false, "softDelete": false, "repository": false, "service": false, "tests": false, "routes": true },
        "migration": { "timestamps": true, "primary_key": "id", "softDeletes": false }
      }
    ],
    "services": ["auth", "email", "cache", "websockets", "queue", "file-upload"],
    "laravel": { "pattern": "api-only|full", "auth": "sanctum|passport", "php_version": "8.4", "laravel_version": "12", "db_engine": "mysql|postgresql" },
    "express": { "architecture": "layered|mvc", "orm": "prisma|drizzle", "db_engine": "postgresql|mysql", "auth": "jwt" },
    "nestjs": { "architecture": "modular|cqrs", "orm": "prisma|typeorm", "db_engine": "postgresql|mysql", "swagger": true, "auth": "jwt" },
    "fastapi": { "architecture": "layered|feature-based", "orm": "sqlmodel|sqlalchemy", "db_engine": "postgresql|mysql", "auth": "jwt", "migrations": true, "cors": true, "swagger": true, "python_version": "3.12", "async_mode": true },
    "react": { "state_lib": "zustand|redux", "form_lib": "react-hook-form", "ui_lib": "shadcn", "http_lib": "axios", "router": "react-router", "css": "tailwind" }
  }
}

Guidelines:
- Python/Data/AI -> fastapi
- PHP/Rapid Prototyping -> laravel
- Enterprise Node.js -> nestjs
- Lightweight Node.js -> express
- Fullstack SSR/SEO -> nextjs
- Always include 3-6 core models that form the backbone of the app.
- Ensure foreignId fields have corresponding relations.
- Only include the specific config object for the chosen stack (e.g., if stack is nestjs+react, include 'nestjs' and 'react' keys).
`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })
  }

  try {
    const { description } = await req.json() as { description: string }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const result = await generateJSON<any>(
      SYSTEM_PROMPT,
      `Project description: ${description}`
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('API recommend-stack error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while generating recommendation' },
      { status: 500 }
    )
  }
}
