import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DailyStreakCardProps {
  currentStreak?: number;
  hasCheckedInToday?: boolean;
}

export const DailyStreakCard = ({ 
  currentStreak = 2, 
  hasCheckedInToday = false 
}: DailyStreakCardProps) => {
  const [checkedIn, setCheckedIn] = useState(hasCheckedInToday);
  const [timeLeft, setTimeLeft] = useState("");
  const { toast } = useToast();

  // Calculate next check-in time (UTC+4)
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const utc4Now = new Date(now.getTime() + (4 * 60 * 60 * 1000));
      const tomorrow = new Date(utc4Now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - utc4Now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = () => {
    setCheckedIn(true);
    toast({
      title: "Check-in successful!",
      description: "Streak maintained. Keep it up!",
      duration: 3000,
    });
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/20 p-6 space-y-6 card-hover animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Flame className={`h-6 w-6 text-primary ${!checkedIn ? 'streak-pulse' : ''}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Daily Streak Check-in
          </h3>
          <p className="text-muted-foreground text-sm">
            Keep your streak alive!
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary mb-1">
            {currentStreak} DAY STREAK
          </p>
          <p className="text-muted-foreground text-sm">
            Next check-in in: {timeLeft}
          </p>
        </div>

        {!checkedIn ? (
          <Button 
            variant="gradient" 
            size="lg" 
            onClick={handleCheckIn}
            className="w-full"
          >
            Check In
          </Button>
        ) : (
          <Button 
            variant="success" 
            size="lg" 
            disabled
            className="w-full"
          >
            <Check className="h-5 w-5 mr-2" />
            Streak Maintained Today
          </Button>
        )}
      </div>
    </Card>
  );
};