import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { useStats } from '../hooks/useTimer';

export function StatsView() {
  const { stats, refresh } = useStats();

  const weeklyData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayStats = stats[dateStr];
      return {
        day: format(date, 'EEE'),
        pomodoros: dayStats?.completedPomodoros || 0,
        isToday: i === 6,
      };
    });
  }, [stats]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayStats = stats[todayStr] || { completedPomodoros: 0, totalWorkMinutes: 0 };
  const weekTotal = weeklyData.reduce((sum, d) => sum + d.pomodoros, 0);

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Statistics
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {todayStats.completedPomodoros}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Today</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {todayStats.totalWorkMinutes}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Minutes</div>
        </div>
      </div>

      <div className="flex-1 min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Bar dataKey="pomodoros" radius={[4, 4, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? '#ef4444' : '#fca5a5'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
        {weekTotal} pomodoros this week
      </div>
    </div>
  );
}
