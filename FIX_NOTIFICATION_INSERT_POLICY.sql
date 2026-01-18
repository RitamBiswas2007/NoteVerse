-- Allow users to create notifications for others (e.g. for connection requests)

-- Drop the policy if it already exists to prevent errors
DROP POLICY IF EXISTS "Users can insert notifications for others" ON public.notifications;

-- Create the policy
CREATE POLICY "Users can insert notifications for others"
ON public.notifications FOR INSERT
WITH CHECK ( true );
