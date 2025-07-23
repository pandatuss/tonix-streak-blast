import { Card } from "@/components/ui/card";

interface UserStatsCardProps {
  level?: number;
  totalDays?: number;
  totalTonix?: number;
}

export const UserStatsCard = ({ 
  level = 5, 
  totalDays = 17, 
  totalTonix = 50.042 
}: UserStatsCardProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 animate-slide-up">
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16 bg-primary/10 rounded-full border-2 border-primary/20 flex items-center justify-center">
          <div className="text-center">
            <span className="text-lg font-bold text-primary block">{level}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">LEVEL</p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16 bg-blue-500/10 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
          <div className="text-center">
            <span className="text-lg font-bold text-blue-500 block">{totalDays}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">DAYS</p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16 bg-success/10 rounded-full border-2 border-success/20 flex items-center justify-center">
          <div className="text-center">
            <span className="text-sm font-bold text-success block">{totalTonix.toFixed(0)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">TOTAL</p>
      </div>
    </div>
  );
};