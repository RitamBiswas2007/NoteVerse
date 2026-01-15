-- Backfill existing users into the profiles table
-- This respects the existing schema where 'user_id' is the Auth UUID and 'id' is a random PK.

INSERT INTO public.profiles (user_id, display_name, username, education_level, avatar_url)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)), 
    email,
    'Undergraduate',
    COALESCE(raw_user_meta_data->>'avatar_url', '')
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.users.id
);
