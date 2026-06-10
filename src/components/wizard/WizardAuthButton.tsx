'use client'

import { LayoutDashboard, LogIn } from 'lucide-react'
import { useUser } from '@/lib/supabase/use-user'
import { useTranslations } from 'next-intl'
import { useWizardStore } from '@/stores/useWizardStore'
import Link from 'next/link'

export function WizardAuthButton() {
  const { user, loading } = useUser()
  const { setIsAuthModalOpen } = useWizardStore()
  const t = useTranslations('auth')

  if (loading) return (
    <div style={{ width: 100, height: 32, background: 'var(--bg3)', borderRadius: 8, opacity: 0.5 }} />
  )

  if (user) {
    return (
      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8,
          fontSize: 13, color: 'var(--text2)',
          fontWeight: 500, textDecoration: 'none',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg2)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.background = 'var(--bg3)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg2)'; }}
      >
        <LayoutDashboard size={14} />
        {t('dashboard')}
      </Link>
    )
  }

  return (
    <button
      onClick={() => setIsAuthModalOpen(true)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 8,
        fontSize: 13, color: 'var(--text2)',
        fontWeight: 500, border: '1px solid var(--border-subtle)',
        background: 'var(--bg2)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.color = 'var(--gold)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text2)'; }}
    >
      <LogIn size={14} />
      {t('signIn')}
    </button>
  )
}
