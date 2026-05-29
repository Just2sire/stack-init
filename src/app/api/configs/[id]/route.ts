import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAuthorizedConfig(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, id: string) {
  return supabase
    .from('user_configs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await getAuthorizedConfig(supabase, user.id, id)
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, stack_config, is_public } = body

  const { data, error } = await supabase
    .from('user_configs')
    .update({ name, description, stack_config, is_public, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, name, updated_at')
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('user_configs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
