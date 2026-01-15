ALTER TABLE profiles ADD COLUMN IF NOT EXISTS karma INTEGER DEFAULT 0;

-- Optional: Ensure RLS allows reading this column (if select policies are restrictive, though usually they select *)
-- No change needed if policy is "SELECT * FROM profiles"
