
CREATE OR REPLACE FUNCTION public.check_booking_overlap(p_cabin_id uuid, p_start_timestamp timestamp with time zone, p_buffer_end_timestamp timestamp with time zone, p_exclude_booking_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bookings
    WHERE cabin_id = p_cabin_id
      AND status IN ('confirmed', 'held', 'pending')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND user_id != auth.uid()  -- Allow same user to book adjacent slots
      AND start_timestamp < p_buffer_end_timestamp
      AND buffer_end_timestamp > p_start_timestamp
  )
  OR EXISTS (
    SELECT 1 FROM public.booking_holds
    WHERE cabin_id = p_cabin_id
      AND held_until > now()
      AND user_id != auth.uid()
      AND start_timestamp < p_buffer_end_timestamp
      AND buffer_end_timestamp > p_start_timestamp
  );
END;
$function$;
