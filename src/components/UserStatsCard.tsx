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
    <Card className="bg-gradient-card shadow-card border-border/20 p-6 animate-slide-up">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Level
          </p>
          <p className="text-2xl font-bold text-primary">
            {level}
          </p>
        </div>
        
        <div className="space-y-2 border-x border-border/30">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Days
          </p>
          <p className="text-2xl font-bold text-foreground">
            {totalDays}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Total
          </p>
          <p className="text-lg font-bold text-success">
            {totalTonix.toFixed(3)}
          </p>
          <p className="text-xs text-muted-foreground">
            TONIX
          </p>
        </div>
      </div>
    </Card>
  );
};