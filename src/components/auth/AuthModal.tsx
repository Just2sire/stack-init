'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Mail, Lock, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useWizardStore } from '@/stores/useWizardStore'

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, getConfig } = useWizardStore()
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('auth')

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [error, setError]               = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  if (!isAuthModalOpen) return null

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { 
      setError(error.message)
      setLoading(false)
      return 
    }
    setIsAuthModalOpen(false)
    router.refresh()
  }

  async function handleGithubLogin() {
    // Save current wizard state before redirecting
    const config = getConfig()
    localStorage.setItem('wizard-backup', JSON.stringify(config))

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { 
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}` 
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div 
        className="relative w-full max-w-md bg-[var(--bg)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div className="flex items-center gap-3">
             <Image src="/favicon.svg" alt="StackInit" width={28} height={28} />
             <h2 className="font-[var(--font-syne)] text-xl font-extrabold tracking-tight text-[var(--text)]">
                Stack<span className="text-[var(--gold)]">Init</span>
             </h2>
          </div>
          <button 
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-lg hover:bg-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-lg font-bold text-[var(--text)] mb-1">
              {t('signInTitle')}
            </h1>
            <p className="text-sm text-[var(--text3)]">
              {t('signInSubtitle')}
            </p>
          </div>

          {/* GitHub OAuth */}
          <button
            onClick={handleGithubLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--bg3)] border border-[var(--border-medium)] rounded-xl text-[var(--text)] font-semibold text-sm hover:bg-[var(--bg4)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            {t('signInWithGithub')}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text3)]">{t('orByEmail')}</span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-xs text-red-500 font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-[11px] font-bold text-[var(--text2)] uppercase tracking-wider mb-2">
                <Mail size={12} className="text-[var(--text3)]" />
                {t('emailLabel')}
              </label>
              <div className={`relative rounded-xl border-2 bg-[var(--bg3)] transition-all duration-200 ${focusedField === 'email' ? 'border-[var(--gold)] ring-4 ring-[var(--gold)]/10' : 'border-[var(--border-subtle)]'}`}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-sm text-[var(--text)] placeholder:text-[var(--text3)] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-[11px] font-bold text-[var(--text2)] uppercase tracking-wider mb-2">
                <Lock size={12} className="text-[var(--text3)]" />
                {t('passwordLabel')}
              </label>
              <div className={`relative flex items-center rounded-xl border-2 bg-[var(--bg3)] transition-all duration-200 ${focusedField === 'password' ? 'border-[var(--gold)] ring-4 ring-[var(--gold)]/10' : 'border-[var(--border-subtle)]'}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder={t('passwordPlaceholder')}
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-sm text-[var(--text)] placeholder:text-[var(--text3)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-[var(--text3)] hover:text-[var(--text)] transition-colors mr-2"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--gold)] text-[var(--bg)] font-bold text-sm rounded-xl shadow-lg shadow-[var(--gold)]/20 hover:shadow-[var(--gold)]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--bg)]/20 border-t-[var(--bg)] rounded-full animate-spin" />
                  {t('signingIn')}
                </div>
              ) : t('signInButton')}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm">
             <span className="text-[var(--text3)]">{t('noAccount')} </span>
             <button 
               onClick={() => router.push('/auth/register')}
               className="text-[var(--gold)] font-bold hover:underline"
             >
               {t('createAccountLink')}
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}
