export type TimerPhase = 'work' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export type TaskPriority = 'P1' | 'P2' | 'P3';
export type TaskStatus = 'inbox' | 'scheduled' | 'in-progress' | 'completed';
export type EnergyLevel = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  timeEstimateMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  energyLevel?: EnergyLevel;
  completedPomodoros: number;
  createdAt: string;
  completedAt?: string;
}

export interface DailyPlan {
  date: string;
  scheduledTaskIds: string[];
  activeTaskId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TimerState {
  status: TimerStatus;
  phase: TimerPhase;
  remainingSeconds: number;
  cycleCount: number;
}

export interface SessionRecord {
  date: string;
  completedPomodoros: number;
  totalWorkMinutes: number;
}

export interface Settings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface DailyStats {
  [date: string]: SessionRecord;
}

export interface TasksStore {
  [taskId: string]: Task;
}

export interface DailyPlansStore {
  [date: string]: DailyPlan;
}

export interface StoreSchema {
  settings: Settings;
  stats: DailyStats;
  tasks: TasksStore;
  dailyPlans: DailyPlansStore;
}

export interface IpcApi {
  getTimerState: () => Promise<TimerState>;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  skipPhase: () => Promise<void>;
  getSettings: () => Promise<Settings>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  getStats: () => Promise<DailyStats>;
  onTimerUpdate: (callback: (state: TimerState) => void) => () => void;
  onThemeChange: (callback: (isDark: boolean) => void) => () => void;
  getTasks: () => Promise<Task[]>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getDailyPlan: (date: string) => Promise<DailyPlan | null>;
  saveDailyPlan: (plan: DailyPlan) => Promise<DailyPlan>;
  setActiveTask: (taskId: string | null) => Promise<void>;
  getActiveTask: () => Promise<string | null>;
  onActiveTaskChange: (callback: (taskId: string | null) => void) => () => void;
}

declare global {
  interface Window {
    api: IpcApi;
  }
}
