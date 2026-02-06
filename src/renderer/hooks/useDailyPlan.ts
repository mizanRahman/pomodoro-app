import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import type { DailyPlan, Task } from '../../shared/types';

const getApi = () => window.api;

function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function useDailyPlan(tasks: Task[]) {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const today = getToday();

  const refresh = useCallback(async () => {
    const api = getApi();
    if (!api) return;
    const data = await api.getDailyPlan(today);
    setPlan(data);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (updates: Partial<DailyPlan>) => {
      const api = getApi();
      if (!api) return;
      const updated: DailyPlan = {
        date: today,
        scheduledTaskIds: plan?.scheduledTaskIds || [],
        ...plan,
        ...updates,
      };
      const saved = await api.saveDailyPlan(updated);
      setPlan(saved);
      return saved;
    },
    [plan, today]
  );

  const addTask = useCallback(
    async (taskId: string) => {
      const current = plan?.scheduledTaskIds || [];
      if (current.includes(taskId)) return;
      await save({ scheduledTaskIds: [...current, taskId] });
    },
    [plan, save]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      const current = plan?.scheduledTaskIds || [];
      await save({ scheduledTaskIds: current.filter((id) => id !== taskId) });
    },
    [plan, save]
  );

  const reorderTasks = useCallback(
    async (taskIds: string[]) => {
      await save({ scheduledTaskIds: taskIds });
    },
    [save]
  );

  const startDay = useCallback(async () => {
    await save({ startedAt: new Date().toISOString() });
  }, [save]);

  const completeDay = useCallback(async () => {
    await save({ completedAt: new Date().toISOString() });
  }, [save]);

  const setActiveTask = useCallback(
    async (taskId: string | null) => {
      await save({ activeTaskId: taskId ?? undefined });
    },
    [save]
  );

  const scheduledTasks = useMemo(() => {
    if (!plan?.scheduledTaskIds) return [];
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    return plan.scheduledTaskIds
      .map((id) => taskMap.get(id))
      .filter((t): t is Task => t !== undefined);
  }, [plan?.scheduledTaskIds, tasks]);

  const totalEstimatedMinutes = useMemo(() => {
    return scheduledTasks.reduce((sum, t) => sum + t.timeEstimateMinutes, 0);
  }, [scheduledTasks]);

  const nextTask = useMemo(() => {
    const incomplete = scheduledTasks.filter((t) => t.status !== 'completed');
    return incomplete[0] || null;
  }, [scheduledTasks]);

  return {
    plan,
    loading,
    scheduledTasks,
    totalEstimatedMinutes,
    nextTask,
    refresh,
    save,
    addTask,
    removeTask,
    reorderTasks,
    startDay,
    completeDay,
    setActiveTask,
    isDayStarted: !!plan?.startedAt,
    isDayCompleted: !!plan?.completedAt,
  };
}
