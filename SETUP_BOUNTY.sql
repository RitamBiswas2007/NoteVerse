CREATE OR REPLACE FUNCTION grant_bounty(
  target_user_id UUID, 
  amount INT
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  UPDATE profiles 
  SET karma = karma + amount 
  WHERE id = target_user_id;
END;
$$;
