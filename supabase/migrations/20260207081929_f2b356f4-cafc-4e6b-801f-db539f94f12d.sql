
-- Step 1: Change current_hours from INTEGER to NUMERIC
ALTER TABLE public.goals 
ALTER COLUMN current_hours TYPE NUMERIC USING current_hours::NUMERIC;

-- Step 2: Create sync_goal_progress function
CREATE OR REPLACE FUNCTION public.sync_goal_progress(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_goal RECORD;
  v_total_minutes NUMERIC;
  v_computed_hours NUMERIC;
BEGIN
  FOR v_goal IN
    SELECT id, created_at, target_hours
    FROM public.goals
    WHERE user_id = p_user_id
      AND is_completed = false
  LOOP
    -- Sum duration_minutes from completed focus sessions after goal creation
    SELECT COALESCE(SUM(duration_minutes), 0)
    INTO v_total_minutes
    FROM public.focus_sessions
    WHERE user_id = p_user_id
      AND started_at >= v_goal.created_at
      AND is_active = false;

    -- Convert to hours
    v_computed_hours := v_total_minutes / 60.0;

    -- Update the goal
    UPDATE public.goals
    SET current_hours = v_computed_hours,
        is_completed = (v_computed_hours >= target_hours),
        updated_at = now()
    WHERE id = v_goal.id;
  END LOOP;
END;
$$;
