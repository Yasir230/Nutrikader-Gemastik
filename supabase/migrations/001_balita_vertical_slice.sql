-- NutriKader Hybrid — Balita vertical slice
-- PostgreSQL/Supabase migration.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('admin','warga')),
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_token_hash_idx on public.sessions(token_hash);
create index if not exists sessions_expires_at_idx on public.sessions(expires_at);

create table if not exists public.balita (
  id text primary key,
  nik text not null unique,
  nama text not null,
  jenis_kelamin text not null check (jenis_kelamin in ('L','P')),
  tanggal_lahir date not null,
  posyandu_id text not null,
  posyandu_nama text not null,
  kelurahan text not null,
  nama_ibu text not null,
  berat_lahir numeric(5,2) not null default 0,
  tinggi_lahir numeric(5,2) not null default 0,
  usia_bulan integer not null default 0,
  risiko text not null check (risiko in ('rendah','sedang','tinggi')),
  alasan_risiko jsonb not null default '[]'::jsonb,
  pengukuran jsonb not null default '[]'::jsonb,
  imunisasi jsonb not null default '[]'::jsonb,
  penerimaan_mbg jsonb not null default '[]'::jsonb,
  penerima_mbg boolean not null default false,
  status_posyandu text not null check (status_posyandu in ('aktif','lulus')),
  catatan_kader text,
  foto_seed text not null default 'default',
  version integer not null default 1,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists balita_updated_at_idx on public.balita(updated_at);
create index if not exists balita_posyandu_idx on public.balita(posyandu_id);

-- Row-level security is enabled. The API uses the service-role key only on the server,
-- after its own session/role authorization check.
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.balita enable row level security;

-- Password verification is kept inside PostgreSQL; plaintext passwords never enter
-- the users table. The function is callable by the server-side service role.
create or replace function public.verify_user_password(p_email text, p_password text)
returns table (
  id uuid,
  email text,
  name text,
  role text,
  avatar text
)
language sql
security definer
set search_path = public, extensions
as $$
  select u.id, u.email, u.name, u.role, u.avatar
  from public.users u
  where lower(u.email) = lower(trim(p_email))
    and u.password_hash = extensions.crypt(p_password, u.password_hash)
  limit 1;
$$;

revoke all on function public.verify_user_password(text,text) from public;
grant execute on function public.verify_user_password(text,text) to service_role;

create or replace function public.seed_user(
  p_email text,
  p_password text,
  p_name text,
  p_role text
)
returns uuid
language sql
security definer
set search_path = public, extensions
as $$
  insert into public.users(email, password_hash, name, role)
  values (lower(trim(p_email)), extensions.crypt(p_password, extensions.gen_salt('bf', 12)), p_name, p_role)
  on conflict (email) do update
    set password_hash = excluded.password_hash,
        name = excluded.name,
        role = excluded.role,
        updated_at = now()
  returning id;
$$;

revoke all on function public.seed_user(text,text,text,text) from public;
grant execute on function public.seed_user(text,text,text,text) to service_role;
