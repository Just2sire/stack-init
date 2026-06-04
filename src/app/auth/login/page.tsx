'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Zap, Layers, Database, GitBranch } from 'lucide-react'
import { useTranslations } from 'next-intl'

/* ─── Login Form ────────────────────────────────────────────────────── */

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const supabase = createClient()
  const t = useTranslations('auth')

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [error, setError]               = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(redirectTo)
    router.refresh()
  }

  async function handleGithubLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
    })
    if (error) setError(error.message)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)',
    }}>
      {/* ── Left Panel — Decorative ────────────────────────────────── */}
      <div className="hidden lg:flex" style={{
        flex: '0 0 45%', position: 'relative', overflow: 'hidden',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border-subtle)',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '60px 48px',
      }}>
        {/* Background grid pattern */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(245,200,66,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,200,66,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
        }} />

        {/* Radial glow */}
        <div aria-hidden style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 380, textAlign: 'center' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
            <Image src="/favicon.svg" alt="StackInit" width={32} height={32} />
            <span style={{
              fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 800,
              letterSpacing: '-0.02em', color: 'var(--text)',
            }}>
              Stack<span style={{ color: 'var(--gold)' }}>Init</span>
            </span>
          </Link>

          {/* Tagline */}
          <h2 style={{
            fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800,
            lineHeight: 1.2, color: 'var(--text)', marginBottom: 16,
            letterSpacing: '-0.03em',
          }}>
            {t('tagline1')}
            <br />
            <span style={{ color: 'var(--gold)' }}>{t('taglineGold')}</span>
          </h2>
          <p style={{
            fontSize: 14, color: 'var(--text2)', lineHeight: 1.6,
            marginBottom: 40,
          }}>
            {t('taglineDesc')}
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: Layers, text: t('featureVisual'), color: 'var(--gold)' },
              { icon: Database, text: t('featureSql'), color: 'var(--blue)' },
              { icon: GitBranch, text: t('featureRelations'), color: 'var(--purple)' },
              { icon: Zap, text: t('featureDownload'), color: 'var(--green)' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', borderRadius: 10,
                background: 'var(--bg3)',
                border: '1px solid var(--border-subtle)',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}40`
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${color}12`, border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ───────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '40px 24px', position: 'relative',
      }}>
        {/* Back to home */}
        <Link
          href="/"
          style={{
            position: 'absolute', top: 24, left: 24,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'var(--text3)', textDecoration: 'none',
            padding: '6px 12px', borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text)'
            e.currentTarget.style.borderColor = 'var(--border-medium)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text3)'
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
          }}
        >
          <ArrowLeft size={14} />
          {t('backHome')}
        </Link>

        {/* Mobile logo (visible on small screens) */}
        <Link href="/" className="lg:hidden" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', marginBottom: 32,
        }}>
          <Image src="/favicon.svg" alt="StackInit" width={28} height={28} />
          <span style={{
            fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 800,
            letterSpacing: '-0.02em', color: 'var(--text)',
          }}>
            Stack<span style={{ color: 'var(--gold)' }}>Init</span>
          </span>
        </Link>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800,
              color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em',
            }}>
              {t('signInTitle')}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.5 }}>
              {t('signInSubtitle')}
            </p>
          </div>

          {/* GitHub OAuth */}
          <button
            onClick={handleGithubLogin}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 10,
              background: 'var(--bg3)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg4)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg3)'
              e.currentTarget.style.borderColor = 'var(--border-medium)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            {t('signInWithGithub')}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{
              fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.08em', fontWeight: 600,
            }}>{t('orByEmail')}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,77,109,0.08)',
                border: '1px solid rgba(255,77,109,0.2)',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--red)', flexShrink: 0,
                  boxShadow: '0 0 8px rgba(255,77,109,0.5)',
                }} />
                <span style={{ fontSize: 13, color: 'var(--red)', lineHeight: 1.4 }}>{error}</span>
              </div>
            )}

            {/* Email field */}
            <div>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600, color: 'var(--text2)',
                marginBottom: 8, letterSpacing: '0.02em',
              }}>
                <Mail size={12} style={{ color: 'var(--text3)' }} />
                Email
              </label>
              <div style={{
                position: 'relative', borderRadius: 10,
                border: `1.5px solid ${focusedField === 'email' ? 'var(--gold)' : 'var(--border-subtle)'}`,
                background: 'var(--bg3)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(245,200,66,0.1)' : 'none',
                outline: 'none',
              }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="email"
                  placeholder={t('emailPlaceholder')}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'transparent',
                    border: 'none', borderWidth: 0,
                    outline: 'none', outlineWidth: 0,
                    color: 'var(--text)', fontSize: 14,
                    fontFamily: 'inherit',
                    boxShadow: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600, color: 'var(--text2)',
                marginBottom: 8, letterSpacing: '0.02em',
              }}>
                <Lock size={12} style={{ color: 'var(--text3)' }} />
                Mot de passe
              </label>
              <div style={{
                position: 'relative', borderRadius: 10,
                border: `1.5px solid ${focusedField === 'password' ? 'var(--gold)' : 'var(--border-subtle)'}`,
                background: 'var(--bg3)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(245,200,66,0.1)' : 'none',
                display: 'flex', alignItems: 'center',
                outline: 'none',
              }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    flex: 1, padding: '12px 14px',
                    background: 'transparent',
                    border: 'none', borderWidth: 0,
                    outline: 'none', outlineWidth: 0,
                    color: 'var(--text)', fontSize: 14,
                    fontFamily: 'inherit',
                    boxShadow: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none', border: 'none', borderWidth: 0,
                    outline: 'none', outlineWidth: 0,
                    cursor: 'pointer',
                    padding: '8px 12px', color: 'var(--text3)',
                    transition: 'color 0.2s',
                    display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
                  tabIndex={-1}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px 20px', borderRadius: 10,
                background: 'var(--gold)', color: 'var(--bg)',
                fontSize: 14, fontWeight: 700, border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 24px rgba(245,200,66,0.2), 0 2px 8px rgba(0,0,0,0.3)',
                opacity: loading ? 0.6 : 1,
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 0 36px rgba(245,200,66,0.35), 0 4px 12px rgba(0,0,0,0.4)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 24px rgba(245,200,66,0.2), 0 2px 8px rgba(0,0,0,0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(0,0,0,0.15)',
                    borderTopColor: 'var(--bg)', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                    display: 'inline-block',
                  }} />
                  {t('signingIn')}
                </span>
              ) : t('signInButton')}
            </button>
          </form>

          {/* Footer links */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 4,
            marginTop: 28, fontSize: 13,
          }}>
            <span style={{ color: 'var(--text3)' }}>{t('noAccount')}</span>
            <Link
              href="/auth/register"
              style={{
                color: 'var(--gold)', textDecoration: 'none', fontWeight: 600,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {t('createAccountLink')}
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 20,
        }}>
          {[t('footerPrivacy'), t('footerTerms'), t('footerHelp')].map((item) => (
            <span key={item} style={{
              fontSize: 11, color: 'var(--text3)',
              cursor: 'pointer', transition: 'color 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text2)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Page Wrapper ──────────────────────────────────────────────────── */

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', color: 'var(--text3)',
        fontFamily: 'var(--font-jetbrains-mono)', fontSize: 13,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            width: 14, height: 14, border: '2px solid var(--border-subtle)',
            borderTopColor: 'var(--gold)', borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            display: 'inline-block',
          }} />
          {/* Static fallback — useTranslations not available outside component tree */}
          Loading...
        </span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
