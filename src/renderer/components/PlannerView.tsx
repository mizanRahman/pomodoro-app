import React, { useCallback, useState } from 'react';
import { TaskInbox } from './TaskInbox';
import { DailyTimeline } from './DailyTimeline';
import { useTasks } from '../hooks/useTasks';
import { useDailyPlan } from '../hooks/useDailyPlan';

interface PlannerViewProps {
  onStartDay: () => void;
}

type PlannerTab = 'inbox' | 'plan';

export function PlannerView({ onStartDay }: PlannerViewProps) {
  const [tab, setTab] = useState<PlannerTab>('inbox');
  const { tasks, inboxTasks, create, update, remove, complete, schedule } = useTasks();
  const {
    scheduledTasks,
    totalEstimatedMinutes,
    plan,
    addTask,
    removeTask,
    reorderTasks,
    startDay,
    isDayStarted,
  } = useDailyPlan(tasks);

  const handleScheduleTask = useCallback(
    async (taskId: string) => {
      await schedule(taskId);
      await addTask(taskId);
    },
    [schedule, addTask]
  );

  const handleUnscheduleTask = useCallback(
    async (taskId: string) => {
      await update(taskId, { status: 'inbox' });
      await removeTask(taskId);
    },
    [update, removeTask]
  );

  const handleCompleteTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task?.status === 'completed') {
        await update(taskId, { status: 'scheduled', completedAt: undefined });
      } else {
        await complete(taskId);
      }
    },
    [tasks, complete, update]
  );

  const handleSetActive = useCallback(
    async (taskId: string) => {
      await update(taskId, { status: 'in-progress' });
      await window.api.setActiveTask(taskId);
      onStartDay();
    },
    [update, onStartDay]
  );

  const handleStartDay = useCallback(async () => {
    if (scheduledTasks.length === 0) return;
    await startDay();
    const firstTask = scheduledTasks.find((t) => t.status !== 'completed');
    if (firstTask) {
      await update(firstTask.id, { status: 'in-progress' });
      await window.api.setActiveTask(firstTask.id);
    }
    onStartDay();
  }, [scheduledTasks, startDay, update, onStartDay]);

  const completedCount = scheduledTasks.filter((t) => t.status === 'completed').length;
  const progress = scheduledTasks.length > 0 ? (completedCount / scheduledTasks.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full p-3">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-base font-bold text-gray-800 dark:text-gray-100">
          Plan Your Day
        </h1>
        {scheduledTasks.length > 0 && (
          <span className="text-xs text-gray-500">
            {completedCount}/{scheduledTasks.length} done
          </span>
        )}
      </div>

      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setTab('inbox')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            tab === 'inbox'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Inbox ({inboxTasks.length})
        </button>
        <button
          onClick={() => setTab('plan')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            tab === 'plan'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Today ({scheduledTasks.length})
        </button>
      </div>

      {scheduledTasks.length > 0 && (
        <div className="mb-2">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'inbox' && (
          <TaskInbox
            tasks={inboxTasks}
            onCreateTask={create}
            onScheduleTask={handleScheduleTask}
            onDeleteTask={remove}
          />
        )}

        {tab === 'plan' && (
          <DailyTimeline
            tasks={scheduledTasks}
            activeTaskId={plan?.activeTaskId}
            totalMinutes={totalEstimatedMinutes}
            onReorder={reorderTasks}
            onRemoveTask={handleUnscheduleTask}
            onCompleteTask={handleCompleteTask}
            onSetActive={handleSetActive}
          />
        )}
      </div>

      {scheduledTasks.length > 0 && !isDayStarted && (
        <button
          onClick={handleStartDay}
          className="mt-2 w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Start Day
        </button>
      )}

      {isDayStarted && (
        <div className="mt-2 text-center text-xs text-green-600 dark:text-green-400">
          Day in progress...
        </div>
      )}
    </div>
  );
}
