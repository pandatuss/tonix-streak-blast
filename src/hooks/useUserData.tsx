import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePhotoUrl?: string;
  totalTonix: number;
  currentStreak: number;
  lastCheckinDate?: string;
  totalDays: number;
  level: number;
}

interface Task {
  id: string;
  taskType: string;
  taskName: string;
  status: 'pending' | 'completed' | 'failed';
  tonixEarned: number;
  completedAt?: string;
  createdAt: string;
}

export const useUserData = (telegramId?: number) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserData = async () => {
    if (!telegramId) return;

    try {
      // Always fetch fresh data from database to avoid stale state
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle(); // Use maybeSingle to avoid errors when user doesn't exist

      if (userError) {
        console.error('Error fetching user:', userError);
        setLoading(false);
        return;
      }

      if (user) {
        setUserData({
          telegramId: user.telegram_id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          profilePhotoUrl: user.profile_photo_url,
          totalTonix: user.total_tonix || 0,
          currentStreak: user.current_streak || 0,
          lastCheckinDate: user.last_checkin_date,
          totalDays: user.total_days || 0,
          level: user.level || 0,
        });
      } else {
        // User doesn't exist yet
        setUserData(null);
      }

      // Fetch user tasks
      const { data: userTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('telegram_id', telegramId)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      } else {
        setTasks(userTasks.map(task => ({
          id: task.id,
          taskType: task.task_type,
          taskName: task.task_name,
          status: task.status as 'pending' | 'completed' | 'failed',
          tonixEarned: task.tonix_earned || 0,
          completedAt: task.completed_at,
          createdAt: task.created_at,
        })));
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDailyStreak = async (): Promise<boolean> => {
    if (!telegramId || !userData) return false;

    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = userData.lastCheckinDate;

    // Check if already checked in today
    if (lastCheckin === today) {
      toast({
        title: "Already checked in!",
        description: "You've already checked in today. Come back tomorrow!",
        duration: 3000,
      });
      return false;
    }

    try {
      let newStreak = userData.currentStreak;
      
      // If last checkin was yesterday, increment streak
      if (lastCheckin) {
        const lastDate = new Date(lastCheckin);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          newStreak += 1;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
        }
      } else {
        // First time checking in
        newStreak = 1;
      }

      const { error } = await supabase
        .from('users')
        .update({
          current_streak: newStreak,
          last_checkin_date: today,
          total_days: userData.totalDays + 1,
        })
        .eq('telegram_id', telegramId);

      if (error) {
        console.error('Error updating streak:', error);
        return false;
      }

      setUserData(prev => prev ? {
        ...prev,
        currentStreak: newStreak,
        lastCheckinDate: today,
        totalDays: prev.totalDays + 1,
      } : null);

      return true;
    } catch (error) {
      console.error('Error in updateDailyStreak:', error);
      return false;
    }
  };

  // All tonix management is now handled by database functions via useTaskData hook
  // This ensures proper accumulation and prevents balance resets

  useEffect(() => {
    fetchUserData();
  }, [telegramId]);

  // Listen for task completion events to refresh user data
  useEffect(() => {
    const handleUserDataRefresh = () => {
      fetchUserData();
    };

    window.addEventListener('userDataRefresh', handleUserDataRefresh);
    return () => {
      window.removeEventListener('userDataRefresh', handleUserDataRefresh);
    };
  }, [telegramId]);

  return {
    userData,
    tasks,
    loading,
    updateDailyStreak,
    refreshData: fetchUserData,
  };
};