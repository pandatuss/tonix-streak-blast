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
    <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 p-4 space-y-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <Flame className={`h-5 w-5 text-orange-400 ${!checkedIn ? 'streak-pulse' : ''}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">
            Daily Streak Check-in
          </h3>
          <p className="text-muted-foreground text-xs">
            Keep your streak alive!
          </p>
        </div>
        <div className="text-right">
          <span className="text-orange-400 text-sm font-bold">{currentStreak}</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-muted-foreground text-xs">
          🔥 Your daily check-in is ready! Don't let your streak break.
        </p>

        {!checkedIn ? (
          <Button 
            variant="gradient" 
            size="sm" 
            onClick={handleCheckIn}
            className="w-full"
          >
            Check in (100 pts)
          </Button>
        ) : (
          <Button 
            variant="success" 
            size="sm" 
            disabled
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Checked in today
          </Button>
        )}
      </div>
    </Card>
  );
};