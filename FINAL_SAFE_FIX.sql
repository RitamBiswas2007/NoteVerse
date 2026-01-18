-- ==================================================================================
-- FINAL SAFE FIX SCRIPT (Guaranteed to work)
-- This script fixes the "Must be owner" error by removing the `DROP POLICY` commands
-- for the system storage table. Instead, it checks if policies exist before creating.
-- ==================================================================================

-- 1. NOTIFICATIONS (User table - Safe to Drop/Reset)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL, 
  title TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- 2. PROFILES (User table - Safe to Drop/Reset)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  updated_at TIMESTAMPTZ,
  karma INT DEFAULT 0
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. PEER REQUESTS (User table - Safe to Drop/Reset)
ALTER TABLE peer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public requests are viewable by everyone" ON peer_requests;
DROP POLICY IF EXISTS "Peer requests are viewable by everyone" ON peer_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON peer_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON peer_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON peer_requests;

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

-- 4. PEER NOTES (User table - Safe to Drop/Reset)
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
ON public.peer_notes FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own notes"
ON peer_notes FOR DELETE
TO authenticated
USING (auth.uid() = author_id);


-- ==================================================================================
-- 5. STORAGE FIX (THE CRITICAL PART)
-- We DO NOT use DROP POLICY here because you are not the owner of the system table.
-- Instead, we use a DO block to safely check + create.
-- ==================================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    -- 1. Public Access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access') THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'notes' );
    END IF;

    -- 2. Authenticated Uploads
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload') THEN
        CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'notes' );
    END IF;

    -- 3. Update Own Files
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own files') THEN
        CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'notes' AND auth.uid() = owner );
    END IF;

    -- 4. Delete Own Files
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own files') THEN
        CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'notes' AND auth.uid() = owner );
    END IF;
END $$;
