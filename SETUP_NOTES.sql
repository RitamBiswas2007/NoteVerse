-- Create peer_notes table
CREATE TABLE IF NOT EXISTS public.peer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  author_name TEXT, 
  files JSONB DEFAULT '[]'::jsonb, -- Store array of {name, url}
  university TEXT,
  country TEXT,
  description TEXT,
  upvotes INT DEFAULT 0,
  views INT DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  search_vector TSVECTOR
);

-- Enable RLS
ALTER TABLE public.peer_notes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Notes are viewable by everyone" ON public.peer_notes;
CREATE POLICY "Notes are viewable by everyone"
  ON public.peer_notes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can upload their own notes" ON public.peer_notes;
CREATE POLICY "Users can upload their own notes"
  ON public.peer_notes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.peer_notes;
CREATE POLICY "Users can update their own notes"
  ON public.peer_notes FOR UPDATE
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.peer_notes;
CREATE POLICY "Users can delete their own notes"
  ON public.peer_notes FOR DELETE
  USING (auth.uid() = author_id);

-- Optional: Search index
CREATE INDEX IF NOT EXISTS peer_notes_title_idx ON public.peer_notes USING GIN (to_tsvector('english', title));
