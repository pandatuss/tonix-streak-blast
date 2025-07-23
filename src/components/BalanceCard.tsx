import { Card } from "@/components/ui/card";

interface BalanceCardProps {
  balance?: number;
}

export const BalanceCard = ({ balance = 50.042 }: BalanceCardProps) => {
  return (
    <Card className="bg-gradient-card shadow-card border-border/20 p-8 text-center space-y-4 card-hover animate-slide-up">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          Your Balance
        </p>
        <div className="space-y-1">
          <p className="text-4xl font-bold text-foreground">
            {balance.toFixed(3)}
          </p>
          <p className="text-primary text-lg font-semibold">
            TONIX
          </p>
        </div>
      </div>
    </Card>
  );
};