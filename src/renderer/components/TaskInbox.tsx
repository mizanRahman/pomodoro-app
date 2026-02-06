import React, { useState, useCallback } from 'react';
import type { Task, TaskPriority } from '../../shared/types';
import type { CreateTaskInput } from '../hooks/useTasks';

interface TaskInboxProps {
  tasks: Task[];
  onCreateTask: (input: CreateTaskInput) => Promise<Task>;
  onScheduleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  P1: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  P2: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  P3: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const TIME_PRESETS = [15, 25, 45, 60];

export function TaskInbox({ tasks, onCreateTask, onScheduleTask, onDeleteTask }: TaskInboxProps) {
  const [title, setTitle] = useState('');
  const [timeEstimate, setTimeEstimate] = useState(25);
  const [priority, setPriority] = useState<TaskPriority>('P2');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      await onCreateTask({
        title: title.trim(),
        timeEstimateMinutes: timeEstimate,
        priority,
      });

      setTitle('');
      setTimeEstimate(25);
      setPriority('P2');
      setIsAdding(false);
    },
    [title, timeEstimate, priority, onCreateTask]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Inbox ({tasks.length})
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            + Add
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-1">
              {TIME_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeEstimate(t)}
                  className={`px-2 py-1 text-xs rounded ${
                    timeEstimate === t
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t}m
                </button>
              ))}
            </div>

            <div className="flex gap-1">
              {(['P1', 'P2', 'P3'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-2 py-1 text-xs rounded ${
                    priority === p ? PRIORITY_COLORS[p] : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 group"
          >
            <span className={`px-1.5 py-0.5 text-xs rounded ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
              {task.title}
            </span>
            <span className="text-xs text-gray-400">{task.timeEstimateMinutes}m</span>
            <button
              onClick={() => onScheduleTask(task.id)}
              className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-opacity"
            >
              →
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-opacity"
            >
              ×
            </button>
          </div>
        ))}

        {tasks.length === 0 && !isAdding && (
          <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
            No tasks in inbox
          </div>
        )}
      </div>
    </div>
  );
}
