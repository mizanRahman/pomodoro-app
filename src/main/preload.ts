import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import type { TimerState, Settings, DailyStats, Task, DailyPlan } from '../shared/types';

contextBridge.exposeInMainWorld('api', {
  getTimerState: (): Promise<TimerState> => ipcRenderer.invoke(IPC_CHANNELS.GET_TIMER_STATE),

  startTimer: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.START_TIMER),

  pauseTimer: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.PAUSE_TIMER),

  resetTimer: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.RESET_TIMER),

  skipPhase: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.SKIP_PHASE),

  getSettings: (): Promise<Settings> => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),

  updateSettings: (settings: Partial<Settings>): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SETTINGS, settings),

  getStats: (): Promise<DailyStats> => ipcRenderer.invoke(IPC_CHANNELS.GET_STATS),

  onTimerUpdate: (callback: (state: TimerState) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: TimerState) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.TIMER_UPDATE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_UPDATE, handler);
  },

  onThemeChange: (callback: (isDark: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isDark: boolean) => callback(isDark);
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.THEME_CHANGE, handler);
  },

  getTasks: (): Promise<Task[]> => ipcRenderer.invoke(IPC_CHANNELS.GET_TASKS),

  createTask: (
    task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros'>
  ): Promise<Task> => ipcRenderer.invoke(IPC_CHANNELS.CREATE_TASK, task),

  updateTask: (id: string, updates: Partial<Task>): Promise<Task> =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_TASK, id, updates),

  deleteTask: (id: string): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.DELETE_TASK, id),

  getDailyPlan: (date: string): Promise<DailyPlan | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_DAILY_PLAN, date),

  saveDailyPlan: (plan: DailyPlan): Promise<DailyPlan> =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_DAILY_PLAN, plan),

  setActiveTask: (taskId: string | null): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_ACTIVE_TASK, taskId),

  getActiveTask: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_ACTIVE_TASK),

  onActiveTaskChange: (callback: (taskId: string | null) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, taskId: string | null) =>
      callback(taskId);
    ipcRenderer.on(IPC_CHANNELS.ACTIVE_TASK_CHANGE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.ACTIVE_TASK_CHANGE, handler);
  },
});
