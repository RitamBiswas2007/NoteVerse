-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Ensure peer_notes table has the correct columns for Multi-File Uploads and Metadata
alter table peer_notes 
add column if not exists files jsonb default '[]'::jsonb,
add column if not exists author_name text,
add column if not exists university text default 'NoteVerse University',
add column if not exists country text default 'Global';

-- 2. Verify and Update RLS Policies (Allow Authenticated Uploads)
-- Drop existing policy if it conflicts or is too restrictive
drop policy if exists "Users can upload their own notes" on peer_notes;

create policy "Users can upload their own notes"
on peer_notes for insert
to authenticated
with check (auth.uid() = author_id);

-- 3. Allow updates for owners
drop policy if exists "Users can update their own notes" on peer_notes;

create policy "Users can update their own notes"
on peer_notes for update
to authenticated
using (auth.uid() = author_id);

-- 4. Allow read access for everyone (or authenticated)
drop policy if exists "Notes are viewable by everyone" on peer_notes;

create policy "Notes are viewable by everyone"
on peer_notes for select
to public
using (true);

-- 5. Optional: Data Migration for old single-file notes
-- If you have rows with 'file_url' but empty 'files', migrate them.
update peer_notes 
set files = jsonb_build_array(
  jsonb_build_object(
    'name', 'Legacy_Document.pdf', 
    'url', file_url
  )
)
where (files is null or jsonb_array_length(files) = 0) 
  and file_url is not null 
  and file_url != '';
