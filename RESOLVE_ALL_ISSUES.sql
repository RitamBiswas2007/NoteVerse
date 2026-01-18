-- ==========================================
-- 1. STORAGE BUCKET SETUP
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12c_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12c_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12c_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok12c_3" ON storage.objects;

-- Create fresh storage policies
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

-- ==========================================
-- 2. PEER REQUESTS POLICIES (Fixing your error)
-- ==========================================
ALTER TABLE peer_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent "policy already exists" errors
DROP POLICY IF EXISTS "Public requests are viewable by everyone" ON peer_requests;
DROP POLICY IF EXISTS "Peer requests are viewable by everyone" ON peer_requests; -- Dropping the potential duplicate name
DROP POLICY IF EXISTS "Users can create their own requests" ON peer_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON peer_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON peer_requests;

-- Re-create Policies
CREATE POLICY "Public requests are viewable by everyone" 
ON peer_requests FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own requests" 
ON peer_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
ON peer_requests FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests" 
ON peer_requests FOR DELETE 
USING (auth.uid() = user_id);

-- ==========================================
-- 3. PEER NOTES POLICIES (Ensuring uploads work)
-- ==========================================
ALTER TABLE peer_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notes are viewable by everyone" ON peer_notes;
DROP POLICY IF EXISTS "Users can upload their own notes" ON peer_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON peer_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON peer_notes;

CREATE POLICY "Notes are viewable by everyone"
ON peer_notes FOR SELECT
USING (true);

CREATE POLICY "Users can upload their own notes"
ON peer_notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own notes"
ON peer_notes FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own notes"
ON peer_notes FOR DELETE
TO authenticated
USING (auth.uid() = author_id);
