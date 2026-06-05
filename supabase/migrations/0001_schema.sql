create extension if not exists "pgcrypto";

-- Perfil 1:1 com auth.users (todos administradores; sem RBAC).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modelers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Catálogo reutilizável; não pertence a cliente.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stock_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.filaments (
  id uuid primary key default gen_random_uuid(),
  color text not null,
  material text not null,
  brand text,
  weight text,
  low_stock_threshold integer not null default 0
    check (low_stock_threshold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Estoque por filamento+local: rolos em estoque e encomendados.
create table public.filament_stock (
  filament_id uuid not null references public.filaments (id) on delete cascade,
  location_id uuid not null references public.stock_locations (id) on delete cascade,
  in_stock integer not null default 0 check (in_stock >= 0),
  on_order integer not null default 0 check (on_order >= 0),
  updated_at timestamptz not null default now(),
  primary key (filament_id, location_id)
);

create type public.production_status as enum ('waiting', 'producing', 'done');
create type public.payment_status as enum ('unpaid', 'paid');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  seller_id uuid references public.sellers (id) on delete set null,
  modeler_id uuid references public.modelers (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  product_description text, -- preenchido quando o produto é ad-hoc (sem product_id)
  quantity integer not null default 1 check (quantity > 0),
  amount numeric(10, 2) not null default 0 check (amount >= 0),
  payment_status public.payment_status not null default 'unpaid',
  production_status public.production_status not null default 'waiting',
  queue_position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- garante que haja produto do catálogo OU descrição ad-hoc
  constraint product_present check (product_id is not null or product_description is not null)
);

-- Log único de auditoria (substitui histórico isolado de estoque).
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,            -- create | update | delete | status | priority | stock | payment
  entity_type text not null,       -- client | order | filament | ...
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Cria profile automaticamente ao surgir um usuário no Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
