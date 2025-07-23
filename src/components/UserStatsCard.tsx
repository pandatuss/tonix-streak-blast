import { Card } from "@/components/ui/card";
import { Trophy, Calendar, Coins } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

interface UserStatsCardProps {
  telegramId?: number;
  level?: number;
}

export const UserStatsCard = ({ 
  telegramId,
  level = 5
}: UserStatsCardProps) => {
  const { userData } = useUserData(telegramId);
  const totalDays = userData?.totalDays || 0;
  const totalTonix = userData?.totalTonix || 0;
  return (
    <div className="grid grid-cols-3 gap-4 animate-slide-up">
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16 bg-primary/10 rounded-lg border-2 border-primary/20 flex flex-col items-center justify-center">
          <Trophy className="w-6 h-6 text-primary mb-1" />
          <span className="text-xs font-bold text-primary">{level}</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">LEVEL</p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16 bg-blue-500/10 rounded-lg border-2 border-blue-500/20 flex flex-col items-center justify-center">
          <Calendar className="w-6 h-6 text-blue-500 mb-1" />
          <span className="text-xs font-bold text-blue-500">{totalDays}</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">DAYS</p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16 bg-yellow-500/10 rounded-lg border-2 border-yellow-500/20 flex flex-col items-center justify-center">
          <Coins className="w-6 h-6 text-yellow-500 mb-1" />
          <span className="text-xs font-bold text-yellow-500">{totalTonix.toFixed(0)}</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">TOTAL</p>
      </div>
    </div>
  );
};