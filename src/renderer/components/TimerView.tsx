import React, { useEffect, useState } from 'react';
import { CircularProgress } from './CircularProgress';
import { useTimer, useSettings } from '../hooks/useTimer';
import { useActiveTask } from '../hooks/useTasks';
import { PHASE_LABELS } from '../../shared/constants';
import type { Task } from '../../shared/types';

export function TimerView() {
  const { state, start, pause, reset, skip } = useTimer();
  const { settings } = useSettings();
  const { activeTaskId } = useActiveTask();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!activeTaskId) {
      setActiveTask(null);
      return;
    }
    window.api.getTasks().then((tasks) => {
      const task = tasks.find((t) => t.id === activeTaskId);
      setActiveTask(task || null);
    });
  }, [activeTaskId]);

  const totalSeconds = settings
    ? state.phase === 'work'
      ? settings.workDuration
      : state.phase === 'shortBreak'
      ? settings.shortBreakDuration
      : settings.longBreakDuration
    : 25 * 60;

  const progress = state.remainingSeconds / totalSeconds;
  const minutes = Math.floor(state.remainingSeconds / 60);
  const seconds = state.remainingSeconds % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isBreak = state.phase !== 'work';
  const cyclesTotal = settings?.cyclesBeforeLongBreak || 4;

  return (
    <div className="flex flex-col items-center p-4 h-full">
      {isBreak ? (
        <div className="w-full mb-3 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
            ☕ Take a break!
          </div>
          {activeTask && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Next: {activeTask.title}
            </div>
          )}
        </div>
      ) : activeTask ? (
        <div className="w-full mb-3 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">
            Working on
          </div>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {activeTask.title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            🍅 {activeTask.completedPomodoros} / ~{Math.ceil(activeTask.timeEstimateMinutes / 25)} pomodoros
          </div>
        </div>
      ) : (
        <div className="w-full mb-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            No task selected • Go to Plan tab
          </div>
        </div>
      )}

      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        {PHASE_LABELS[state.phase]}
      </div>

      <CircularProgress progress={progress} size={180} isBreak={isBreak}>
        <div className="flex flex-col items-center">
          <span
            className={`text-4xl font-bold ${
              isBreak ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            } ${state.status === 'paused' ? 'animate-pulse-slow' : ''}`}
          >
            {timeDisplay}
          </span>
        </div>
      </CircularProgress>

      <div className="flex gap-1 mt-3 mb-4">
        {Array.from({ length: cyclesTotal }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < state.cycleCount
                ? 'bg-red-500 dark:bg-red-400'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      <div className="flex gap-2">
        {state.status === 'running' ? (
          <button
            onClick={pause}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={start}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isBreak
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {state.status === 'paused' ? 'Resume' : 'Start'}
          </button>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={skip}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        ⌘⇧P Toggle | ⌘⇧S Stop | ⌘⇧R Reset
      </div>
    </div>
  );
}
