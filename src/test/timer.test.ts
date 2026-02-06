import { describe, it, expect, vi, beforeEach } from 'vitest';

class MockNotification {
  static isSupported = vi.fn().mockReturnValue(true);
  show = vi.fn();
  constructor() {}
}

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  Notification: MockNotification,
  Tray: vi.fn(),
}));

vi.mock('../main/store', () => ({
  getSettings: vi.fn().mockReturnValue({
    workDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    cyclesBeforeLongBreak: 4,
    soundEnabled: true,
    autoStartBreaks: true,
    autoStartPomodoros: false,
  }),
  recordCompletedPomodoro: vi.fn(),
  incrementTaskPomodoro: vi.fn(),
  getTask: vi.fn().mockReturnValue(null),
}));

describe('Timer State Machine', () => {
  it('initial state is idle with work phase', async () => {
    const { getTimerState } = await import('../main/timer');
    const state = getTimerState();

    expect(state.status).toBe('idle');
    expect(state.phase).toBe('work');
  });

  it('transitions to running when started', async () => {
    const { startTimer, getTimerState, resetTimer } = await import('../main/timer');

    resetTimer();
    startTimer();
    const state = getTimerState();

    expect(state.status).toBe('running');
  });

  it('transitions to paused when paused', async () => {
    const { startTimer, pauseTimer, getTimerState, resetTimer } = await import('../main/timer');

    resetTimer();
    startTimer();
    pauseTimer();
    const state = getTimerState();

    expect(state.status).toBe('paused');
  });

  it('resets to idle state', async () => {
    const { startTimer, resetTimer, getTimerState } = await import('../main/timer');

    startTimer();
    resetTimer();
    const state = getTimerState();

    expect(state.status).toBe('idle');
    expect(state.phase).toBe('work');
    expect(state.cycleCount).toBe(0);
  });

  it('skips to next phase', async () => {
    const { skipPhase, getTimerState, resetTimer } = await import('../main/timer');

    resetTimer();
    skipPhase();
    const state = getTimerState();

    expect(state.phase).toBe('shortBreak');
    expect(state.status).toBe('idle');
  });
});
