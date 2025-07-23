import { Card } from "@/components/ui/card";
import { useUserData } from "@/hooks/useUserData";
import { useTransactions } from "@/hooks/useTransactions";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BalanceCardProps {
  telegramId?: number;
}

export const BalanceCard = ({ telegramId }: BalanceCardProps) => {
  const { userData, refreshData } = useUserData(telegramId);
  const { getTodaysEarnings } = useTransactions(telegramId);
  const balance = userData?.totalTonix || 0;
  const todaysEarnings = getTodaysEarnings();

  // Listen for real-time updates to user balance
  useEffect(() => {
    if (!telegramId) return;

    const channel = supabase
      .channel('user-balance-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `telegram_id=eq.${telegramId}`
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [telegramId, refreshData]);
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/10 p-6 text-center space-y-3 animate-slide-up">
      <div className="space-y-3">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          YOUR BALANCE
        </p>
        <div className="space-y-2">
          <p className="text-5xl font-bold text-foreground">
            {balance.toLocaleString()}
          </p>
          <p className="text-primary text-sm font-medium">
            TONIX
          </p>
        </div>
        <p className="text-success text-sm font-medium">
          Today: +{todaysEarnings.toLocaleString()}
        </p>
      </div>
    </Card>
  );
};