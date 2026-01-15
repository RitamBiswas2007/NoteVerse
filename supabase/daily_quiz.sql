-- Daily Quiz Feature Tables

-- 1. Table for Questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings e.g. ["Option A", "Option B", "Option C", "Option D"]
    correct_option_index INTEGER NOT NULL, -- 0 to 3
    quiz_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table for User Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL DEFAULT 10,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    quiz_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, quiz_date) -- Ensures only one attempt per day
);

-- 3. RLS Policies
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read questions
CREATE POLICY "Public read questions" ON public.quiz_questions
    FOR SELECT USING (true);

-- Allow users to manage their own attempts
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own attempts" ON public.quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

-- 4. Seed Data for "Today's" Quiz (10 Questions)
-- We use ON CONFLICT DO NOTHING to avoid duplicates if run multiple times
INSERT INTO public.quiz_questions (question_text, options, correct_option_index, quiz_date) VALUES
('What is the virtual DOM in React?', '["A direct copy of the browser DOM", "A lightweight JavaScript representation of the DOM", "A server-side rendering engine", "A third-party DOM manipulation library"]'::jsonb, 1, CURRENT_DATE),
('Which hook is used for side effects in React?', '["useState", "useReducer", "useEffect", "useMemo"]'::jsonb, 2, CURRENT_DATE),
('What is the time complexity of binary search?', '["O(n)", "O(n^2)", "O(log n)", "O(1)"]'::jsonb, 2, CURRENT_DATE),
('Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]'::jsonb, 1, CURRENT_DATE),
('What does CSS stand for?', '["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"]'::jsonb, 2, CURRENT_DATE),
('Which tag is used for the main heading in HTML?', '["<head>", "<header>", "<h1>", "<main>"]'::jsonb, 2, CURRENT_DATE),
('What is the atomic number of Carbon?', '["6", "12", "14", "8"]'::jsonb, 0, CURRENT_DATE),
('Who wrote "Romeo and Juliet"?', '["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"]'::jsonb, 1, CURRENT_DATE),
('Which allows you to catch errors in JavaScript promises?', '["then()", "catch()", "finally()", "reject()"]'::jsonb, 1, CURRENT_DATE),
('What is the powerhouse of the cell?', '["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"]'::jsonb, 2, CURRENT_DATE);
