-- Add updated_at column to peer_notes table
ALTER TABLE public.peer_notes
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create a function to automatically update the timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function before any update on peer_notes
DROP TRIGGER IF EXISTS update_peer_notes_updated_at ON public.peer_notes;

CREATE TRIGGER update_peer_notes_updated_at
    BEFORE UPDATE ON public.peer_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
