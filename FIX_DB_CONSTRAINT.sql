-- Fix for "new row for relation "peer_requests" violates check constraint "peer_requests_status_check""

-- 1. Drop the existing restrictive constraint
ALTER TABLE peer_requests DROP CONSTRAINT IF EXISTS peer_requests_status_check;

-- 2. Add a new constraint that includes 'in_review' and 'closed'
-- Valid statuses:
-- 'active': Open for contributions
-- 'in_review': A contribution has been submitted via RPC
-- 'closed': Fulfilled and unlocked
-- 'completed': Alternate name for closed, added for safety
ALTER TABLE peer_requests ADD CONSTRAINT peer_requests_status_check 
  CHECK (status IN ('active', 'in_review', 'closed', 'completed'));

-- 3. Verify RPC function exists (Just re-run the creation to be safe, though not strictly needed if only constraint failed)
-- (Saved in SETUP_SUBMISSION.sql)
