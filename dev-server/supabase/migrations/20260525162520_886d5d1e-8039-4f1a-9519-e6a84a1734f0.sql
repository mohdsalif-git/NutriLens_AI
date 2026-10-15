
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age int,
  sex text,
  weight_kg numeric,
  height_cm numeric,
  goal text default 'maintain',
  daily_calorie_goal int default 2000,
  conditions text[] default '{}',
  onboarded boolean default false,
  streak_days int default 0,
  last_log_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Meal logs
create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dish_id text,
  dish_name text not null,
  emoji text,
  calories int not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric not null default 0,
  health_score int,
  eaten_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.meal_logs enable row level security;

create policy "Users view own meals" on public.meal_logs for select using (auth.uid() = user_id);
create policy "Users insert own meals" on public.meal_logs for insert with check (auth.uid() = user_id);
create policy "Users update own meals" on public.meal_logs for update using (auth.uid() = user_id);
create policy "Users delete own meals" on public.meal_logs for delete using (auth.uid() = user_id);

create index meal_logs_user_eaten_idx on public.meal_logs(user_id, eaten_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
