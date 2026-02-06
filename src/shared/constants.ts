import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  cyclesBeforeLongBreak: 4,
  soundEnabled: true,
  autoStartBreaks: true,
  autoStartPomodoros: false,
};

export const PHASE_LABELS = {
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
} as const;

export const IPC_CHANNELS = {
  GET_TIMER_STATE: 'timer:get-state',
  START_TIMER: 'timer:start',
  PAUSE_TIMER: 'timer:pause',
  RESET_TIMER: 'timer:reset',
  SKIP_PHASE: 'timer:skip',
  TIMER_UPDATE: 'timer:update',
  GET_SETTINGS: 'settings:get',
  UPDATE_SETTINGS: 'settings:update',
  GET_STATS: 'stats:get',
  THEME_CHANGE: 'theme:change',
  GET_TASKS: 'tasks:get',
  CREATE_TASK: 'tasks:create',
  UPDATE_TASK: 'tasks:update',
  DELETE_TASK: 'tasks:delete',
  GET_DAILY_PLAN: 'daily-plan:get',
  SAVE_DAILY_PLAN: 'daily-plan:save',
  SET_ACTIVE_TASK: 'tasks:set-active',
  GET_ACTIVE_TASK: 'tasks:get-active',
  ACTIVE_TASK_CHANGE: 'tasks:active-change',
} as const;

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_TIMER: 'CommandOrControl+Shift+P',
  STOP_TIMER: 'CommandOrControl+Shift+S',
  RESET_TIMER: 'CommandOrControl+Shift+R',
} as const;
