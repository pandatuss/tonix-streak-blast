import { Card } from "@/components/ui/card";

interface BalanceCardProps {
  balance?: number;
}

export const BalanceCard = ({ balance = 50.042 }: BalanceCardProps) => {
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
            Points
          </p>
        </div>
        <p className="text-success text-sm font-medium">
          Today: +100
        </p>
      </div>
    </Card>
  );
};