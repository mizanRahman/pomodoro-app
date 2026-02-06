import { app, ipcMain, globalShortcut, nativeTheme, BrowserWindow, Tray, nativeImage } from 'electron';
import { menubar } from 'menubar';
import path from 'path';
import {
  initTimer,
  getTimerState,
  startTimer,
  pauseTimer,
  resetTimer,
  skipPhase,
  toggleTimer,
  setActiveTask,
  getActiveTask,
} from './timer';
import {
  getSettings,
  updateSettings,
  getStats,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDailyPlan,
  saveDailyPlan,
} from './store';
import { IPC_CHANNELS, KEYBOARD_SHORTCUTS } from '../shared/constants';

const isDev = process.env.NODE_ENV !== 'production';

let mb: ReturnType<typeof menubar>;

const appPath = app.isPackaged ? process.resourcesPath : path.join(__dirname, '../..');

app.whenReady().then(() => {
  registerIpcHandlers();

  const icon = nativeImage.createEmpty();
  const tray = new Tray(icon);
  tray.setTitle('🍅 25:00');

  mb = menubar({
    tray,
    index: isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../renderer/index.html')}`,
    browserWindow: {
      width: 320,
      height: 480,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    },
    preloadWindow: true,
    showDockIcon: false,
  });

  mb.on('ready', () => {
    const window = mb.window as BrowserWindow;
    initTimer(tray, window);
    registerGlobalShortcuts();
    setupThemeListener(window);

    if (isDev) {
      window.webContents.openDevTools({ mode: 'detach' });
    }
  });
});

function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GET_TIMER_STATE, () => getTimerState());
  ipcMain.handle(IPC_CHANNELS.START_TIMER, () => startTimer());
  ipcMain.handle(IPC_CHANNELS.PAUSE_TIMER, () => pauseTimer());
  ipcMain.handle(IPC_CHANNELS.RESET_TIMER, () => resetTimer());
  ipcMain.handle(IPC_CHANNELS.SKIP_PHASE, () => skipPhase());
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => getSettings());
  ipcMain.handle(IPC_CHANNELS.UPDATE_SETTINGS, (_event, settings) => updateSettings(settings));
  ipcMain.handle(IPC_CHANNELS.GET_STATS, () => getStats());
  ipcMain.handle(IPC_CHANNELS.GET_TASKS, () => getTasks());
  ipcMain.handle(IPC_CHANNELS.CREATE_TASK, (_event, taskData) => createTask(taskData));
  ipcMain.handle(IPC_CHANNELS.UPDATE_TASK, (_event, id, updates) => updateTask(id, updates));
  ipcMain.handle(IPC_CHANNELS.DELETE_TASK, (_event, id) => deleteTask(id));
  ipcMain.handle(IPC_CHANNELS.GET_DAILY_PLAN, (_event, date) => getDailyPlan(date));
  ipcMain.handle(IPC_CHANNELS.SAVE_DAILY_PLAN, (_event, plan) => saveDailyPlan(plan));
  ipcMain.handle(IPC_CHANNELS.SET_ACTIVE_TASK, (_event, taskId) => {
    setActiveTask(taskId);
  });
  ipcMain.handle(IPC_CHANNELS.GET_ACTIVE_TASK, () => {
    return getActiveTask();
  });
}

function registerGlobalShortcuts(): void {
  globalShortcut.register(KEYBOARD_SHORTCUTS.TOGGLE_TIMER, () => {
    toggleTimer();
  });

  globalShortcut.register(KEYBOARD_SHORTCUTS.STOP_TIMER, () => {
    pauseTimer();
  });

  globalShortcut.register(KEYBOARD_SHORTCUTS.RESET_TIMER, () => {
    resetTimer();
  });
}

function setupThemeListener(window: BrowserWindow): void {
  const sendTheme = () => {
    if (!window.isDestroyed()) {
      window.webContents.send(IPC_CHANNELS.THEME_CHANGE, nativeTheme.shouldUseDarkColors);
    }
  };

  nativeTheme.on('updated', sendTheme);
  sendTheme();
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
