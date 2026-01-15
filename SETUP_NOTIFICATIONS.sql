-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL, -- 'bounty', 'system', 'reply', 'like'
  title TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Update grant_bounty to insert notification
CREATE OR REPLACE FUNCTION grant_bounty(
  target_user_id UUID, 
  amount INT
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  -- Transfer Karma
  UPDATE profiles 
  SET karma = karma + amount 
  WHERE id = target_user_id;

  -- Create Notification
  INSERT INTO notifications (user_id, type, title, message, is_read)
  VALUES (
    target_user_id, 
    'bounty', 
    'Bounty Received!', 
    'You received ' || amount || ' Karma for your contribution.',
    FALSE
  );
END;
$$;
