import { useState, useEffect } from "react";
import { UserHeader } from "@/components/UserHeader";
import { BalanceCard } from "@/components/BalanceCard";
import { DailyStreakCard } from "@/components/DailyStreakCard";
import { UserStatsCard } from "@/components/UserStatsCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TasksPage } from "@/components/TasksPage";
import { ReferralPage } from "@/components/ReferralPage";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Preloader } from "@/components/Preloader";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useUserData } from "@/hooks/useUserData";

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showPreloader, setShowPreloader] = useState(true);
  const { telegramUser, isLoading, error } = useTelegramWebApp();
  const { userData, loading: userDataLoading } = useUserData(telegramUser?.id);

  // Handle preloader completion
  useEffect(() => {
    if (!isLoading && !userDataLoading && telegramUser) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowPreloader(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, userDataLoading, telegramUser]);

  // Temporarily disable all loading states for development
  // Show the homepage directly
  
  if (error) {
    console.log("Telegram error:", error);
  }
  
  // Force show homepage for development

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6 pb-24">
            <UserHeader 
              telegramId={telegramUser?.id}
            />
            
            <div className="px-6 space-y-6">
              <BalanceCard telegramId={telegramUser?.id} />
              
              <DailyStreakCard 
                telegramId={telegramUser?.id}
              />
              
              <UserStatsCard 
                telegramId={telegramUser?.id}
              />
              
              <TransactionHistory 
                telegramId={telegramUser?.id}
              />
            </div>
          </div>
        );
      
      case 'bonuses':
        return <TasksPage telegramId={telegramUser?.id} />;
      
      case 'profile':
        return (
          <div className="mb-12">
            <ReferralPage />
          </div>
        );
      
      case 'earn':
      case 'items':
      case 'leaderboard':
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
