-- 1. Create Tables if they don't exist
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_option_index INTEGER NOT NULL,
    quiz_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL DEFAULT 10,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    quiz_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, quiz_date)
);

-- 2. Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 3. Create/Update Policies
-- Drop existing policies to avoid conflicts when re-running
DROP POLICY IF EXISTS "Public read questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Authenticated users can upload questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Users can insert own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can view own attempts" ON public.quiz_attempts;

-- Question Policies
CREATE POLICY "Public read questions" ON public.quiz_questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload questions" 
    ON public.quiz_questions 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Attempt Policies
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own attempts" ON public.quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

-- 4. Reload Schema Cache
-- This notifies Postgrest to refresh its knowledge of the database schema
NOTIFY pgrst, 'reload schema';
