-- 1. Create User Connections Table
create table if not exists public.user_connections (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamptz default now(),
  unique(requester_id, receiver_id)
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_connections enable row level security;

-- 3. Reset Policies (Fixing "Already Exists" Errors)
drop policy if exists "Users can view their own connections" on public.user_connections;
drop policy if exists "Users can create connection requests" on public.user_connections;
drop policy if exists "Users can update their own received requests" on public.user_connections;

-- 4. Create Policies
create policy "Users can view their own connections"
on public.user_connections for select
using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "Users can create connection requests"
on public.user_connections for insert
with check (auth.uid() = requester_id);

create policy "Users can update their own received requests"
on public.user_connections for update
using (auth.uid() = receiver_id);
