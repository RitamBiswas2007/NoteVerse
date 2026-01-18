-- RESTORE NOTES VISIBILITY & PERMISSIONS
-- This script ensures that everyone can View notes, and Authors can Edit/Delete their own.
-- It explicitly grants Table permissions which are sometimes lost.

-- 1. Ensure RLS is enabled
ALTER TABLE public.peer_notes ENABLE ROW LEVEL SECURITY;

-- 2. RESET All Policies (Fresh Start for this table)
DROP POLICY IF EXISTS "Notes are viewable by everyone" ON public.peer_notes;
DROP POLICY IF EXISTS "Users can upload their own notes" ON public.peer_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.peer_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.peer_notes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.peer_notes;
DROP POLICY IF EXISTS "Public view" ON public.peer_notes;

-- 3. Re-create Correct Policies

-- Allow EVERYONE (Logged in or not) to SEE notes
CREATE POLICY "Notes are viewable by everyone"
ON public.peer_notes FOR SELECT
USING (true);

-- Allow Authenticated users to INSERT their own notes
CREATE POLICY "Users can upload their own notes"
ON public.peer_notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Allow Authenticated users to UPDATE their own notes
CREATE POLICY "Users can update their own notes"
ON public.peer_notes FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

-- Allow Authenticated users to DELETE their own notes
CREATE POLICY "Users can delete their own notes"
ON public.peer_notes FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- 4. GRANT BASIC PERMISSIONS (Crucial Step often missed)
GRANT SELECT ON public.peer_notes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.peer_notes TO authenticated;

-- 5. Force a cache refresh (Updates updated_at on a dummy row if exists, harmless)
-- This sometimes wakes up the API cache
UPDATE public.peer_notes SET updated_at = NOW() WHERE false;
