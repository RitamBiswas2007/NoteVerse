-- 1. Create a function to handle connection notifications securely
CREATE OR REPLACE FUNCTION public.handle_connection_notification() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER -- Runs with superuser privileges
AS $$
DECLARE
  sender_name TEXT;
  receiver_name TEXT;
BEGIN
  -- Log used for debugging (visible in Supabase logs)
  RAISE LOG 'Connection notification trigger fired for ID: %, Status: %', NEW.id, NEW.status;

  -- CASE 1: New Pending Request
  IF (TG_OP = 'INSERT') AND (NEW.status = 'pending') THEN
    SELECT COALESCE(raw_user_meta_data->>'display_name', 'A Student') 
    INTO sender_name FROM auth.users WHERE id = NEW.requester_id;

    INSERT INTO public.notifications (
      user_id, 
      type, 
      category,     -- Ensure this column exists via FIX_ALERTS.sql
      title, 
      message, 
      link,         -- Ensure this column exists via FIX_ALERTS.sql
      priority,     -- Ensure this column exists via FIX_ALERTS.sql
      is_read
    ) VALUES (
      NEW.receiver_id,
      'connection_request',
      'Social',
      'New Study Request',
      sender_name || ' wants to be your Study Mate.',
      '/mates', 
      'Medium',
      FALSE
    );
  END IF;

  -- CASE 2: Request Accepted
  IF (TG_OP = 'UPDATE') AND (OLD.status = 'pending') AND (NEW.status = 'accepted') THEN
    SELECT COALESCE(raw_user_meta_data->>'display_name', 'A Student') 
    INTO receiver_name FROM auth.users WHERE id = NEW.receiver_id;

    INSERT INTO public.notifications (
      user_id, 
      type, 
      category, 
      title, 
      message, 
      link, 
      priority,
      is_read
    ) VALUES (
      NEW.requester_id, -- Notify the original requester
      'connection_accepted',
      'Social',
      'Request Accepted!',
      receiver_name || ' accepted your study request!',
      '/messages',
      'High',
      FALSE
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log errors to find out why it fails silentl
  RAISE LOG 'Error in handle_connection_notification: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 2. Attach Trigger
DROP TRIGGER IF EXISTS on_connection_event ON public.user_connections;
CREATE TRIGGER on_connection_event
  AFTER INSERT OR UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_connection_notification();
