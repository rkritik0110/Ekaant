
-- Fix: Update get_cabin_availability to properly check time-specific overlap
-- instead of marking entire day as booked when only one batch is booked
CREATE OR REPLACE FUNCTION public.get_cabin_availability(p_cabin_id uuid, p_date date)
 RETURNS TABLE(batch_type text, start_time time without time zone, end_time time without time zone, status text, booking_id uuid, user_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_batches text[] := ARRAY['morning', 'mid_day', 'afternoon', 'evening'];
  v_start_times time[] := ARRAY['06:00', '10:00', '14:00', '18:00'];
  v_end_times time[] := ARRAY['10:00', '14:00', '18:00', '22:00'];
  v_batch text;
  v_start time;
  v_end time;
  v_start_ts timestamptz;
  v_end_ts timestamptz;
  v_booking record;
  v_hold record;
  i integer;
BEGIN
  FOR i IN 1..4 LOOP
    v_batch := v_batches[i];
    v_start := v_start_times[i];
    v_end := v_end_times[i];
    v_start_ts := (p_date::text || ' ' || v_start::text)::timestamptz;
    v_end_ts := (p_date::text || ' ' || v_end::text)::timestamptz;
    
    -- Check for overlapping confirmed/pending booking using proper overlap formula:
    -- NOT (existing_start >= requested_end OR existing_end <= requested_start)
    -- Which is: existing_start < requested_end AND existing_end > requested_start
    SELECT b.id, b.user_id INTO v_booking
    FROM public.bookings b
    WHERE b.cabin_id = p_cabin_id
      AND b.status IN ('confirmed', 'held', 'pending')
      AND b.start_timestamp < v_end_ts
      AND b.end_timestamp > v_start_ts
    LIMIT 1;
    
    IF v_booking.id IS NOT NULL THEN
      batch_type := v_batch;
      start_time := v_start;
      end_time := v_end;
      status := 'booked';
      booking_id := v_booking.id;
      user_id := v_booking.user_id;
      RETURN NEXT;
    ELSE
      -- Check for active hold with proper overlap
      SELECT h.id, h.user_id INTO v_hold
      FROM public.booking_holds h
      WHERE h.cabin_id = p_cabin_id
        AND h.held_until > now()
        AND h.start_timestamp < v_end_ts
        AND h.end_timestamp > v_start_ts
      LIMIT 1;
      
      IF v_hold.id IS NOT NULL THEN
        batch_type := v_batch;
        start_time := v_start;
        end_time := v_end;
        status := 'held';
        booking_id := v_hold.id;
        user_id := v_hold.user_id;
        RETURN NEXT;
      ELSE
        batch_type := v_batch;
        start_time := v_start;
        end_time := v_end;
        status := 'available';
        booking_id := NULL;
        user_id := NULL;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$function$;

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (even anonymous)
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
  ON public.feedback FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
