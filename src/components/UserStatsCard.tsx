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
        <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-lg border-2 border-primary/30 flex items-center justify-center shadow-lg">
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
          <span className="text-lg font-bold text-white">{level}</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">LEVEL</p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg border-2 border-blue-400/30 flex items-center justify-center shadow-lg">
          <div className="absolute top-1 left-1 w-1 h-1 bg-white/60 rounded-full"></div>
          <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full"></div>
          <span className="text-lg font-bold text-white">{totalDays}</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">DAYS</p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full border-2 border-yellow-300/50 flex items-center justify-center shadow-lg">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-yellow-300 rounded-full"></div>
          <span className="text-sm font-bold text-yellow-900">{totalTonix.toFixed(0)}</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">TOTAL</p>
      </div>
    </div>
  );
};