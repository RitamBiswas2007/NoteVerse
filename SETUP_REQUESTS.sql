
-- Enable RLS on peer_requests
ALTER TABLE peer_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read requests (public or targeted)
CREATE POLICY "Public requests are viewable by everyone" 
ON peer_requests FOR SELECT 
USING (true);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create their own requests" 
ON peer_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own requests
CREATE POLICY "Users can update their own requests" 
ON peer_requests FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can DELETE their own requests
CREATE POLICY "Users can delete their own requests" 
ON peer_requests FOR DELETE 
USING (auth.uid() = user_id);
