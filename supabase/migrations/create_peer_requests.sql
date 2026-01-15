-- Create the peer_requests table
CREATE TABLE IF NOT EXISTS public.peer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    bounty INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    views INTEGER DEFAULT 0,
    target_audience TEXT DEFAULT 'public',
    target_user TEXT,
    submitted_notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.peer_requests ENABLE ROW LEVEL SECURITY;

-- Policies

-- Everyone can view requests
CREATE POLICY "Peer requests are viewable by everyone" 
ON public.peer_requests FOR SELECT 
USING (true);

-- Authenticated users can create requests
CREATE POLICY "Authenticated users can create requests" 
ON public.peer_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests
CREATE POLICY "Users can update their own requests" 
ON public.peer_requests FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own requests
CREATE POLICY "Users can delete their own requests" 
ON public.peer_requests FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_peer_requests_updated_at
    BEFORE UPDATE ON public.peer_requests
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();
