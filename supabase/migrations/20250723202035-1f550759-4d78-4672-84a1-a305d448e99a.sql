-- Rename points columns to tonix for better organization
ALTER TABLE public.users RENAME COLUMN total_points TO total_tonix;
ALTER TABLE public.tasks RENAME COLUMN points_earned TO tonix_earned;
ALTER TABLE public.ranking RENAME COLUMN total_points TO total_tonix;
ALTER TABLE public.referrals RENAME COLUMN bonus_points TO bonus_tonix;