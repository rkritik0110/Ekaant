
-- Create service_requests table for admin live operations feed
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cabin_number INTEGER NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('coffee_water', 'noise_complaint', 'cleaning')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create own service requests"
ON public.service_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own service requests"
ON public.service_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all service requests"
ON public.service_requests FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
