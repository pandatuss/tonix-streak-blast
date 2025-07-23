-- Ensure all tonix functions properly accumulate rewards without resetting

-- Fix the process_referral_signup function to ensure proper accumulation
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
  new_balance INTEGER;
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
  INSERT INTO public.users (telegram_id, total_tonix, level)
  VALUES (referrer_id, 0, 0)
  ON CONFLICT (telegram_id) DO NOTHING;
  
  -- Get current balance
  SELECT COALESCE(total_tonix, 0) INTO current_balance
  FROM public.users
  WHERE telegram_id = referrer_id;
  
  -- Calculate new balance
  new_balance := current_balance + 50;
  
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
  
  -- Update referrer's balance (accumulate, don't reset)
  UPDATE public.users 
  SET total_tonix = new_balance,
      level = FLOOR(new_balance / 10),
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

-- Fix the update_referral_commission function to ensure proper accumulation
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
  new_balance INTEGER;
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
    INSERT INTO public.users (telegram_id, total_tonix, level)
    VALUES (referrer_id, 0, 0)
    ON CONFLICT (telegram_id) DO NOTHING;
    
    -- Get current balance
    SELECT COALESCE(total_tonix, 0) INTO current_balance
    FROM public.users
    WHERE telegram_id = referrer_id;
    
    -- Calculate new balance
    new_balance := current_balance + commission_amount;
    
    -- Update referral commission
    UPDATE public.referrals 
    SET commission_earned = COALESCE(commission_earned, 0) + commission_amount
    WHERE referred_telegram_id = referred_user_telegram_id;
    
    -- Update referrer's balance (accumulate, don't reset)
    UPDATE public.users 
    SET total_tonix = new_balance,
        level = FLOOR(new_balance / 10),
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