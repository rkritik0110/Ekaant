
-- Step 1: Add booking_type and amount columns to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'daily';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 0;

-- Step 2: Fix the validate_booking() function
-- The bug: EXTRACT(day FROM (date - date)) fails because date - date returns integer, not interval
-- Also: skip the 5-day advance check for monthly bookings
CREATE OR REPLACE FUNCTION public.validate_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Only enforce 5-day advance limit for daily bookings (not monthly)
  IF COALESCE(NEW.booking_type, 'daily') = 'daily' THEN
    v_advance_days := NEW.start_timestamp::date - CURRENT_DATE;
    IF v_advance_days > 5 THEN
      RAISE EXCEPTION 'Cannot book more than 5 days in advance';
    END IF;
  END IF;

  -- Check for overlapping bookings
  IF check_booking_overlap(NEW.cabin_id, NEW.start_timestamp, NEW.buffer_end_timestamp, NEW.id) THEN
    RAISE EXCEPTION 'This time slot is already booked or held';
  END IF;

  RETURN NEW;
END;
$function$;
