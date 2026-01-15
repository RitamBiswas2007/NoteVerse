-- Create note_comments table if not exists
CREATE TABLE IF NOT EXISTS public.note_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID REFERENCES public.peer_notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (idempotent)
ALTER TABLE public.note_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.note_comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.note_comments;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.note_comments;

-- Re-create Policies
CREATE POLICY "Enable read access for all users" ON public.note_comments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.note_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.note_comments
    FOR DELETE USING (auth.uid() = user_id);


-- Add comments_count to peer_notes if not exists
ALTER TABLE public.peer_notes ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Function to handle comment counting
CREATE OR REPLACE FUNCTION handle_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.peer_notes
        SET comments_count = comments_count + 1
        WHERE id = NEW.note_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.peer_notes
        SET comments_count = comments_count - 1
        WHERE id = OLD.note_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment counting
DROP TRIGGER IF EXISTS on_comment_change ON public.note_comments;
CREATE TRIGGER on_comment_change
    AFTER INSERT OR DELETE ON public.note_comments
    FOR EACH ROW EXECUTE FUNCTION handle_comment_count();
