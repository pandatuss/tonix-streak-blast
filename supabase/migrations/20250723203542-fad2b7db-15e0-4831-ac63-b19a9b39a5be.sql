-- Add daily streak fields to users table
ALTER TABLE public.users 
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN last_checkin_date DATE,
ADD COLUMN total_days INTEGER DEFAULT 0;

-- Add index for better performance on streak queries
CREATE INDEX idx_users_last_checkin ON public.users(last_checkin_date);
CREATE INDEX idx_users_current_streak ON public.users(current_streak DESC);