-- Update special tasks with action URLs for external redirects
UPDATE public.system_tasks 
SET action_url = 'https://x.com/tonixglobal'
WHERE task_name = 'Follow Twitter Account' AND category = 'special';

UPDATE public.system_tasks 
SET action_url = 'https://t.me/tonixglobal'
WHERE task_name = 'Join Telegram Channel' AND category = 'special';

UPDATE public.system_tasks 
SET action_url = 'https://t.me/tonixglobal_chat'
WHERE task_name = 'Join Community Group' AND category = 'special';