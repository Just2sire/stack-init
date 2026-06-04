'use client'

import { useState } from 'react'
import { Save, Check, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/lib/supabase/use-user'
import { useWizardStore } from '@/stores/useWizardStore'
import { useTranslations } from 'next-intl'

export function SaveConfigButton() {
  const { user, loading } = useUser()
  const getConfig = useWizardStore(s => s.getConfig)
  const projectName = useWizardStore(s => s.projectName)
  const t = useTranslations('dashboard')

  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [name, setName]         = useState('')
  const [showForm, setShowForm] = useState(false)

  if (loading) return null

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-2 px-4 py-2 text-sm border border-zinc-700 rounded-lg text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
      >
        <LogIn size={14} />
        {t('signInToSave')}
      </Link>
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const config = getConfig()
    const res = await fetch('/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || projectName || 'Mon projet',
        description: `Stack: ${config.stack}`,
        stack_config: config,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? t('saveError'))
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
    setShowForm(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-green-400">
        <Check size={14} />
        {t('saved')}
      </div>
    )
  }

  if (showForm) {
    return (
      <form onSubmit={handleSave} className="flex items-center gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 w-44"
          placeholder={projectName || t('configNamePlaceholder')}
          autoFocus
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-1.5 text-sm bg-white text-black rounded-lg font-medium hover:bg-zinc-100 disabled:opacity-50"
        >
          {saving ? t('saving') : 'OK'}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-xs text-zinc-500 hover:text-white"
        >
          {t('cancel')}
        </button>
      </form>
    )
  }

  return (
    <button
      onClick={() => { setName(projectName || ''); setShowForm(true) }}
      className="flex items-center gap-2 px-4 py-2 text-sm border border-zinc-700 rounded-lg text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
    >
      <Save size={14} />
      {t('saveButton')}
    </button>
  )
}
