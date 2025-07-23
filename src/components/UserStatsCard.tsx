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
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray={`${(level / 10) * 100}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{level}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">LEVEL</p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray={`${(totalDays / 30) * 100}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{totalDays}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">DAYS</p>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--success))"
              strokeWidth="2"
              strokeDasharray="75, 100"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-success">{totalTonix.toFixed(0)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">TOTAL</p>
      </div>
    </div>
  );
};