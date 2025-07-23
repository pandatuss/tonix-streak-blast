-- Update Tonix rewards for all tasks
UPDATE public.system_tasks 
SET tonix_reward = 10 
WHERE category = 'daily';

UPDATE public.system_tasks 
SET tonix_reward = 50 
WHERE category = 'weekly';

UPDATE public.system_tasks 
SET tonix_reward = 50 
WHERE category = 'special';