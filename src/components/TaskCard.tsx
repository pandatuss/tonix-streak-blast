import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Coins, Calendar, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  taskName: string;
  description: string;
  tonixReward: number;
  category: 'daily' | 'weekly' | 'special';
  canComplete: boolean;
  isCompleted?: boolean;
  lastCompleted?: string;
  nextAvailable?: string;
  actionUrl?: string;
  onComplete: () => void;
  loading?: boolean;
}

export const TaskCard = ({
  taskName,
  description,
  tonixReward,
  category,
  canComplete,
  isCompleted,
  lastCompleted,
  nextAvailable,
  actionUrl,
  onComplete,
  loading = false
}: TaskCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'weekly':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'special':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusText = () => {
    if (isCompleted && category === 'special') {
      return 'Completed';
    }
    if (isCompleted && nextAvailable) {
      const nextDate = new Date(nextAvailable);
      if (nextDate > new Date()) {
        return `Available ${formatDistanceToNow(nextDate, { addSuffix: true })}`;
      }
    }
    if (canComplete) {
      return 'Available';
    }
    return 'Not Available';
  };

  const handleAction = () => {
    if (actionUrl && category === 'special') {
      window.open(actionUrl, '_blank');
    }
    onComplete();
  };

  return (
    <Card className="p-4 bg-gradient-card border-border/20 hover:border-primary/20 transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">{taskName}</h3>
            <Badge className={`text-xs ${getCategoryColor(category)}`}>
              {category.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-primary">
            <Coins className="h-4 w-4" />
            <span className="font-semibold">{tonixReward}</span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            {isCompleted && category !== 'special' ? (
              <>
                <Clock className="h-3 w-3" />
                <span>{getStatusText()}</span>
              </>
            ) : (
              <>
                {isCompleted ? (
                  <CheckCircle className="h-3 w-3 text-success" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                <span>{getStatusText()}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actionUrl && category === 'special' && canComplete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(actionUrl, '_blank')}
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
          )}
          
          <Button
            onClick={handleAction}
            disabled={!canComplete || loading}
            size="sm"
            variant={canComplete ? "default" : "secondary"}
            className="text-xs"
          >
            {loading ? (
              "Processing..."
            ) : isCompleted && category === 'special' ? (
              "Completed"
            ) : canComplete ? (
              "Complete"
            ) : (
              "Unavailable"
            )}
          </Button>
        </div>
      </div>

      {lastCompleted && (
        <div className="mt-2 pt-2 border-t border-border/20">
          <p className="text-xs text-muted-foreground">
            Last completed: {formatDistanceToNow(new Date(lastCompleted), { addSuffix: true })}
          </p>
        </div>
      )}
    </Card>
  );
};