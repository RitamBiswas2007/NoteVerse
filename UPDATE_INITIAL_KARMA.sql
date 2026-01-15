-- 1. Change the default Karma value to 5000 for all NEW rows
ALTER TABLE profiles ALTER COLUMN karma SET DEFAULT 5000;

-- 2. (Optional) If you want to retroactively grant 5000 to users who currently have 0
-- Uncomment the line below if desired:
-- UPDATE profiles SET karma = 5000 WHERE karma = 0;
