import { useState, useEffect, useCallback } from 'react';
import type { TimerState, Settings, DailyStats } from '../../shared/types';

const getApi = () => window.api;

export function useTimer() {
  const [state, setState] = useState<TimerState>({
    status: 'idle',
    phase: 'work',
    remainingSeconds: 25 * 60,
    cycleCount: 0,
  });

  useEffect(() => {
    const api = getApi();
    if (!api) return;
    api.getTimerState().then(setState);
    return api.onTimerUpdate(setState);
  }, []);

  const start = useCallback(() => getApi()?.startTimer(), []);
  const pause = useCallback(() => getApi()?.pauseTimer(), []);
  const reset = useCallback(() => getApi()?.resetTimer(), []);
  const skip = useCallback(() => getApi()?.skipPhase(), []);

  return { state, start, pause, reset, skip };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const api = getApi();
    if (!api) return;
    api.getSettings().then(setSettings);
  }, []);

  const update = useCallback(async (partial: Partial<Settings>) => {
    const api = getApi();
    if (!api) return;
    await api.updateSettings(partial);
    const updated = await api.getSettings();
    setSettings(updated);
  }, []);

  return { settings, update };
}

export function useStats() {
  const [stats, setStats] = useState<DailyStats>({});

  useEffect(() => {
    const api = getApi();
    if (!api) return;
    api.getStats().then(setStats);
  }, []);

  const refresh = useCallback(() => {
    const api = getApi();
    if (!api) return;
    api.getStats().then(setStats);
  }, []);

  return { stats, refresh };
}

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);

    const api = getApi();
    const cleanup = api?.onThemeChange(setIsDark);

    return () => {
      mediaQuery.removeEventListener('change', handler);
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return isDark;
}
