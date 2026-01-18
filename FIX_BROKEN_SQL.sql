-- FIX: You likely ran a truncated command. 
-- The table name "notifications" was missing after "public".

-- 1. Drop the policy if it exists
DROP POLICY IF EXISTS "Users can insert notifications for others" ON public.notifications;

-- 2. Create the policy on the 'notifications' table specifically
CREATE POLICY "Users can insert notifications for others"
ON public.notifications FOR INSERT
WITH CHECK ( true );
