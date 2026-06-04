import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: configs } = await supabase
    .from('user_configs')
    .select('id, name, description, stack_config, is_public, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const t = await getTranslations('dashboard')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {t('backLink')}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 truncate min-w-0 max-w-[160px]">{user.email}</span>
          <form action="/auth/logout" method="POST">
            <button className="text-xs text-zinc-500 hover:text-white transition-colors">
              {t('logout')}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {t('configCount', { count: configs?.length ?? 0 })}
            </p>
          </div>
          <Link
            href="/create"
            className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-100 transition-colors"
          >
            {t('newProject')}
          </Link>
        </div>

        <DashboardClient initialConfigs={configs ?? []} />
      </main>
    </div>
  )
}
