-- Enable RLS (already enabled but good practice to ensure)
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload (insert) quiz questions
-- Currently, there is NO policy for INSERT, which causes the upload error.
CREATE POLICY "Authenticated users can upload questions" 
ON public.quiz_questions 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
