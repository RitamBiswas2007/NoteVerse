-- 1. Add missing and required columns to the notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT; -- Needed by the trigger
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT; -- Needed by the trigger
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;     -- Needed by the trigger

-- 2. Clean up any potential failed inserts (Optional but good for hygiene)
-- DELETE FROM notifications WHERE category IS NULL; (Disabled for safety, but conceptually useful)

-- 3. (Optional) Update the policies to be absolutely sure triggers can run (SECURITY DEFINER usually covers this, but explicit is better)
-- Triggers run as the function owner (postgres/service_role usually), but let's Ensure RLS isn't blocking anything else
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
-- Generally, we DON'T want users inserting manually, but if your frontend code tries it, you'd need this.
-- However, since we moved to TRIGGERS, the trigger runs with elevated privileges (SECURITY DEFINER), so this isn't strictly needed for the fix.
-- We just need the columns.
