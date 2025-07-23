import { useState } from "react";
import { UserHeader } from "@/components/UserHeader";
import { BalanceCard } from "@/components/BalanceCard";
import { DailyStreakCard } from "@/components/DailyStreakCard";
import { UserStatsCard } from "@/components/UserStatsCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { telegramUser, isLoading, error } = useTelegramWebApp();

  // Default user data with Telegram integration
  const userData = {
    username: telegramUser?.username ? `@${telegramUser.username}` : "@tonixuser",
    firstName: telegramUser?.first_name || "Tonix",
    lastName: telegramUser?.last_name || "User",
    avatarUrl: telegramUser?.photo_url,
    balance: 127.856,
    currentStreak: 7,
    level: 8,
    totalDays: 24,
    totalTonix: 127.856,
    hasCheckedInToday: false
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle font-inter text-foreground pt-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Telegram data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle font-inter text-foreground pt-24 flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <div className="p-8 bg-gradient-card rounded-2xl shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6 pb-24">
            <UserHeader 
              username={userData.username}
              firstName={userData.firstName}
              lastName={userData.lastName}
              avatarUrl={userData.avatarUrl}
            />
            
            <div className="px-6 space-y-6">
              <BalanceCard balance={userData.balance} />
              
              <DailyStreakCard 
                currentStreak={userData.currentStreak}
                hasCheckedInToday={userData.hasCheckedInToday}
              />
              
              <UserStatsCard 
                level={userData.level}
                totalDays={userData.totalDays}
                totalTonix={userData.totalTonix}
              />
            </div>
          </div>
        );
      
      case 'inventory':
      case 'cases':
      case 'leaderboard':
      case 'profile':
        return (
          <div className="flex-1 flex items-center justify-center pb-24">
            <div className="text-center space-y-4 px-6">
              <div className="p-8 bg-gradient-card rounded-2xl shadow-card">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Coming Soon
                </h2>
                <p className="text-muted-foreground">
                  This feature is under development. Stay tuned for exciting updates!
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle font-inter text-foreground pt-24">
      <div className="max-w-md mx-auto min-h-screen bg-background relative">
        {renderContent()}
        
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

export default Index;
