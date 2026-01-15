-- 1. Relax the Education Level Constraint (It was causing issues with 'General Studies')
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_education_level_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_education_level_check 
  CHECK (education_level IN ('high_school', 'undergraduate', 'graduate', 'postgraduate', 'other', 'General Studies', 'PhD'));

-- 2. Ensure all needed columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS karma INTEGER DEFAULT 0;
-- 'major' in frontend seems to map to 'education_level' or we can add a specific 'major' column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS major TEXT; 

-- 3. Update the Trigger Function to be robust and map all fields
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    display_name, 
    avatar_url, 
    university, 
    education_level, 
    major,
    subjects,
    karma
  )
  VALUES (
    new.id, 
    new.email, -- Default username to email
    COALESCE(new.raw_user_meta_data ->> 'display_name', 'Student'),
    new.raw_user_meta_data ->> 'avatar_url',
    COALESCE(new.raw_user_meta_data ->> 'university', 'NoteVerse University'),
    COALESCE(new.raw_user_meta_data ->> 'education_level', 'other'), -- Map strict level if present
    COALESCE(new.raw_user_meta_data ->> 'major', 'General Studies'),   -- Map major
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(new.raw_user_meta_data -> 'skills', '["Student"]'::jsonb))),
    COALESCE((new.raw_user_meta_data ->> 'karma')::int, 0)
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    karma = EXCLUDED.karma;
    
  RETURN new;
END;
$$;

-- 4. Re-attach Trigger (Safety)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Backfill any broken users (Optional but helpful)
-- This tries to create profile rows for any auth users who are missing them
INSERT INTO public.profiles (id, username, display_name, karma)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data ->> 'display_name', 'Recovered User'),
  COALESCE((raw_user_meta_data ->> 'karma')::int, 0)
FROM auth.users
ON CONFLICT (id) DO NOTHING;
