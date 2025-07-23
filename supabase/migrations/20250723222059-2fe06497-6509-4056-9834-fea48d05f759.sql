-- Create transactions table to track all tonix earnings
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'task_completion', 'referral_bonus', 'referral_commission'
  source_id UUID, -- references task_id, referral_id, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_transactions_telegram_id ON public.transactions(telegram_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- Update complete_task function to record transactions
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
    'task_id', new_task_id
  );
END;
$function$;

-- Update process_referral_signup function to record transactions
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
  
  -- Give referrer 50 bonus Tonix
  UPDATE public.users 
  SET total_tonix = COALESCE(total_tonix, 0) + 50,
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

-- Update update_referral_commission function to record transactions
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
    -- Update referral commission
    UPDATE public.referrals 
    SET commission_earned = COALESCE(commission_earned, 0) + commission_amount
    WHERE referred_telegram_id = referred_user_telegram_id;
    
    -- Give commission to referrer
    UPDATE public.users 
    SET total_tonix = COALESCE(total_tonix, 0) + commission_amount,
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