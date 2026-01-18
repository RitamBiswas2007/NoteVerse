-- INTELLIGENT NAME CLEANUP
-- This script updates author names to avoid showing email addresses.
-- 1. If username is a normal name, use it.
-- 2. If username is an email (contains '@'), use the part before '@'.
-- 3. Same logic for display_name as backup.

UPDATE peer_notes
SET author_name = (
  CASE
    -- Priority 1: Clean Username
    WHEN profiles.username IS NOT NULL AND position('@' in profiles.username) = 0 
      THEN profiles.username
      
    -- Priority 2: Email-like Username -> Extract name
    WHEN profiles.username IS NOT NULL 
      THEN split_part(profiles.username, '@', 1)
      
    -- Priority 3: Clean Display Name
    WHEN profiles.display_name IS NOT NULL AND position('@' in profiles.display_name) = 0 
      THEN profiles.display_name
      
    -- Priority 4: Email-like Display Name -> Extract name
    WHEN profiles.display_name IS NOT NULL 
      THEN split_part(profiles.display_name, '@', 1)
      
    -- Fallback
    ELSE 'Anonymous'
  END
)
FROM profiles
WHERE peer_notes.author_id = profiles.id;
