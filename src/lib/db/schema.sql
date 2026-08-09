create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  torn_user_id bigint not null unique,
  encrypted_api_key text,
  api_key_version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists profile_current (
  profile_id uuid primary key references profiles(id) on delete cascade,
  captured_at timestamptz not null,
  level integer,
  rank text,
  networth numeric,
  money numeric,
  energy integer,
  nerve integer,
  happy integer,
  cooldowns jsonb,
  battle_stats jsonb,
  metrics jsonb not null default '{}'::jsonb
);

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null check (status in ('running','succeeded','partial','failed')),
  profiles_requested integer not null default 0,
  profiles_succeeded integer not null default 0,
  profiles_failed integer not null default 0,
  error_summary jsonb
);

create table if not exists sync_results (
  id uuid primary key default gen_random_uuid(),
  sync_run_id uuid not null references sync_runs(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  status text not null check (status in ('success','failed')),
  endpoint_summary jsonb,
  captured_at timestamptz not null default now(),
  error_code text,
  error_message text
);

create table if not exists metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  captured_at timestamptz not null,
  source_sync_id uuid references sync_runs(id) on delete set null,
  metrics jsonb not null
);

create index if not exists metric_snapshots_profile_time_idx
  on metric_snapshots(profile_id, captured_at desc);

create table if not exists daily_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  snapshot_date date not null,
  metrics jsonb not null,
  created_at timestamptz not null default now(),
  unique(profile_id, snapshot_date)
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  slot smallint not null check (slot between 1 and 3),
  goal_type text not null,
  target jsonb not null,
  deadline timestamptz,
  original_input text not null,
  normalized_goal jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, slot)
);

create table if not exists recommendation_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null check (status in ('running','succeeded','failed')),
  snapshot_captured_at timestamptz,
  goals jsonb not null,
  calculation_result jsonb,
  optimizer_result jsonb,
  ai_result jsonb,
  model_name text,
  error_message text
);

create table if not exists dashboard_layouts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  layout jsonb not null default '{}'::jsonb,
  theme_mode text not null default 'system' check (theme_mode in ('light','dark','system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_credentials (
  id boolean primary key default true check (id = true),
  shared_password_hash text not null,
  admin_password_hash text not null,
  updated_at timestamptz not null default now()
);
