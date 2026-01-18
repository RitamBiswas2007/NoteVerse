-- ================================================================
-- FINAL DB FIX SCRIPT
-- This script proactively drops conflicting policies before creating them
-- to prevent "relation already exists" errors.
-- ================================================================

-- 1. PEER REQUESTS (Fixing the error you just saw)
-- ================================================================
ALTER TABLE public.peer_requests ENABLE ROW LEVEL SECURITY;

-- Drop ALL variations of potential existing policies
DROP POLICY IF EXISTS "Peer requests are viewable by everyone" ON public.peer_requests;
DROP POLICY IF EXISTS "Public requests are viewable by everyone" ON public.peer_requests;
DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.peer_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.peer_requests;
DROP POLICY IF EXISTS "Users can edit their own requests" ON public.peer_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON public.peer_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON public.peer_requests;

-- Now create the policies cleanly
CREATE POLICY "Peer requests are viewable by everyone" 
ON public.peer_requests FOR SELECT USING (true);

CREATE POLICY "Users can create their own requests" 
ON public.peer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
ON public.peer_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests" 
ON public.peer_requests FOR DELETE USING (auth.uid() = user_id);


-- 2. STORAGE BUCKET (Fixing the original "Bucket not found" error)
-- ================================================================
-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing storage policies to ensure a clean slate
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12c_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12c_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12c_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12c_3" ON storage.objects;

-- Create the correct storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'notes' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'notes' );

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'notes' AND auth.uid() = owner );

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'notes' AND auth.uid() = owner );


-- 3. PEER NOTES (Ensure this table is also correct)
-- ================================================================
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
