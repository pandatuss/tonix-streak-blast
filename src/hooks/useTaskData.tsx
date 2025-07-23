import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemTask {
  id: string;
  category: 'daily' | 'weekly' | 'special';
  frequency: 'daily' | 'weekly' | 'once';
  task_name: string;
  description: string;
  tonix_reward: number;
  action_url?: string;
  cooldown_hours: number;
  is_active: boolean;
}

interface UserTask {
  id: string;
  telegram_id: number;
  task_name: string;
  description?: string;
  category: string;
  frequency: string;
  tonix_earned: number;
  status: 'pending' | 'completed' | 'available';
  completed_at?: string;
  next_available_at?: string;
  is_repeatable: boolean;
}

interface TaskStatus {
  systemTask: SystemTask;
  canComplete: boolean;
  lastCompleted?: string;
  nextAvailable?: string;
}

export const useTaskData = (telegramId?: number) => {
  const [systemTasks, setSystemTasks] = useState<SystemTask[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSystemTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('system_tasks')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('tonix_reward', { ascending: false });

      if (error) throw error;
      setSystemTasks((data || []) as SystemTask[]);
    } catch (error) {
      console.error('Error fetching system tasks:', error);
    }
  };

  const fetchUserTasks = async () => {
    if (!telegramId) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('telegram_id', telegramId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setUserTasks((data || []) as UserTask[]);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    }
  };

  const checkTaskStatuses = async () => {
    if (!telegramId || systemTasks.length === 0) return;

    const statuses: TaskStatus[] = [];

    for (const systemTask of systemTasks) {
      try {
        const { data: canComplete, error } = await supabase
          .rpc('can_user_do_task', {
            user_telegram_id: telegramId,
            system_task_id: systemTask.id
          });

        if (error) throw error;

        // Get last completion for this task
        const lastUserTask = userTasks.find(
          ut => ut.task_name === systemTask.task_name && ut.status === 'completed'
        );

        statuses.push({
          systemTask,
          canComplete: canComplete || false,
          lastCompleted: lastUserTask?.completed_at,
          nextAvailable: lastUserTask?.next_available_at
        });
      } catch (error) {
        console.error(`Error checking task status for ${systemTask.task_name}:`, error);
        statuses.push({
          systemTask,
          canComplete: false
        });
      }
    }

    setTaskStatuses(statuses);
  };

  const completeTask = async (systemTaskId: string): Promise<boolean> => {
    if (!telegramId) return false;

    try {
      const { data, error } = await supabase
        .rpc('complete_task', {
          user_telegram_id: telegramId,
          system_task_id: systemTaskId
        });

      if (error) throw error;

      const result = data as { success: boolean; message: string; tonix_earned?: number };

      if (result.success) {
        toast({
          title: "Task Completed!",
          description: `You earned ${result.tonix_earned} Tonix!`,
        });
        
        // Refresh data
        await Promise.all([fetchUserTasks(), checkTaskStatuses()]);
        
        // Trigger user data refresh via custom event for balance updates
        window.dispatchEvent(new CustomEvent('userDataRefresh'));
        return true;
      } else {
        toast({
          title: "Task Failed",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchSystemTasks(), fetchUserTasks()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [telegramId]);

  useEffect(() => {
    if (systemTasks.length > 0) {
      checkTaskStatuses();
    }
  }, [systemTasks, userTasks, telegramId]);

  const getTasksByCategory = (category: 'daily' | 'weekly' | 'special') => {
    return taskStatuses.filter(status => status.systemTask.category === category);
  };

  return {
    systemTasks,
    userTasks,
    taskStatuses,
    loading,
    completeTask,
    refreshData,
    getTasksByCategory
  };
};