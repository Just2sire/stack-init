import type { ProjectConfig } from '@/types/schema'

interface TreeItem {
  path: string
  type: 'blob' | 'tree'
  url?: string
}

// Priority order for each stack type
const KEY_FILE_PATTERNS: Array<{ pattern: RegExp; priority: number; label: string }> = [
  { pattern: /^prisma\/schema\.prisma$/i, priority: 10, label: 'Prisma schema' },
  { pattern: /^composer\.json$/i, priority: 9, label: 'Composer config' },
  { pattern: /^package\.json$/i, priority: 9, label: 'NPM config' },
  { pattern: /^requirements\.txt$/i, priority: 9, label: 'Python requirements' },
  { pattern: /^pyproject\.toml$/i, priority: 9, label: 'Python project' },
  { pattern: /database\/migrations\/[^/]+\.php$/i, priority: 8, label: 'Laravel migration' },
  { pattern: /app\/models\/[^/]+\.php$/i, priority: 8, label: 'Laravel model' },
  { pattern: /app\/models\/[^/]+\.py$/i, priority: 8, label: 'FastAPI model' },
  { pattern: /alembic\/versions\/[^/]+\.py$/i, priority: 7, label: 'Alembic migration' },
  { pattern: /src\/.+\.entity\.ts$/i, priority: 8, label: 'TypeORM entity' },
  { pattern: /src\/.+\.model\.ts$/i, priority: 7, label: 'NestJS model' },
  { pattern: /src\/models\/[^/]+\.(ts|js)$/i, priority: 7, label: 'Node model' },
  { pattern: /src\/entities\/[^/]+\.(ts|js)$/i, priority: 7, label: 'Node entity' },
]

export interface AnalyzedFile {
  path: string
  label: string
  content: string
}

export async function fetchRepoTree(url: string, githubToken?: string): Promise<TreeItem[]> {
  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match
  const cleanRepo = repo.replace(/\.git$/, '')

  const headers: Record<string, string> = {}
  if (githubToken) headers['Authorization'] = `Bearer ${githubToken}`

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/HEAD?recursive=1`,
    { headers }
  )
  if (!res.ok) {
    if (res.status === 404) throw new Error('Repository not found or private')
    if (res.status === 403) throw new Error('GitHub API rate limit reached — add GITHUB_TOKEN to .env.local')
    throw new Error(`GitHub API error: ${res.status}`)
  }
  const data = await res.json()
  return data.tree ?? []
}

export function selectKeyFiles(tree: TreeItem[], maxFiles = 15): Array<{ path: string; label: string }> {
  const selected: Array<{ path: string; label: string; priority: number }> = []

  for (const item of tree) {
    if (item.type !== 'blob') continue
    for (const { pattern, priority, label } of KEY_FILE_PATTERNS) {
      if (pattern.test(item.path)) {
        selected.push({ path: item.path, label, priority })
        break
      }
    }
  }

  // Sort by priority desc, then by path length asc (prefer shorter paths = root-level files)
  selected.sort((a, b) => b.priority - a.priority || a.path.length - b.path.length)
  return selected.slice(0, maxFiles)
}

export async function fetchFileContents(
  owner: string,
  repo: string,
  paths: Array<{ path: string; label: string }>,
  githubToken?: string
): Promise<AnalyzedFile[]> {
  const headers: Record<string, string> = {}
  if (githubToken) headers['Authorization'] = `Bearer ${githubToken}`

  const results = await Promise.all(
    paths.map(async ({ path, label }) => {
      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`,
          { headers }
        )
        if (!res.ok) return null
        const content = await res.text()
        // Truncate large files to avoid exceeding Gemini's context
        return { path, label, content: content.slice(0, 8000) }
      } catch {
        return null
      }
    })
  )

  return results.filter(Boolean) as AnalyzedFile[]
}

export function buildGeminiPrompt(files: AnalyzedFile[], repoName: string): string {
  const fileSection = files
    .map(f => `=== ${f.label}: ${f.path} ===\n${f.content}`)
    .join('\n\n')

  return `You are a code analyst and backend architect. Analyze these files from the GitHub repository "${repoName}" and generate a complete stack-init configuration.

${fileSection}

---

Return a JSON object matching EXACTLY this schema (no markdown, no explanation, pure JSON):

{
  "name": "kebab-case-project-name",
  "stack": "one of: laravel|express|nestjs|fastapi|laravel+react|express+react|nestjs+react|fastapi+react|nextjs",
  "models": [
    {
      "name": "PascalCase",
      "fields": [
        { "name": "camelCase", "type": "string|text|integer|decimal|boolean|date|datetime|json|enum|foreignId", "nullable": false, "unique": false, "default": null, "values": [] }
      ],
      "relations": [
        { "type": "hasOne|hasMany|belongsTo|belongsToMany", "model": "PascalCase" }
      ],
      "generate": { "migration": true, "controller": true, "resource": true, "request": true, "policy": false, "factory": true, "seeder": false, "swagger": false, "softDelete": false, "repository": false, "service": false, "tests": false, "routes": true },
      "migration": { "timestamps": true, "primary_key": "id", "softDeletes": false }
    }
  ],
  "services": ["auth"|"email"|"cache"|"websockets"|"queue"|"file-upload"],
  "laravel": { "pattern": "api-only|full|minimal", "auth": "sanctum|passport|none", "php_version": "8.4", "laravel_version": "12", "db_engine": "mysql|postgresql|sqlite" },
  "express": { "architecture": "layered|mvc|minimal", "database": "prisma|sequelize|typeorm|mongoose|none", "db_engine": "postgresql|mysql|sqlite|mongodb", "auth": "jwt|none" },
  "nestjs": { "architecture": "modular|cqrs|layered", "database": "prisma|typeorm|mongoose|none", "db_engine": "postgresql|mysql|sqlite|mongodb", "swagger": true, "auth": "jwt|none" },
  "fastapi": { "architecture": "layered|flat|feature-based", "orm": "sqlmodel|sqlalchemy|tortoise-orm|none", "db_engine": "postgresql|mysql|sqlite|mongodb", "auth": "jwt|none", "migrations": true, "cors": true, "swagger": true, "rate_limiting": false, "background_tasks": false, "websockets": false, "runner": "none", "python_version": "3.12", "async_mode": true }
}

Rules:
- Detect stack from dependencies: laravel/framework → "laravel", express + react → "express+react", @nestjs/core → "nestjs", fastapi → "fastapi", etc.
- Only include the stack-specific config object that matches the detected stack (e.g. only "laravel" if it's a Laravel project)
- Extract ALL models with fields — infer types from column names (email→string, price→decimal, is_*→boolean, *_at→datetime, *_id→foreignId, content/body/description→text)
- services: detect from dependencies (nodemailer/mail → "email", redis/ioredis/cache → "cache", bull/bullmq/celery → "queue", socket.io/ws → "websockets", multer/storage → "file-upload", auth middleware → "auth")
- Skip pivot/junction tables (they appear as belongsToMany relations)
- If models array would be empty (e.g. empty repo), return empty array
`
}

export function extractOwnerRepo(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match
  return { owner, repo: repo.replace(/\.git$/, '') }
}
