import React, { useState, useCallback } from 'react';
import type { Task, TaskPriority } from '../../shared/types';

interface DailyTimelineProps {
  tasks: Task[];
  activeTaskId?: string;
  totalMinutes: number;
  onReorder: (taskIds: string[]) => void;
  onRemoveTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onSetActive: (taskId: string) => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  P1: 'border-l-red-500',
  P2: 'border-l-yellow-500',
  P3: 'border-l-blue-500',
};

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function DailyTimeline({
  tasks,
  activeTaskId,
  totalMinutes,
  onReorder,
  onRemoveTask,
  onCompleteTask,
  onSetActive,
}: DailyTimelineProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!draggedId || draggedId === targetId) return;

      const taskIds = tasks.map((t) => t.id);
      const fromIndex = taskIds.indexOf(draggedId);
      const toIndex = taskIds.indexOf(targetId);

      const newOrder = [...taskIds];
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, draggedId);

      onReorder(newOrder);
      setDraggedId(null);
    },
    [draggedId, tasks, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  let cumulativeMinutes = 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Today's Plan ({tasks.length})
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTime(totalMinutes)} total
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {tasks.map((task, index) => {
          const startOffset = cumulativeMinutes;
          cumulativeMinutes += task.timeEstimateMinutes;
          const isActive = task.id === activeTaskId;
          const isCompleted = task.status === 'completed';
          const isDragging = task.id === draggedId;

          return (
            <div
              key={task.id}
              draggable={!isCompleted}
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, task.id)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center gap-2 p-2 rounded-lg border-l-4 transition-all cursor-move group
                ${PRIORITY_COLORS[task.priority]}
                ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : 'bg-white dark:bg-gray-800'}
                ${isCompleted ? 'opacity-50' : ''}
                ${isDragging ? 'opacity-50 scale-95' : ''}
              `}
            >
              <span className="text-xs text-gray-400 w-8">{index + 1}.</span>

              <button
                onClick={() => onCompleteTask(task.id)}
                title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                className={`
                  w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                  ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-500'}
                `}
              >
                {isCompleted && '✓'}
              </button>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm truncate ${
                    isCompleted
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {task.title}
                </div>
                <div className="text-xs text-gray-400">
                  +{formatTime(startOffset)} → {formatTime(cumulativeMinutes)}
                </div>
              </div>

              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {task.timeEstimateMinutes}m
              </span>

              {!isCompleted && !isActive && (
                <button
                  onClick={() => onSetActive(task.id)}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 transition-opacity"
                >
                  ▶
                </button>
              )}

              {!isCompleted && (
                <button
                  onClick={() => onRemoveTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-gray-400 hover:text-red-500 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
            Add tasks from inbox →
          </div>
        )}
      </div>
    </div>
  );
}
