import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Zap, Copy, Share, Gift } from 'lucide-react';
import { useReferralData } from '@/hooks/useReferralData';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';

export const ReferralPage = () => {
  const { telegramUser } = useTelegramWebApp();
  const { referralStats, loading, processReferralCode, shareInviteLink, copyReferralCode } = useReferralData(telegramUser?.id);
  const { toast } = useToast();
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApplyReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referral code",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    const result = await processReferralCode(referralCodeInput.trim());
    
    if (result.success) {
      toast({
        title: "Success!",
        description: "Referral code applied successfully! You both earned bonus Tonix!",
      });
      setReferralCodeInput('');
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to apply referral code",
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
  };

  const handleCopyCode = async () => {
    const success = await copyReferralCode();
    if (success) {
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to copy referral code",
        variant: "destructive"
      });
    }
  };

  const handleShareLink = async () => {
    const success = await shareInviteLink();
    if (success) {
      toast({
        title: "Shared!",
        description: "Invite link shared successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to share invite link",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading referral data...</div>;
  }

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Invite Friends</h1>
        <p className="text-muted-foreground">
          Earn 50 Tonix for each friend you refer!
        </p>
      </div>

      {/* Referral Code Input */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold">Have a Referral Code?</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Enter a friend's referral code to earn bonus Tonix for both of you!
        </p>
        <div className="flex gap-3">
          <Input
            placeholder="Enter referral code..."
            value={referralCodeInput}
            onChange={(e) => setReferralCodeInput(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleApplyReferralCode}
            disabled={isProcessing}
            className="px-6"
          >
            {isProcessing ? "Applying..." : "Apply"}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-3" />
          <div className="text-2xl font-bold text-foreground mb-1">
            {referralStats.totalReferrals}
          </div>
          <p className="text-sm text-muted-foreground">Total Referrals</p>
        </Card>

        <Card className="p-6 text-center">
          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-foreground mb-1">
            {referralStats.totalEarned}
          </div>
          <p className="text-sm text-muted-foreground">Total Earned</p>
        </Card>
      </div>

      {/* Your Referral Code */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-2">Your Referral Code</h2>
        <div className="bg-primary/10 p-4 rounded-lg text-center mb-4">
          <div className="text-2xl font-mono font-bold text-primary mb-2">
            {referralStats.referralCode}
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code and earn 10% of all Tonix your friends make!
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCopyCode}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Code
          </Button>
          <Button
            onClick={handleShareLink}
            className="flex items-center gap-2"
          >
            <Share className="w-4 h-4" />
            Share Link
          </Button>
        </div>
      </Card>

      {/* How Referrals Work */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">How Referrals Work</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mt-0.5">
              1
            </div>
            <p className="text-muted-foreground">Share your referral code with friends</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mt-0.5">
              2
            </div>
            <p className="text-muted-foreground">They join using your code</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mt-0.5">
              3
            </div>
            <p className="text-muted-foreground">You earn 10% of all Tonix they make, forever!</p>
          </div>
        </div>
      </Card>
    </div>
  );
};