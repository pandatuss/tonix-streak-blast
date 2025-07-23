import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReferralStats {
  totalReferrals: number;
  totalEarned: number;
  referralCode: string;
}

export const useReferralData = (telegramId?: number) => {
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalEarned: 0,
    referralCode: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchReferralStats = async () => {
    if (!telegramId) return;

    try {
      setLoading(true);

      // Get user's referral code
      const { data: userData } = await supabase
        .from('users')
        .select('referral_code')
        .eq('telegram_id', telegramId)
        .single();

      // Get referral statistics
      const { data: referrals } = await supabase
        .from('referrals')
        .select('bonus_tonix, commission_earned')
        .eq('referrer_telegram_id', telegramId);

      const totalReferrals = referrals?.length || 0;
      const totalEarned = referrals?.reduce((sum, ref) => 
        sum + (ref.bonus_tonix || 0) + (ref.commission_earned || 0), 0
      ) || 0;

      setReferralStats({
        totalReferrals,
        totalEarned,
        referralCode: userData?.referral_code || telegramId?.toString() || ''
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReferralCode = async (referrerCode: string): Promise<{ success: boolean; message: string }> => {
    if (!telegramId) return { success: false, message: 'User not authenticated' };

    try {
      const { data, error } = await supabase.rpc('process_referral_signup', {
        new_user_telegram_id: telegramId,
        referrer_code: referrerCode
      });

      if (error) throw error;
      
      // Refresh stats after processing
      await fetchReferralStats();
      
      return data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error processing referral:', error);
      return { success: false, message: 'Failed to process referral code' };
    }
  };

  const generateInviteLink = () => {
    const botUsername = 'tonixglobalbot';
    const referralCode = referralStats.referralCode;
    
    // Create Telegram bot link with start parameter
    return `https://t.me/${botUsername}?start=${referralCode}`;
  };

  const shareInviteLink = async () => {
    const inviteLink = generateInviteLink();
    const shareText = `🎯 Join Tonix Global and earn rewards! Use my referral code: ${referralStats.referralCode}\n\n${inviteLink}`;
    
    // Use Web Share API or Telegram sharing if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Tonix Global',
          text: shareText,
          url: inviteLink
        });
        return true;
      } catch (error) {
        console.error('Error sharing via Web Share API:', error);
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralStats.referralCode);
      return true;
    } catch (error) {
      console.error('Error copying referral code:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, [telegramId]);

  return {
    referralStats,
    loading,
    processReferralCode,
    generateInviteLink,
    shareInviteLink,
    copyReferralCode,
    refreshStats: fetchReferralStats
  };
};