-- 1. Create the profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text,
  display_name text,
  avatar_url text,
  website text,
  bio text,
  education_level text check (education_level in ('high_school', 'undergraduate', 'graduate', 'postgraduate', 'other')),
  subjects text[]
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create policies (drop existing ones first to avoid errors)
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 4. Create the trigger function for NEW users
create or replace function public.handle_new_user() 
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username)
  values (new.id, new.raw_user_meta_data ->> 'display_name', new.email);
  return new;
end;
$$;

-- 5. Attach the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. BACKFILL EXISTING USERS (Crucial step for your case!)
-- This copies everyone currently in Authentication into the Profiles table
insert into public.profiles (id, username, display_name)
select 
  id, 
  email,
  raw_user_meta_data ->> 'display_name'
from auth.users
on conflict (id) do nothing;
