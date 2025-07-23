-- Remove total_tonix column from users table since it keeps getting reset
-- Balance will be calculated from transactions table instead

ALTER TABLE public.users DROP COLUMN total_tonix;

-- Update complete_task function to not touch total_tonix anymore
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
  new_level integer;
  current_balance integer;
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
  
  -- Ensure user exists
  INSERT INTO public.users (telegram_id, level)
  VALUES (user_telegram_id, 0)
  ON CONFLICT (telegram_id) DO NOTHING;
  
  -- Calculate current balance from transactions
  SELECT COALESCE(SUM(amount), 0) INTO current_balance
  FROM public.transactions
  WHERE telegram_id = user_telegram_id;
  
  -- Calculate new balance and level
  current_balance := current_balance + task_record.tonix_reward;
  new_level := FLOOR(current_balance / 10);
  
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
  
  -- Update user's level (no more total_tonix)
  UPDATE public.users 
  SET level = new_level,
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
    'new_balance', current_balance,
    'new_level', new_level,
    'task_id', new_task_id
  );
END;
$function$;

-- Update process_referral_signup function to not touch total_tonix
CREATE OR REPLACE FUNCTION public.process_referral_signup(new_user_telegram_id bigint, referrer_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  referrer_id BIGINT;
  referral_exists BOOLEAN;
  new_referral_id UUID;
  current_balance INTEGER;
  new_level INTEGER;
BEGIN
  -- Check if referrer exists
  SELECT telegram_id INTO referrer_id 
  FROM public.users 
  WHERE referral_code = referrer_code;
  
  IF referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Invalid referral code');
  END IF;
  
  -- Check if referral already exists
  SELECT EXISTS(
    SELECT 1 FROM public.referrals 
    WHERE referred_telegram_id = new_user_telegram_id
  ) INTO referral_exists;
  
  IF referral_exists THEN
    RETURN json_build_object('success', false, 'message', 'User already referred');
  END IF;
  
  -- Ensure referrer exists in users table
  INSERT INTO public.users (telegram_id, level)
  VALUES (referrer_id, 0)
  ON CONFLICT (telegram_id) DO NOTHING;
  
  -- Calculate current balance from transactions
  SELECT COALESCE(SUM(amount), 0) INTO current_balance
  FROM public.transactions
  WHERE telegram_id = referrer_id;
  
  -- Calculate new balance and level
  current_balance := current_balance + 50;
  new_level := FLOOR(current_balance / 10);
  
  -- Insert referral record
  INSERT INTO public.referrals (
    referrer_telegram_id,
    referred_telegram_id,
    bonus_tonix
  ) VALUES (
    referrer_id,
    new_user_telegram_id,
    50
  ) RETURNING id INTO new_referral_id;
  
  -- Update referrer's level (no more total_tonix)
  UPDATE public.users 
  SET level = new_level,
      updated_at = now()
  WHERE telegram_id = referrer_id;
  
  -- Record transaction for referral bonus
  INSERT INTO public.transactions (
    telegram_id,
    amount,
    transaction_type,
    source_id,
    description
  ) VALUES (
    referrer_id,
    50,
    'referral_bonus',
    new_referral_id,
    'Referral signup bonus'
  );
  
  RETURN json_build_object('success', true, 'message', 'Referral processed successfully');
END;
$function$;

-- Update update_referral_commission function to not touch total_tonix
CREATE OR REPLACE FUNCTION public.update_referral_commission(referred_user_telegram_id bigint, tonix_earned integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  referrer_id BIGINT;
  commission_amount INTEGER;
  referral_id UUID;
  current_balance INTEGER;
  new_level INTEGER;
BEGIN
  -- Get referrer and referral record
  SELECT r.referrer_telegram_id, r.id INTO referrer_id, referral_id
  FROM public.referrals r
  WHERE r.referred_telegram_id = referred_user_telegram_id;
  
  IF referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'No referrer found');
  END IF;
  
  -- Calculate 10% commission
  commission_amount := FLOOR(tonix_earned * 0.1);
  
  IF commission_amount > 0 THEN
    -- Ensure referrer exists in users table
    INSERT INTO public.users (telegram_id, level)
    VALUES (referrer_id, 0)
    ON CONFLICT (telegram_id) DO NOTHING;
    
    -- Calculate current balance from transactions
    SELECT COALESCE(SUM(amount), 0) INTO current_balance
    FROM public.transactions
    WHERE telegram_id = referrer_id;
    
    -- Calculate new balance and level
    current_balance := current_balance + commission_amount;
    new_level := FLOOR(current_balance / 10);
    
    -- Update referral commission
    UPDATE public.referrals 
    SET commission_earned = COALESCE(commission_earned, 0) + commission_amount
    WHERE referred_telegram_id = referred_user_telegram_id;
    
    -- Update referrer's level (no more total_tonix)
    UPDATE public.users 
    SET level = new_level,
        updated_at = now()
    WHERE telegram_id = referrer_id;
    
    -- Record transaction for commission
    INSERT INTO public.transactions (
      telegram_id,
      amount,
      transaction_type,
      source_id,
      description
    ) VALUES (
      referrer_id,
      commission_amount,
      'referral_commission',
      referral_id,
      'Commission from friend''s task completion'
    );
  END IF;
  
  RETURN json_build_object('success', true, 'commission_earned', commission_amount);
END;
$function$;