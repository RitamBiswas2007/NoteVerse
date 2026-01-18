-- CORRECTED SCRIPT
-- 'profiles' table uses 'display_name', not 'full_name' (based on current schema).
-- We update author_name to be the Username (priority), then Display Name, then Fallback.

UPDATE peer_notes
SET author_name = COALESCE(profiles.username, profiles.display_name, 'Anonymous')
FROM profiles
WHERE peer_notes.author_id = profiles.id;
