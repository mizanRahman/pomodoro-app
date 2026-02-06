import '@testing-library/jest-dom';
import { vi } from 'vitest';

const mockApi = {
  getTimerState: vi.fn().mockResolvedValue({
    status: 'idle',
    phase: 'work',
    remainingSeconds: 25 * 60,
    cycleCount: 0,
  }),
  startTimer: vi.fn().mockResolvedValue(undefined),
  pauseTimer: vi.fn().mockResolvedValue(undefined),
  resetTimer: vi.fn().mockResolvedValue(undefined),
  skipPhase: vi.fn().mockResolvedValue(undefined),
  getSettings: vi.fn().mockResolvedValue({
    workDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    cyclesBeforeLongBreak: 4,
    soundEnabled: true,
    autoStartBreaks: true,
    autoStartPomodoros: false,
  }),
  updateSettings: vi.fn().mockResolvedValue(undefined),
  getStats: vi.fn().mockResolvedValue({}),
  onTimerUpdate: vi.fn().mockReturnValue(() => {}),
  onThemeChange: vi.fn().mockReturnValue(() => {}),
  getTasks: vi.fn().mockResolvedValue([]),
  createTask: vi.fn().mockResolvedValue({ id: '1', title: 'Test', status: 'inbox' }),
  updateTask: vi.fn().mockResolvedValue({ id: '1', title: 'Test', status: 'inbox' }),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  getDailyPlan: vi.fn().mockResolvedValue(null),
  saveDailyPlan: vi.fn().mockResolvedValue({ date: '2024-01-01', scheduledTaskIds: [] }),
  setActiveTask: vi.fn().mockResolvedValue(undefined),
  onActiveTaskChange: vi.fn().mockReturnValue(() => {}),
};

vi.stubGlobal('api', mockApi);

Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
