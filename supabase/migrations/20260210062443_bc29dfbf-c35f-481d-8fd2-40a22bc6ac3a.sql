
-- Fix check_booking_overlap to exclude holds owned by the inserting user
CREATE OR REPLACE FUNCTION public.check_booking_overlap(
  p_cabin_id uuid,
  p_start_timestamp timestamptz,
  p_buffer_end_timestamp timestamptz,
  p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bookings
    WHERE cabin_id = p_cabin_id
      AND status IN ('confirmed', 'held', 'pending')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND start_timestamp < p_buffer_end_timestamp
      AND buffer_end_timestamp > p_start_timestamp
  )
  OR EXISTS (
    SELECT 1 FROM public.booking_holds
    WHERE cabin_id = p_cabin_id
      AND held_until > now()
      AND user_id != auth.uid()  -- Don't block the user who created the hold
      AND start_timestamp < p_buffer_end_timestamp
      AND buffer_end_timestamp > p_start_timestamp
  );
END;
$$;
