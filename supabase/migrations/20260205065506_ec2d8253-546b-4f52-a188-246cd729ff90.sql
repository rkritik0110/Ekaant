
-- Migrate existing data from booking_date + start_time to start_timestamp
UPDATE public.bookings
SET 
  start_timestamp = (booking_date::text || ' ' || start_time::text)::timestamptz,
  end_timestamp = (booking_date::text || ' ' || end_time::text)::timestamptz,
  buffer_end_timestamp = ((booking_date::text || ' ' || end_time::text)::timestamptz + interval '15 minutes')
WHERE start_timestamp IS NULL;

-- Create overlap check function
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
  -- Check for overlapping confirmed/held bookings
  RETURN EXISTS (
    SELECT 1 FROM public.bookings
    WHERE cabin_id = p_cabin_id
      AND status IN ('confirmed', 'held', 'pending')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND start_timestamp < p_buffer_end_timestamp
      AND buffer_end_timestamp > p_start_timestamp
  )
  OR EXISTS (
    -- Also check active holds
    SELECT 1 FROM public.booking_holds
    WHERE cabin_id = p_cabin_id
      AND held_until > now()
      AND start_timestamp < p_buffer_end_timestamp
      AND buffer_end_timestamp > p_start_timestamp
  );
END;
$$;

-- Create booking validation trigger function
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_duration interval;
  v_advance_days integer;
BEGIN
  -- Set buffer_end_timestamp if not set
  IF NEW.buffer_end_timestamp IS NULL THEN
    NEW.buffer_end_timestamp := NEW.end_timestamp + interval '15 minutes';
  END IF;

  -- Skip validation for cancelled/expired/completed bookings
  IF NEW.status IN ('cancelled', 'expired', 'completed') THEN
    RETURN NEW;
  END IF;

  -- Skip validation if start_timestamp is null (legacy data)
  IF NEW.start_timestamp IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate duration
  v_duration := NEW.end_timestamp - NEW.start_timestamp;
  
  -- Validate minimum 4-hour duration
  IF v_duration < interval '4 hours' THEN
    RAISE EXCEPTION 'Minimum booking duration is 4 hours';
  END IF;

  -- Validate maximum 5 days in advance
  v_advance_days := EXTRACT(day FROM (NEW.start_timestamp::date - CURRENT_DATE));
  IF v_advance_days > 5 THEN
    RAISE EXCEPTION 'Cannot book more than 5 days in advance';
  END IF;

  -- Check for overlapping bookings
  IF check_booking_overlap(NEW.cabin_id, NEW.start_timestamp, NEW.buffer_end_timestamp, NEW.id) THEN
    RAISE EXCEPTION 'This time slot is already booked or held';
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_booking_trigger ON public.bookings;
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking();

-- Create get_cabin_availability function
CREATE OR REPLACE FUNCTION public.get_cabin_availability(
  p_cabin_id uuid,
  p_date date
)
RETURNS TABLE (
  batch_type text,
  start_time time,
  end_time time,
  status text,
  booking_id uuid,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    
    -- Check for confirmed/pending booking
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
      -- Check for active hold
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
$$;

-- Create cleanup function for expired holds
CREATE OR REPLACE FUNCTION public.cleanup_expired_holds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete expired holds
  DELETE FROM public.booking_holds
  WHERE held_until < now();
  
  -- Expire bookings that are 30 minutes past start without check-in
  UPDATE public.bookings
  SET status = 'expired'
  WHERE status = 'confirmed'
    AND checked_in_at IS NULL
    AND start_timestamp < (now() - interval '30 minutes');
END;
$$;

-- Create index for faster overlap checks (only on existing columns, not new enum values)
CREATE INDEX IF NOT EXISTS idx_bookings_cabin_start_end 
  ON public.bookings (cabin_id, start_timestamp, buffer_end_timestamp);
