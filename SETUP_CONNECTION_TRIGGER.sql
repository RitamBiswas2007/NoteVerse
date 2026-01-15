-- 1. Create Trigger Function for Connection Requests
CREATE OR REPLACE FUNCTION public.notify_connection_event() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  sender_name TEXT;
  receiver_name TEXT;
BEGIN
  -- CASE 1: New Request (INSERT)
  IF (TG_OP = 'INSERT') AND (NEW.status = 'pending') THEN
    -- Get sender name
    SELECT COALESCE(raw_user_meta_data->>'display_name', 'A Student') 
    INTO sender_name FROM auth.users WHERE id = NEW.requester_id;

    INSERT INTO public.notifications (
      user_id, type, category, title, message, link, priority
    ) VALUES (
      NEW.receiver_id,
      'connection_request',
      'Social',
      'New Study Request',
      sender_name || ' wants to be your Study Mate.',
      '/mates', 
      'Medium'
    );
  END IF;

  -- CASE 2: Request Accepted (UPDATE)
  IF (TG_OP = 'UPDATE') AND (OLD.status = 'pending') AND (NEW.status = 'accepted') THEN
    -- Get receiver name (who accepted)
    SELECT COALESCE(raw_user_meta_data->>'display_name', 'A Student') 
    INTO receiver_name FROM auth.users WHERE id = NEW.receiver_id;

    INSERT INTO public.notifications (
      user_id, type, category, title, message, link, priority
    ) VALUES (
      NEW.requester_id, -- Notify the original requester
      'connection_accepted',
      'Social',
      'Request Accepted!',
      receiver_name || ' looks forward to studying with you!',
      '/messages',
      'High'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Attach Trigger to user_connections
DROP TRIGGER IF EXISTS on_connection_event ON public.user_connections;
CREATE TRIGGER on_connection_event
  AFTER INSERT OR UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE PROCEDURE public.notify_connection_event();
