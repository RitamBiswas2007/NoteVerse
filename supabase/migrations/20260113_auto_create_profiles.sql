-- 1. Create or Replace the function to handle new users
-- This is safe to run even if it exists (it updates it)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, username, education_level)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    'Undergraduate'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
-- We drop it first to ensure we don't get a duplicate error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing users
-- This inserts profiles for users that exist in auth.users but not in profiles
INSERT INTO public.profiles (id, display_name, username)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)), 
    email
FROM auth.users
ON CONFLICT (id) DO NOTHING;
