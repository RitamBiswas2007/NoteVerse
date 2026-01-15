CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  title TEXT,
  message TEXT,
  type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, is_read)
  VALUES (target_user_id, title, message, type, false);
END;
$$;

GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT) TO service_role;
