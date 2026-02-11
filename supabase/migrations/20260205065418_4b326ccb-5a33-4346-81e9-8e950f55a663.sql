
-- Phase 1: Create new enums and add columns (no functions that use new enum values)
CREATE TYPE public.batch_type AS ENUM ('morning', 'mid_day', 'afternoon', 'evening', 'custom');

-- Add new status values to existing booking_status enum
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'expired';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'held';

-- Phase 2: Add new columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS start_timestamp timestamptz,
ADD COLUMN IF NOT EXISTS end_timestamp timestamptz,
ADD COLUMN IF NOT EXISTS buffer_end_timestamp timestamptz,
ADD COLUMN IF NOT EXISTS batch_type batch_type DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_group_id uuid,
ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

-- Phase 3: Create recurring_booking_groups table
CREATE TABLE public.recurring_booking_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cabin_id uuid NOT NULL REFERENCES public.cabins(id),
  batch_type batch_type NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on recurring_booking_groups
ALTER TABLE public.recurring_booking_groups ENABLE ROW LEVEL SECURITY;

-- RLS policies for recurring_booking_groups
CREATE POLICY "Users can view own recurring groups"
  ON public.recurring_booking_groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recurring groups"
  ON public.recurring_booking_groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all recurring groups"
  ON public.recurring_booking_groups FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Phase 4: Create booking_holds table (temporary locks)
CREATE TABLE public.booking_holds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cabin_id uuid NOT NULL REFERENCES public.cabins(id),
  user_id uuid NOT NULL,
  start_timestamp timestamptz NOT NULL,
  end_timestamp timestamptz NOT NULL,
  buffer_end_timestamp timestamptz NOT NULL,
  held_until timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on booking_holds
ALTER TABLE public.booking_holds ENABLE ROW LEVEL SECURITY;

-- RLS policies for booking_holds
CREATE POLICY "Users can view own holds"
  ON public.booking_holds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own holds"
  ON public.booking_holds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own holds"
  ON public.booking_holds FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all holds"
  ON public.booking_holds FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for faster overlap checks
CREATE INDEX IF NOT EXISTS idx_booking_holds_cabin_timestamps
  ON public.booking_holds (cabin_id, start_timestamp, buffer_end_timestamp, held_until);

-- Enable realtime for booking_holds
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_holds;
