import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStatus, TaskPriority, EnergyLevel } from '../../shared/types';

const getApi = () => window.api;

export interface CreateTaskInput {
  title: string;
  description?: string;
  timeEstimateMinutes: number;
  priority: TaskPriority;
  category?: string;
  energyLevel?: EnergyLevel;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const api = getApi();
    if (!api) return;
    const data = await api.getTasks();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: CreateTaskInput): Promise<Task> => {
      const api = getApi();
      if (!api) throw new Error('API not available');
      const task = await api.createTask({
        ...input,
        status: 'inbox',
      });
      setTasks((prev) => [task, ...prev]);
      return task;
    },
    []
  );

  const update = useCallback(async (id: string, updates: Partial<Task>): Promise<Task> => {
    const api = getApi();
    if (!api) throw new Error('API not available');
    const updated = await api.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    const api = getApi();
    if (!api) throw new Error('API not available');
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const complete = useCallback(
    async (id: string): Promise<Task> => {
      return update(id, { status: 'completed', completedAt: new Date().toISOString() });
    },
    [update]
  );

  const schedule = useCallback(
    async (id: string): Promise<Task> => {
      return update(id, { status: 'scheduled' });
    },
    [update]
  );

  const inboxTasks = tasks.filter((t) => t.status === 'inbox');
  const scheduledTasks = tasks.filter((t) => t.status === 'scheduled');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return {
    tasks,
    inboxTasks,
    scheduledTasks,
    completedTasks,
    loading,
    refresh,
    create,
    update,
    remove,
    complete,
    schedule,
  };
}

export function useActiveTask() {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    const api = getApi();
    if (!api) return;

    api.getActiveTask?.().then((id) => {
      if (id) setActiveTaskId(id);
    });

    if (!api.onActiveTaskChange) return;
    return api.onActiveTaskChange(setActiveTaskId);
  }, []);

  const setActive = useCallback(async (taskId: string | null) => {
    const api = getApi();
    if (!api) return;
    await api.setActiveTask(taskId);
    setActiveTaskId(taskId);
  }, []);

  return { activeTaskId, setActive };
}
