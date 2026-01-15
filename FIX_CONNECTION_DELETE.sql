-- Helper policy to ensure you can delete your own sent requests
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- Drop just in case it exists to avoid error
DROP POLICY IF EXISTS "Users can delete own sent requests" ON public.user_connections;

CREATE POLICY "Users can delete own sent requests"
ON public.user_connections
FOR DELETE
USING (auth.uid() = requester_id);
