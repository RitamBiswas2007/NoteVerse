
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can delete their own requests" ON peer_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON peer_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON peer_requests;
DROP POLICY IF EXISTS "Public requests are viewable by everyone" ON peer_requests;

-- Enable RLS
ALTER TABLE peer_requests ENABLE ROW LEVEL SECURITY;

-- Re-create Policies correctly
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

