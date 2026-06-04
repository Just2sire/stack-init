'use client'

import Link from 'next/link'
import { LayoutDashboard, LogIn } from 'lucide-react'
import { useUser } from '@/lib/supabase/use-user'
import { useTranslations } from 'next-intl'

export function NavAuthButton() {
  const { user, loading } = useUser()
  const t = useTranslations('auth')

  if (loading) return null

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
        }}
      >
        <LayoutDashboard size={14} />
        {t('dashboard')}
      </Link>
    )
  }

  return (
    <Link
      href="/auth/login"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 8,
        fontSize: 13, color: 'var(--text2)',
        fontWeight: 500, textDecoration: 'none',
      }}
    >
      <LogIn size={14} />
      {t('signIn')}
    </Link>
  )
}
