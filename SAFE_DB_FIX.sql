-- ================================================================
-- SAFE FIX SCRIPT
-- This script avoids "Ownership" errors by NOT altering system tables.
-- It works by:
-- 1. Cleaning up 'peer_requests' policies (which checks out fine).
-- 2. Creating the 'notes' bucket.
-- 3. Safely adding storage policies ONLY if they don't exist.
-- ================================================================

-- PART 1: PEER REQUESTS (Fixing the SQL error you saw)
ALTER TABLE public.peer_requests ENABLE ROW LEVEL SECURITY;

-- Clean cleanup of potentially conflicting names
DROP POLICY IF EXISTS "Peer requests are viewable by everyone" ON public.peer_requests;
DROP POLICY IF EXISTS "Public requests are viewable by everyone" ON public.peer_requests;
DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.peer_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.peer_requests;
DROP POLICY IF EXISTS "Users can edit their own requests" ON public.peer_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON public.peer_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON public.peer_requests;

-- Create policies fresh
CREATE POLICY "Peer requests are viewable by everyone" 
ON public.peer_requests FOR SELECT USING (true);

CREATE POLICY "Users can create their own requests" 
ON public.peer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
ON public.peer_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests" 
ON public.peer_requests FOR DELETE USING (auth.uid() = user_id);


-- PART 2: STORAGE BUCKET (Fixing "Bucket not found")
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO NOTHING;


-- PART 3: STORAGE POLICIES
-- Uses a DO block to check if policy exists before creating.
-- This prevents "Policy already exists" errors AND "Must be owner" errors (by avoiding DROPs).

DO $$
BEGIN
    -- 1. Public Read Access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access to Notes Bucket'
    ) THEN
        CREATE POLICY "Public Access to Notes Bucket"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'notes' );
    END IF;

    -- 2. Upload Access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Uploads to Notes Bucket'
    ) THEN
        CREATE POLICY "Authenticated Uploads to Notes Bucket"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'notes' );
    END IF;

    -- 3. Update Access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own notes files'
    ) THEN
        CREATE POLICY "Users can update own notes files"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING ( bucket_id = 'notes' AND auth.uid() = owner );
    END IF;
    
    -- 4. Delete Access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own notes files'
    ) THEN
        CREATE POLICY "Users can delete own notes files"
        ON storage.objects FOR DELETE
        TO authenticated
        USING ( bucket_id = 'notes' AND auth.uid() = owner );
    END IF;
END
$$;
