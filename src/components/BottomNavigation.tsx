import { Briefcase, Gift, Home, Trophy, Users, Coins, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'HOME' },
  { id: 'bonuses', icon: Gift, label: 'TASK' },
  { id: 'earn', icon: Coins, label: 'EARN' },
  { id: 'items', icon: Package, label: 'ITEMS' },
  { id: 'leaderboard', icon: Trophy, label: 'RANKING' },
  { id: 'profile', icon: Users, label: 'FRENS' },
];

export const BottomNavigation = ({ 
  activeTab = 'home', 
  onTabChange 
}: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-card backdrop-blur-lg border-t border-border/20 px-4 py-3 safe-area-pb">
      <div className="flex justify-between items-center max-w-md mx-auto px-2">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <Button
              key={id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange?.(id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-smooth ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'animate-bounce-gentle' : ''}`} />
              <span className="text-xs font-medium">
                {label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};