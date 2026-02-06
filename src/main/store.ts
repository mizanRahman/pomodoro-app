import Store from 'electron-store';
import { format } from 'date-fns';
import type {
  StoreSchema,
  Settings,
  DailyStats,
  SessionRecord,
  Task,
  DailyPlan,
} from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/constants';

const store = new Store<StoreSchema>({
  defaults: {
    settings: DEFAULT_SETTINGS,
    stats: {},
    tasks: {},
    dailyPlans: {},
  },
});

export function getSettings(): Settings {
  return store.get('settings');
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  store.set('settings', updated);
  return updated;
}

export function getStats(): DailyStats {
  return store.get('stats');
}

export function recordCompletedPomodoro(workMinutes: number): void {
  const today = format(new Date(), 'yyyy-MM-dd');
  const stats = getStats();
  const todayStats: SessionRecord = stats[today] || {
    date: today,
    completedPomodoros: 0,
    totalWorkMinutes: 0,
  };

  todayStats.completedPomodoros += 1;
  todayStats.totalWorkMinutes += workMinutes;

  store.set(`stats.${today}`, todayStats);
}

export function getTodayStats(): SessionRecord {
  const today = format(new Date(), 'yyyy-MM-dd');
  const stats = getStats();
  return stats[today] || { date: today, completedPomodoros: 0, totalWorkMinutes: 0 };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function getTasks(): Task[] {
  const tasks = store.get('tasks') || {};
  return Object.values(tasks).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTask(id: string): Task | null {
  const tasks = store.get('tasks') || {};
  return tasks[id] || null;
}

export function createTask(
  taskData: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros'>
): Task {
  const task: Task = {
    ...taskData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    completedPomodoros: 0,
  };
  store.set(`tasks.${task.id}`, task);
  return task;
}

export function updateTask(id: string, updates: Partial<Task>): Task {
  const task = getTask(id);
  if (!task) throw new Error(`Task ${id} not found`);
  const updated = { ...task, ...updates };
  store.set(`tasks.${id}`, updated);
  return updated;
}

export function deleteTask(id: string): void {
  store.delete(`tasks.${id}` as keyof StoreSchema);
}

export function getDailyPlan(date: string): DailyPlan | null {
  const plans = store.get('dailyPlans') || {};
  return plans[date] || null;
}

export function saveDailyPlan(plan: DailyPlan): DailyPlan {
  store.set(`dailyPlans.${plan.date}`, plan);
  return plan;
}

export function getTodayPlan(): DailyPlan | null {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getDailyPlan(today);
}

export function incrementTaskPomodoro(taskId: string): Task {
  const task = getTask(taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  return updateTask(taskId, { completedPomodoros: task.completedPomodoros + 1 });
}
