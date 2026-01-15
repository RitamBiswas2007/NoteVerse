CREATE OR REPLACE FUNCTION deduct_karma(
  user_id UUID, 
  amount INT
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  UPDATE profiles 
  SET karma = karma - amount 
  WHERE id = user_id;
END;
$$;
