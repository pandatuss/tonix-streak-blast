import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from '@/components/TaskCard';
import { useTaskData } from '@/hooks/useTaskData';
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Award, Star, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TasksPageProps {
  telegramId?: number;
}

export const TasksPage = ({ telegramId }: TasksPageProps) => {
  const { taskStatuses, loading, completeTask, refreshData, getTasksByCategory } = useTaskData(telegramId);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const handleCompleteTask = async (systemTaskId: string) => {
    setCompletingTaskId(systemTaskId);
    await completeTask(systemTaskId);
    setCompletingTaskId(null);
  };

  const TaskSection = ({ category, title, icon, emptyMessage }: {
    category: 'daily' | 'weekly' | 'special';
    title: string;
    icon: React.ReactNode;
    emptyMessage: string;
  }) => {
    const tasks = getTasksByCategory(category);

    if (loading) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            {icon}
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-semibold">{title}</h2>
            <span className="text-sm text-muted-foreground">({tasks.length})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((taskStatus) => {
              const isCompleted = !taskStatus.canComplete && 
                (taskStatus.systemTask.frequency === 'once' || Boolean(taskStatus.lastCompleted));
              
              return (
                <TaskCard
                  key={taskStatus.systemTask.id}
                  taskName={taskStatus.systemTask.task_name}
                  description={taskStatus.systemTask.description}
                  tonixReward={taskStatus.systemTask.tonix_reward}
                  category={taskStatus.systemTask.category}
                  canComplete={taskStatus.canComplete}
                  isCompleted={isCompleted}
                  lastCompleted={taskStatus.lastCompleted}
                  nextAvailable={taskStatus.nextAvailable}
                  actionUrl={taskStatus.systemTask.action_url}
                  onComplete={() => handleCompleteTask(taskStatus.systemTask.id)}
                  loading={completingTaskId === taskStatus.systemTask.id}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Tasks</h1>
        <p className="text-muted-foreground">
          Complete tasks to earn Tonix and level up your account
        </p>
      </div>

      <div className="px-6">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="daily" className="text-xs">
              <Calendar className="h-4 w-4 mr-1" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">
              <Award className="h-4 w-4 mr-1" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="special" className="text-xs">
              <Star className="h-4 w-4 mr-1" />
              Special
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <TaskSection
              category="daily"
              title="Daily Tasks"
              icon={<Calendar className="h-5 w-5 text-blue-400" />}
              emptyMessage="No daily tasks available"
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <TaskSection
              category="weekly"
              title="Weekly Tasks"
              icon={<Award className="h-5 w-5 text-purple-400" />}
              emptyMessage="No weekly tasks available"
            />
          </TabsContent>

          <TabsContent value="special" className="space-y-4">
            <TaskSection
              category="special"
              title="Special Tasks"
              icon={<Star className="h-5 w-5 text-orange-400" />}
              emptyMessage="No special tasks available"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};