-- Create enum for shift types
CREATE TYPE public.shift_type AS ENUM ('morning', 'evening', 'night');

-- Create enum for request types
CREATE TYPE public.request_type AS ENUM ('water', 'coffee', 'noise_complaint', 'assistance');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'acknowledged', 'completed');

-- Create focus_sessions table for tracking study time
CREATE TABLE public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cabin_id UUID REFERENCES public.cabins(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table for student goal tracking
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_hours INTEGER NOT NULL DEFAULT 100,
    current_hours INTEGER NOT NULL DEFAULT 0,
    deadline DATE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create silent_requests table
CREATE TABLE public.silent_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cabin_id UUID REFERENCES public.cabins(id) ON DELETE SET NULL,
    request_type request_type NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create shifts table
CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_date DATE NOT NULL,
    shift_type shift_type NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (shift_date, shift_type)
);

-- Create staff table
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shift_assignments table
CREATE TABLE public.shift_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (shift_id, staff_id)
);

-- Create leaderboard_settings table for anonymous mode
CREATE TABLE public.leaderboard_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    show_on_leaderboard BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create access_control table for entry management
CREATE TABLE public.access_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    is_allowed BOOLEAN NOT NULL DEFAULT true,
    blocked_reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE,
    blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_control ENABLE ROW LEVEL SECURITY;

-- Focus sessions policies
CREATE POLICY "Users can view own focus sessions" ON public.focus_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own focus sessions" ON public.focus_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions" ON public.focus_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all focus sessions" ON public.focus_sessions
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Goals policies
CREATE POLICY "Users can manage own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all goals" ON public.goals
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Silent requests policies
CREATE POLICY "Users can create own requests" ON public.silent_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests" ON public.silent_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests" ON public.silent_requests
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Shifts policies (admin only)
CREATE POLICY "Admins can manage shifts" ON public.shifts
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view shifts" ON public.shifts
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Staff policies (admin only)
CREATE POLICY "Admins can manage staff" ON public.staff
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Shift assignments policies
CREATE POLICY "Admins can manage shift assignments" ON public.shift_assignments
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view shift assignments" ON public.shift_assignments
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Leaderboard settings policies
CREATE POLICY "Users can manage own leaderboard settings" ON public.leaderboard_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard settings" ON public.leaderboard_settings
    FOR SELECT USING (show_on_leaderboard = true);

-- Access control policies
CREATE POLICY "Users can view own access status" ON public.access_control
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage access control" ON public.access_control
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create function to get weekly leaderboard
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard()
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    is_anonymous BOOLEAN,
    total_minutes INTEGER,
    rank INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fs.user_id,
        COALESCE(ls.display_name, p.full_name, 'Anonymous') as display_name,
        COALESCE(ls.is_anonymous, false) as is_anonymous,
        COALESCE(SUM(fs.duration_minutes)::INTEGER, 0) as total_minutes,
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(fs.duration_minutes), 0) DESC)::INTEGER as rank
    FROM focus_sessions fs
    LEFT JOIN leaderboard_settings ls ON fs.user_id = ls.user_id
    LEFT JOIN profiles p ON fs.user_id = p.user_id
    WHERE fs.started_at >= date_trunc('week', CURRENT_DATE)
      AND (ls.show_on_leaderboard IS NULL OR ls.show_on_leaderboard = true)
    GROUP BY fs.user_id, ls.display_name, ls.is_anonymous, p.full_name
    ORDER BY total_minutes DESC
    LIMIT 50;
END;
$$;

-- Create function to get user focus stats
CREATE OR REPLACE FUNCTION public.get_user_focus_stats(p_user_id UUID)
RETURNS TABLE (
    today_minutes INTEGER,
    week_minutes INTEGER,
    month_minutes INTEGER,
    total_minutes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN started_at >= CURRENT_DATE THEN duration_minutes ELSE 0 END)::INTEGER, 0) as today_minutes,
        COALESCE(SUM(CASE WHEN started_at >= date_trunc('week', CURRENT_DATE) THEN duration_minutes ELSE 0 END)::INTEGER, 0) as week_minutes,
        COALESCE(SUM(CASE WHEN started_at >= date_trunc('month', CURRENT_DATE) THEN duration_minutes ELSE 0 END)::INTEGER, 0) as month_minutes,
        COALESCE(SUM(duration_minutes)::INTEGER, 0) as total_minutes
    FROM focus_sessions
    WHERE user_id = p_user_id;
END;
$$;

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.focus_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.silent_requests;

-- Insert default shifts for today
INSERT INTO public.shifts (shift_date, shift_type, start_time, end_time)
VALUES 
    (CURRENT_DATE, 'morning', '06:00', '14:00'),
    (CURRENT_DATE, 'evening', '14:00', '22:00'),
    (CURRENT_DATE, 'night', '22:00', '06:00')
ON CONFLICT (shift_date, shift_type) DO NOTHING;