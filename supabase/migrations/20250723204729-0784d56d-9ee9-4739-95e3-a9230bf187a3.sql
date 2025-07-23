-- Add level field to users table
ALTER TABLE public.users 
ADD COLUMN level INTEGER DEFAULT 0;

-- Add index for better performance on level queries
CREATE INDEX idx_users_level ON public.users(level DESC);