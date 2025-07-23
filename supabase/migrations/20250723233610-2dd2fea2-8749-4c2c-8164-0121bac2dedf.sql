-- Fix complete_task function to ensure users exist and tonix accumulates properly
CREATE OR REPLACE FUNCTION public.complete_task(user_telegram_id bigint, system_task_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  task_record record;
  can_complete boolean;
  new_task_id uuid;
  current_balance integer;
  new_balance integer;
  new_level integer;
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
  
  -- Ensure user exists and get current balance
  INSERT INTO public.users (telegram_id, total_tonix, level)
  VALUES (user_telegram_id, 0, 0)
  ON CONFLICT (telegram_id) DO NOTHING;
  
  -- Get current balance (guaranteed to exist now)
  SELECT COALESCE(total_tonix, 0) INTO current_balance
  FROM public.users
  WHERE telegram_id = user_telegram_id;
  
  -- Calculate new balance by adding rewards to current balance
  new_balance := current_balance + task_record.tonix_reward;
  new_level := FLOOR(new_balance / 10); -- Every 10 tonix = 1 level
  
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
  
  -- Update user's total Tonix and level (accumulate, don't reset)
  UPDATE public.users 
  SET total_tonix = new_balance,
      level = new_level,
      updated_at = now()
  WHERE telegram_id = user_telegram_id;
  
  -- Record transaction
  INSERT INTO public.transactions (
    telegram_id,
    amount,
    transaction_type,
    source_id,
    description
  ) VALUES (
    user_telegram_id,
    task_record.tonix_reward,
    'task_completion',
    new_task_id,
    'Completed task: ' || task_record.task_name
  );
  
  -- Trigger referral commission if user was referred
  PERFORM public.update_referral_commission(user_telegram_id, task_record.tonix_reward);
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Task completed successfully',
    'tonix_earned', task_record.tonix_reward,
    'new_balance', new_balance,
    'new_level', new_level,
    'task_id', new_task_id
  );
END;
$function$;