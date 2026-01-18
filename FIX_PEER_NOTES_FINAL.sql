-- ================================================================
-- FINAL PEER NOTES FIX
-- 1. Adds missing columns (including 'file_url' required by your app)
-- 2. Sets up proper RLS policies
-- 3. Safely runs data migration
-- ================================================================

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.peer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  author_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Missing Columns safely
ALTER TABLE public.peer_notes 
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS university TEXT DEFAULT 'NoteVerse University',
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Global',
  ADD COLUMN IF NOT EXISTS file_url TEXT, -- Adding this because your app tries to write to it!
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Reset RLS Policies
ALTER TABLE public.peer_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notes are viewable by everyone" ON public.peer_notes;
DROP POLICY IF EXISTS "Users can upload their own notes" ON public.peer_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.peer_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.peer_notes;

CREATE POLICY "Notes are viewable by everyone"
ON public.peer_notes FOR SELECT
USING (true);

CREATE POLICY "Users can upload their own notes"
ON public.peer_notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own notes"
ON public.peer_notes FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own notes"
ON public.peer_notes FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- 4. Data Migration (Now safe because file_url exists)
-- This will only run for rows that might verify the condition (likely 0 if column is new, which is fine)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'peer_notes' AND column_name = 'file_url') THEN
    UPDATE public.peer_notes 
    SET files = jsonb_build_array(
      jsonb_build_object(
        'name', 'Legacy_Document.pdf', 
        'url', file_url
      )
    )
    WHERE (files IS NULL OR jsonb_array_length(files) = 0) 
      AND file_url IS NOT NULL 
      AND file_url != '';
  END IF;
END $$;
