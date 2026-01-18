-- FORCE SYNC DISPLAY_NAME TO AUTHOR_NAME
-- This script prioritizes the 'display_name' column from profiles, which corresponds to the main name shown on the profile page.
-- This ensures 'Ritam' (display_name) overwrites 'biswassoma672' (username) if both exist.

UPDATE peer_notes
SET author_name = (
  CASE
    -- Priority 1: Display Name (e.g. "Ritam")
    WHEN profiles.display_name IS NOT NULL AND trim(profiles.display_name) != '' AND position('@' in profiles.display_name) = 0 
      THEN profiles.display_name
      
    -- Priority 2: Username (e.g. "biswassoma672") - ensuring it's not an email
    WHEN profiles.username IS NOT NULL AND position('@' in profiles.username) = 0 
      THEN profiles.username
      
    -- Priority 3: Fallback Clean Email
    ELSE COALESCE(
        split_part(profiles.username, '@', 1),
        split_part(profiles.display_name, '@', 1),
        'Anonymous'
    )
  END
)
FROM profiles
WHERE peer_notes.author_id = profiles.id;
