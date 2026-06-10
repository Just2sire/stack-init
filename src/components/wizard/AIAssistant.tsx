'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Sparkles, X, Loader2, Send, ChevronDown, ChevronUp, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/lib/supabase/use-user'
import { useWizardStore, type StepId } from '@/stores/useWizardStore'
import type { Model, ServiceId } from '@/types/schema'

interface AIAssistantProps {
  step: StepId
  /** Optional placeholder question shown in the input */
  placeholder?: string
}

interface AssistResult {
  recommendation?: string
  reasoning?: string
  tips?: string[]
  recommended?: string[]
  suggestion?: string
  modelsToAdd?: Array<{ name: string; reason: string }>
  fieldsToAdd?: Array<{ model: string; field: string; type: string; reason: string }>
  services?: string[]
  [key: string]: unknown
}

function makeDefaultModel(name: string): Model {
  return {
    name,
    fields: [],
    relations: [],
    generate: {
      migration: true, controller: true, resource: true, request: true,
      policy: false, factory: true, seeder: false, swagger: false,
      softDelete: false, repository: false, service: false, tests: false, routes: true,
    },
    migration: { timestamps: true, primary_key: 'id', softDeletes: false },
  }
}

export function AIAssistant({ step, placeholder }: AIAssistantProps) {
  const t = useTranslations('wizard')
  const { user, loading } = useUser()
  const { getConfig, addModel, toggleService, enabledServices, setIsAuthModalOpen } = useWizardStore()

  const [isOpen, setIsOpen]         = useState(false)
  const [question, setQuestion]     = useState('')
  const [isAsking, setIsAsking]     = useState(false)
  const [result, setResult]         = useState<AssistResult | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [applied, setApplied]       = useState(false)

  if (loading) return null

  // Show locked state if not logged in
  if (!user) {
    return (
      <div className="flex items-center gap-2 text-xs text-text3">
        <Sparkles size={13} className="text-text3" />
        <span>AI assist —</span>
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="underline hover:text-gold flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
        >
          <LogIn size={11} /> {t('assistant.signIn')}
        </button>
      </div>
    )
  }

  async function ask() {
    if (!question.trim() && !isOpen) { setIsOpen(true); return }
    if (!question.trim()) return
    setIsAsking(true)
    setError(null)
    setResult(null)
    setApplied(false)
    try {
      const config = getConfig()
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, context: config, question }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'AI error'); return }
      setResult(data.result as AssistResult)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setIsAsking(false)
    }
  }

  function applyResult() {
    if (!result) return
    let applied = false

    // Add suggested models
    if (result.modelsToAdd?.length) {
      result.modelsToAdd.forEach(({ name }) => addModel(makeDefaultModel(name)))
      applied = true
    }

    // Enable recommended services
    if (result.recommended?.length) {
      result.recommended.forEach((svcId) => {
        if (!enabledServices.includes(svcId as ServiceId)) {
          toggleService(svcId as ServiceId)
        }
      })
      applied = true
    }

    if (applied) setApplied(true)
  }

  const hasApplicableAction = result && (
    (result.modelsToAdd && result.modelsToAdd.length > 0) ||
    (result.recommended && result.recommended.length > 0)
  )

  return (
    <div className="rounded-xl border border-gold/20 bg-gold/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-gold" />
          <span className="text-xs font-semibold text-gold">{t('assistant.label')}</span>
          <span className="text-[10px] text-text3">{t('assistant.contextAware')}</span>
        </div>
        {isOpen
          ? <ChevronUp size={14} className="text-gold" />
          : <ChevronDown size={14} className="text-gold" />
        }
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-gold/10">
          {/* Input */}
          <div className="flex gap-2 pt-3">
            <input
              type="text"
              value={question}
              onChange={e => { setQuestion(e.target.value); setError(null) }}
              onKeyDown={e => { if (e.key === 'Enter') ask() }}
              placeholder={placeholder ?? t('assistant.defaultPlaceholder')}
              className="si-input flex-1 text-xs"
              autoFocus
            />
            <button
              onClick={ask}
              disabled={isAsking}
              className="si-btn-primary px-3 py-2 gap-1.5 shrink-0 text-xs"
            >
              {isAsking
                ? <Loader2 size={13} className="animate-spin" />
                : <Send size={13} />
              }
              {isAsking ? t('assistant.thinking') : t('assistant.ask')}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2 text-xs">
              {(result.recommendation || result.suggestion) && (
                <p className="text-text font-medium">
                  {String(result.recommendation ?? result.suggestion)}
                </p>
              )}

              {result.reasoning && (
                <p className="text-text3 leading-relaxed">{String(result.reasoning)}</p>
              )}

              {result.tips && result.tips.length > 0 && (
                <ul className="space-y-1 text-text3">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-gold shrink-0">·</span>
                      <span>{String(tip)}</span>
                    </li>
                  ))}
                </ul>
              )}

              {result.modelsToAdd && result.modelsToAdd.length > 0 && (
                <div className="space-y-1">
                  <p className="text-text3 font-semibold uppercase tracking-wider text-[10px]">{t('assistant.modelsToAdd')}</p>
                  {result.modelsToAdd.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-mono text-gold">{m.name}</span>
                      <span className="text-text3">— {m.reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.recommended && result.recommended.length > 0 && (
                <div className="space-y-1">
                  <p className="text-text3 font-semibold uppercase tracking-wider text-[10px]">{t('assistant.servicesToEnable')}</p>
                  <div className="flex flex-wrap gap-1">
                    {result.recommended.map((svc, i) => (
                      <span key={i} className="font-mono text-[10px] px-2 py-0.5 rounded border border-gold/30 text-gold bg-gold/10">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {applied && (
                <p className="text-green-400 font-medium">{t('assistant.applied')}</p>
              )}

              {hasApplicableAction && !applied && (
                <button
                  onClick={applyResult}
                  className="si-btn-primary text-xs px-4 py-1.5 gap-1"
                >
                  <Sparkles size={12} />
                  {t('assistant.applySuggestions')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
