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
  currentStreak = 0, 
  hasCheckedInToday = false 
}: DailyStreakCardProps) => {
  const [streakCount, setStreakCount] = useState(currentStreak);
  const [checkedIn, setCheckedIn] = useState(hasCheckedInToday);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const { toast } = useToast();

  // Calculate time until next check-in (24 hours after last check-in)
  useEffect(() => {
    const updateTimer = () => {
      if (!checkInTime) return;
      
      const now = new Date();
      const nextCheckIn = new Date(checkInTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after check-in
      const diff = nextCheckIn.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCheckedIn(false);
        setCheckInTime(null);
        setTimeLeft("");
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    };

    if (checkInTime) {
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [checkInTime]);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckedIn(true);
    setCheckInTime(now);
    setStreakCount(prev => prev + 1);
    toast({
      title: "🎉 Check-in Successful!",
      description: "Your daily streak has been maintained! Come back in 24 hours.",
      duration: 4000,
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
          <span className="text-orange-400 text-sm font-bold">{streakCount}</span>
        </div>
      </div>

      <div className="space-y-3">
        {!checkedIn ? (
          <>
            <p className="text-muted-foreground text-xs">
              🔥 Your daily check-in is ready! Don't let your streak break.
            </p>
            <Button 
              variant="gradient" 
              size="sm" 
              onClick={handleCheckIn}
              className="w-full"
            >
              Daily Check-in
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-xs">
              ✅ Checked in! Next check-in available in:
            </p>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <div className="text-green-400 font-mono text-lg font-bold">
                {timeLeft}
              </div>
              <p className="text-green-300/70 text-xs mt-1">until next check-in</p>
            </div>
            <Button 
              variant="success" 
              size="sm" 
              disabled
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Streak Maintained
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};