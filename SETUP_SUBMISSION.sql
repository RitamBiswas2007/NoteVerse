CREATE OR REPLACE FUNCTION submit_bounty_contribution(
  req_id UUID,
  note_data JSONB
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Robust update: Handle null array and ensure status update
  UPDATE peer_requests 
  SET 
    submitted_notes = COALESCE(submitted_notes, '[]'::jsonb) || note_data,
    status = 'in_review'
  WHERE id = req_id;
END;
$$;
