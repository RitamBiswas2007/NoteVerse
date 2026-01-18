-- 1. NOTIFICATIONS
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

-- 2. PROFILES
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

-- 3. PEER REQUESTS
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

-- 4. PEER NOTES (STORAGE & TABLE)
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

-- STORAGE BUCKET FIX
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

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
