-- Fix security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION public.can_user_do_task(user_telegram_id bigint, system_task_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Fix security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION public.complete_task(user_telegram_id bigint, system_task_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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