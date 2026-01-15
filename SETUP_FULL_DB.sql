
-- Create or Update the peer_requests table with correct columns
CREATE TABLE IF NOT EXISTS peer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  bounty INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  views INT DEFAULT 0,
  target_audience TEXT DEFAULT 'public',
  target_user TEXT,
  submitted_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_by TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Updated submission function with rigorous NULL checks
CREATE OR REPLACE FUNCTION submit_bounty_contribution(
  req_id UUID,
  note_data JSONB
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  current_notes JSONB;
BEGIN
  -- Fetch current notes to verify row exists
  SELECT submitted_notes INTO current_notes FROM peer_requests WHERE id = req_id;
  
  -- If row not found, raise error (which will be seen in frontend)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  -- Update with protection against nulls
  UPDATE peer_requests 
  SET 
    submitted_notes = COALESCE(submitted_notes, '[]'::jsonb) || note_data,
    status = 'in_review'
  WHERE id = req_id;
END;
$$;
