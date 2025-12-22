-- Supabase schema for Finanças Desktop

create type transaction_type as enum ('expense', 'income', 'transfer');
create type category_allowed_type as enum ('expense', 'income', 'both');

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  created_at timestamptz default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  initial_balance numeric(12,2) not null default 0,
  archived boolean not null default false,
  include_in_monthly_summary boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  parent_id uuid references categories (id) on delete set null,
  allowed_type category_allowed_type not null default 'expense',
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  description text not null,
  note text,
  type transaction_type not null,
  amount numeric(12,2) not null,
  account_id uuid references accounts (id) on delete set null,
  account_from_id uuid references accounts (id) on delete set null,
  account_to_id uuid references accounts (id) on delete set null,
  category_id uuid references categories (id) on delete set null,
  cleared boolean not null default false,
  installment_group_id uuid,
  installment_index int,
  installment_total int,
  recurrence_rule jsonb,
  created_at timestamptz not null default now(),
  constraint transactions_type_consistency check (
    (
      type in ('expense', 'income')
      and account_id is not null
      and category_id is not null
      and account_from_id is null
      and account_to_id is null
    )
    or (
      type = 'transfer'
      and account_from_id is not null
      and account_to_id is not null
      and account_id is null
      and category_id is null
    )
  )
);

create index if not exists accounts_user_id_idx on accounts (user_id);
create index if not exists categories_user_id_idx on categories (user_id);
create index if not exists transactions_user_date_idx on transactions (user_id, date);
create index if not exists transactions_account_id_idx on transactions (account_id);
create index if not exists transactions_category_id_idx on transactions (category_id);
create index if not exists transactions_cleared_idx on transactions (cleared);

create or replace function public.set_user_id()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

create trigger set_user_id_accounts
before insert on accounts
for each row
execute function public.set_user_id();

create trigger set_user_id_categories
before insert on categories
for each row
execute function public.set_user_id();

create trigger set_user_id_transactions
before insert on transactions
for each row
execute function public.set_user_id();

alter table profiles enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;

create policy "Profiles are self" on profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Accounts are owned by user" on accounts
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Categories are owned by user" on categories
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Transactions are owned by user" on transactions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
