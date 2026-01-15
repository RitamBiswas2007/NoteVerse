-- Run this in your Supabase SQL Editor to enable the Debit System
-- This function atomatically deducts Karma, facilitating safe transactions.

CREATE OR REPLACE FUNCTION deduct_karma(
  user_id UUID, 
  amount INT
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  -- Ensure we don't go below zero (Optional, but "bank-like")
  -- IF (SELECT karma FROM profiles WHERE id = user_id) < amount THEN
  --   RAISE EXCEPTION 'Insufficient funds';
  -- END IF;

  UPDATE profiles 
  SET karma = karma - amount 
  WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION deduct_karma(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_karma(UUID, INT) TO service_role;
