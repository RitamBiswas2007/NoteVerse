-- Backfill existing users into the profiles table
-- This respects the schema where 'id' IS the Auth UUID (PK = FK).

INSERT INTO public.profiles (id, display_name, username, education_level, avatar_url)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)), 
    email,
    'Undergraduate',
    COALESCE(raw_user_meta_data->>'avatar_url', '')
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);
