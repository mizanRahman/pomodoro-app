import { BrowserWindow, Notification, Tray } from 'electron';
import type { TimerState, TimerPhase, TimerStatus, Settings } from '../shared/types';
import { getSettings, recordCompletedPomodoro, incrementTaskPomodoro, getTask } from './store';
import { PHASE_LABELS, IPC_CHANNELS } from '../shared/constants';

let timerInterval: NodeJS.Timeout | null = null;
let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let activeTaskId: string | null = null;

const state: TimerState = {
  status: 'idle',
  phase: 'work',
  remainingSeconds: 0,
  cycleCount: 0,
};

export function initTimer(trayRef: Tray, windowRef: BrowserWindow): void {
  tray = trayRef;
  mainWindow = windowRef;
  resetToWorkPhase();
}

export function getTimerState(): TimerState {
  return { ...state };
}

export function startTimer(): void {
  if (state.status === 'running') return;

  state.status = 'running';
  timerInterval = setInterval(tick, 1000);
  broadcastState();
}

export function pauseTimer(): void {
  if (state.status !== 'running') return;

  state.status = 'paused';
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  broadcastState();
}

export function resetTimer(): void {
  stopInterval();
  state.status = 'idle';
  state.cycleCount = 0;
  resetToWorkPhase();
  broadcastState();
}

export function skipPhase(): void {
  stopInterval();
  const wasWork = state.phase === 'work';
  transitionToNextPhase();
  if (wasWork) {
    showNotification('Focus session skipped', 'Time for a break.');
  } else {
    showNotification('Break skipped', 'Ready to focus?');
  }
  broadcastState();
}

export function toggleTimer(): void {
  if (state.status === 'running') {
    pauseTimer();
  } else {
    startTimer();
  }
}

function tick(): void {
  state.remainingSeconds -= 1;
  updateTrayTitle();

  if (state.remainingSeconds <= 0) {
    onPhaseComplete();
  }

  broadcastState();
}

function onPhaseComplete(): void {
  stopInterval();
  const settings = getSettings();

  if (state.phase === 'work') {
    recordCompletedPomodoro(settings.workDuration / 60);
    if (activeTaskId) {
      try {
        incrementTaskPomodoro(activeTaskId);
      } catch (e) {
        // task may have been deleted
      }
    }
    state.cycleCount += 1;
    showNotification('Focus session complete!', 'Time for a break.');

    if (state.cycleCount >= settings.cyclesBeforeLongBreak) {
      state.phase = 'longBreak';
      state.remainingSeconds = settings.longBreakDuration;
      state.cycleCount = 0;
    } else {
      state.phase = 'shortBreak';
      state.remainingSeconds = settings.shortBreakDuration;
    }

    if (settings.autoStartBreaks) {
      state.status = 'running';
      timerInterval = setInterval(tick, 1000);
    } else {
      state.status = 'idle';
    }
  } else {
    showNotification('Break complete!', 'Ready to focus?');
    state.phase = 'work';
    state.remainingSeconds = settings.workDuration;

    if (settings.autoStartPomodoros) {
      state.status = 'running';
      timerInterval = setInterval(tick, 1000);
    } else {
      state.status = 'idle';
    }
  }

  updateTrayTitle();
}

function resetToWorkPhase(): void {
  const settings = getSettings();
  state.phase = 'work';
  state.remainingSeconds = settings.workDuration;
  updateTrayTitle();
}

function transitionToNextPhase(): void {
  const settings = getSettings();

  if (state.phase === 'work') {
    if (state.cycleCount >= settings.cyclesBeforeLongBreak - 1) {
      state.phase = 'longBreak';
      state.remainingSeconds = settings.longBreakDuration;
    } else {
      state.phase = 'shortBreak';
      state.remainingSeconds = settings.shortBreakDuration;
    }
  } else {
    if (state.phase === 'longBreak') {
      state.cycleCount = 0;
    }
    state.phase = 'work';
    state.remainingSeconds = settings.workDuration;
  }

  state.status = 'idle';
  updateTrayTitle();
}

function stopInterval(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTrayTitle(): void {
  if (!tray) return;

  const minutes = Math.floor(state.remainingSeconds / 60);
  const seconds = state.remainingSeconds % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const emoji = state.phase === 'work' ? '🍅' : '☕';
  let title = `${emoji} ${timeStr}`;

  if (activeTaskId && state.phase === 'work') {
    const task = getTask(activeTaskId);
    if (task) {
      const shortTitle = task.title.length > 15 ? task.title.slice(0, 15) + '...' : task.title;
      title = `📋 ${shortTitle} ${timeStr}`;
    }
  }

  tray.setTitle(title);
}

function broadcastState(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('timer:update', getTimerState());
  }
}

function showNotification(title: string, body: string): void {
  const settings = getSettings();

  if (settings.soundEnabled) {
    playAlarmSound();
  }

  if (Notification.isSupported()) {
    new Notification({ title, body, silent: !settings.soundEnabled }).show();
  }
}

function playAlarmSound(): void {
  const { exec } = require('child_process');
  exec('afplay -v 5 /System/Library/Sounds/Glass.aiff && afplay -v 5 /System/Library/Sounds/Glass.aiff && afplay -v 5 /System/Library/Sounds/Glass.aiff');
}

export function setActiveTask(taskId: string | null): void {
  activeTaskId = taskId;
  broadcastActiveTask();
  updateTrayTitle();
}

export function getActiveTask(): string | null {
  return activeTaskId;
}

function broadcastActiveTask(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.ACTIVE_TASK_CHANGE, activeTaskId);
  }
}
