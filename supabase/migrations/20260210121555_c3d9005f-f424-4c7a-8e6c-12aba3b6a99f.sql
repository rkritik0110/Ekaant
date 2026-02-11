
-- Add has_locker flag to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS has_locker boolean NOT NULL DEFAULT false;
