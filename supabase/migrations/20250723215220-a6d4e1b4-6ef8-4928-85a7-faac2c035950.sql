-- Add new columns to tasks table for better task management
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'special',
ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'once',
ADD COLUMN IF NOT EXISTS cooldown_hours integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS action_url text,
ADD COLUMN IF NOT EXISTS is_repeatable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS next_available_at timestamp with time zone;

-- Add check constraints for valid values
ALTER TABLE public.tasks 
ADD CONSTRAINT valid_category CHECK (category IN ('daily', 'weekly', 'special')),
ADD CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekly', 'once')),
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'available'));

-- Create predefined tasks table for system tasks
CREATE TABLE IF NOT EXISTS public.system_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  frequency text NOT NULL,
  task_name text NOT NULL,
  description text NOT NULL,
  tonix_reward integer NOT NULL DEFAULT 0,
  action_url text,
  cooldown_hours integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT system_tasks_valid_category CHECK (category IN ('daily', 'weekly', 'special')),
  CONSTRAINT system_tasks_valid_frequency CHECK (frequency IN ('daily', 'weekly', 'once'))
);

-- Enable RLS on system_tasks
ALTER TABLE public.system_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for system_tasks
CREATE POLICY "Everyone can view system tasks" 
ON public.system_tasks 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "System can manage tasks" 
ON public.system_tasks 
FOR ALL 
USING (true);

-- Insert default system tasks
INSERT INTO public.system_tasks (category, frequency, task_name, description, tonix_reward, cooldown_hours) VALUES
('daily', 'daily', 'Daily Check-in', 'Complete your daily check-in to earn Tonix', 100, 24),
('weekly', 'weekly', 'Weekly Check-in', 'Complete your weekly check-in for bonus rewards', 500, 168),
('special', 'once', 'Follow Twitter Account', 'Follow our official Twitter account', 200, 0),
('special', 'once', 'Join Telegram Channel', 'Join our official Telegram channel', 300, 0),
('special', 'once', 'Join Community Group', 'Join our community discussion group', 250, 0);

-- Create function to check if user can do a task
CREATE OR REPLACE FUNCTION public.can_user_do_task(user_telegram_id bigint, system_task_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_record record;
  last_completion timestamp with time zone;
  cooldown_end timestamp with time zone;
BEGIN
  -- Get system task info
  SELECT * INTO task_record 
  FROM public.system_tasks 
  WHERE id = system_task_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Get last completion
  SELECT completed_at INTO last_completion
  FROM public.tasks
  WHERE telegram_id = user_telegram_id 
    AND task_name = task_record.task_name
    AND status = 'completed'
  ORDER BY completed_at DESC
  LIMIT 1;
  
  -- If never completed and it's a one-time task, allow
  IF last_completion IS NULL THEN
    RETURN true;
  END IF;
  
  -- If it's a one-time task and already completed, don't allow
  IF task_record.frequency = 'once' THEN
    RETURN false;
  END IF;
  
  -- Calculate cooldown end
  cooldown_end := last_completion + (task_record.cooldown_hours || ' hours')::interval;
  
  -- Check if cooldown has passed
  RETURN now() >= cooldown_end;
END;
$$;

-- Create function to complete a task
CREATE OR REPLACE FUNCTION public.complete_task(user_telegram_id bigint, system_task_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_record record;
  can_complete boolean;
  new_task_id uuid;
  result json;
BEGIN
  -- Get system task info
  SELECT * INTO task_record 
  FROM public.system_tasks 
  WHERE id = system_task_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Task not found');
  END IF;
  
  -- Check if user can complete this task
  SELECT public.can_user_do_task(user_telegram_id, system_task_id) INTO can_complete;
  
  IF NOT can_complete THEN
    RETURN json_build_object('success', false, 'message', 'Task not available or already completed');
  END IF;
  
  -- Insert task completion record
  INSERT INTO public.tasks (
    telegram_id, 
    task_type, 
    task_name, 
    description,
    category,
    frequency,
    tonix_earned,
    status,
    completed_at,
    cooldown_hours,
    is_repeatable,
    next_available_at
  ) VALUES (
    user_telegram_id,
    task_record.category,
    task_record.task_name,
    task_record.description,
    task_record.category,
    task_record.frequency,
    task_record.tonix_reward,
    'completed',
    now(),
    task_record.cooldown_hours,
    task_record.frequency != 'once',
    CASE 
      WHEN task_record.frequency = 'once' THEN NULL
      ELSE now() + (task_record.cooldown_hours || ' hours')::interval
    END
  ) RETURNING id INTO new_task_id;
  
  -- Update user's total Tonix
  UPDATE public.users 
  SET total_tonix = COALESCE(total_tonix, 0) + task_record.tonix_reward,
      updated_at = now()
  WHERE telegram_id = user_telegram_id;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Task completed successfully',
    'tonix_earned', task_record.tonix_reward,
    'task_id', new_task_id
  );
END;
$$;