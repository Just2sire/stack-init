'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ExternalLink, Globe, Lock } from 'lucide-react'
import { compressConfig } from '@/lib/sharing'
import type { ProjectConfig } from '@/types/schema'
import { useTranslations } from 'next-intl'

interface Config {
  id: string
  name: string
  description: string | null
  stack_config: Record<string, unknown>
  is_public: boolean
  created_at: string
  updated_at: string
}

export function DashboardClient({ initialConfigs }: { initialConfigs: Config[] }) {
  const [configs, setConfigs] = useState<Config[]>(initialConfigs)
  const router = useRouter()
  const t = useTranslations('dashboard')

  async function deleteConfig(id: string) {
    if (!confirm(t('deleteConfirm'))) return
    await fetch(`/api/configs/${id}`, { method: 'DELETE' })
    setConfigs(c => c.filter(x => x.id !== id))
  }

  function loadConfig(config: Config) {
    const compressed = compressConfig(config.stack_config as unknown as ProjectConfig)
    router.push(`/create?c=${compressed}`)
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p className="text-4xl mb-4">📦</p>
        <p className="text-sm">{t('emptyTitle')}</p>
        <p className="text-xs mt-1">{t('emptyHint')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {configs.map(c => (
        <div
          key={c.id}
          className="border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{c.name}</h3>
              {c.description && (
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{c.description}</p>
              )}
            </div>
            <span className="ml-2 flex-shrink-0">
              {c.is_public
                ? <Globe size={12} className="text-zinc-500" />
                : <Lock size={12} className="text-zinc-600" />
              }
            </span>
          </div>

          <div className="text-xs text-zinc-500 mb-4">
            <span className="font-mono text-zinc-400">
              {(c.stack_config as { stack?: string }).stack ?? t('unknownStack')}
            </span>
            <span className="mx-2">·</span>
            {new Date(c.updated_at).toLocaleDateString('fr-FR')}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => loadConfig(c)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <ExternalLink size={11} />
              {t('loadButton')}
            </button>
            <button
              onClick={() => deleteConfig(c.id)}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
