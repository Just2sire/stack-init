-- Table : configurations de projets sauvegardées par les utilisateurs
create table if not exists public.user_configs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  stack_config jsonb not null,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index pour les requêtes par user_id
create index if not exists user_configs_user_id_idx on public.user_configs(user_id);

-- Mise à jour automatique de updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_configs_updated_at
  before update on public.user_configs
  for each row execute procedure public.handle_updated_at();

-- Row Level Security
alter table public.user_configs enable row level security;

create policy "Users can view their own configs"
  on public.user_configs for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert their own configs"
  on public.user_configs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own configs"
  on public.user_configs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own configs"
  on public.user_configs for delete
  using (auth.uid() = user_id);
