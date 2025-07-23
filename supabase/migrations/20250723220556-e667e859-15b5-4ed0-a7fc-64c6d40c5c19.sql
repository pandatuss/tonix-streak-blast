-- Add commission tracking to referrals table
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS commission_earned INTEGER DEFAULT 0;

-- Add referral code to users table (using telegram_id as referral code)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Update existing users to set referral code as their telegram_id
UPDATE public.users SET referral_code = telegram_id::text WHERE referral_code IS NULL;

-- Create function to process referral signup
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  new_user_telegram_id BIGINT,
  referrer_code TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  referrer_id BIGINT;
  referral_exists BOOLEAN;
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
  );
  
  -- Give referrer 50 bonus Tonix
  UPDATE public.users 
  SET total_tonix = COALESCE(total_tonix, 0) + 50,
      updated_at = now()
  WHERE telegram_id = referrer_id;
  
  RETURN json_build_object('success', true, 'message', 'Referral processed successfully');
END;
$$;

-- Create function to calculate and update commission
CREATE OR REPLACE FUNCTION public.update_referral_commission(
  referred_user_telegram_id BIGINT,
  tonix_earned INTEGER
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  referrer_id BIGINT;
  commission_amount INTEGER;
BEGIN
  -- Get referrer
  SELECT referrer_telegram_id INTO referrer_id
  FROM public.referrals
  WHERE referred_telegram_id = referred_user_telegram_id;
  
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
  END IF;
  
  RETURN json_build_object('success', true, 'commission_earned', commission_amount);
END;
$$;