import { Card } from "@/components/ui/card";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface TransactionHistoryProps {
  telegramId?: number;
}

const getTransactionTypeColor = (type: Transaction['transaction_type']) => {
  switch (type) {
    case 'task_completion':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'referral_bonus':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'referral_commission':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getTransactionTypeLabel = (type: Transaction['transaction_type']) => {
  switch (type) {
    case 'task_completion':
      return 'Task';
    case 'referral_bonus':
      return 'Referral';
    case 'referral_commission':
      return 'Commission';
    default:
      return type;
  }
};

export const TransactionHistory = ({ telegramId }: TransactionHistoryProps) => {
  const { transactions, loading } = useTransactions(telegramId);

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/10 p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Earnings</h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-12 h-6 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-muted rounded"></div>
                  <div className="w-1/2 h-3 bg-muted rounded"></div>
                </div>
                <div className="w-16 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/10 p-6">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Recent Earnings</h3>
          <p className="text-muted-foreground">No transactions yet. Complete tasks to start earning!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/10 p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Earnings</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background/20 border border-border/10"
            >
              <div className="flex items-center space-x-3">
                <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                  {getTransactionTypeLabel(transaction.transaction_type)}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-success">
                  +{transaction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">TONIX</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};