-- 1. Create a Trigger Function to auto-notify on ANY Karma change
CREATE OR REPLACE FUNCTION public.notify_karma_change() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  diff INT;
  msg TEXT;
  title TEXT;
  type TEXT;
BEGIN
  -- Calculate difference
  diff := NEW.karma - OLD.karma;

  -- Only proceed if there is a difference
  IF diff = 0 OR diff IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine Message
  IF diff > 0 THEN
    title := 'Karma Received! 🌟';
    msg := 'You earned ' || diff || ' Karma points.';
    type := 'achievement'; -- Maps to Trophy icon
  ELSE
    title := 'Karma Used';
    msg := 'You spent ' || abs(diff) || ' Karma points.';
    type := 'alert'; -- Maps to Alert icon
  END IF;

  -- Insert Notification
  INSERT INTO public.notifications (
    user_id, 
    type, 
    category, 
    title, 
    message, 
    is_read, 
    created_at,
    link,
    priority
  )
  VALUES (
    NEW.id, 
    'karma_update', 
    type, 
    title, 
    msg, 
    FALSE, 
    NOW(),
    '/profile', -- Link to profile to see details
    'Medium'
  );

  RETURN NEW;
END;
$$;

-- 2. Attach Trigger to Profiles Table
DROP TRIGGER IF EXISTS on_karma_change ON public.profiles;
CREATE TRIGGER on_karma_change
  AFTER UPDATE OF karma ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.notify_karma_change();

-- 3. Cleanup: Update grant_bounty to REMOVE the manual notification
-- (Since the trigger will now handle it, we don't want doubles)
CREATE OR REPLACE FUNCTION grant_bounty(
  target_user_id UUID, 
  amount INT
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  -- Transfer Karma (The Trigger will catch this update and send the notification)
  UPDATE profiles 
  SET karma = karma + amount 
  WHERE id = target_user_id;
END;
$$;
