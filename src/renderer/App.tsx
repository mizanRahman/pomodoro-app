import React, { useState } from 'react';
import { TimerView } from './components/TimerView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { PlannerView } from './components/PlannerView';
import { useTheme } from './hooks/useTimer';

type View = 'planner' | 'timer' | 'stats' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('planner');
  useTheme();

  const handleStartDay = () => {
    setView('timer');
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <main className="flex-1 overflow-hidden">
        {view === 'planner' && <PlannerView onStartDay={handleStartDay} />}
        {view === 'timer' && <TimerView />}
        {view === 'stats' && <StatsView />}
        {view === 'settings' && <SettingsView />}
      </main>

      <nav className="flex border-t border-gray-200 dark:border-gray-700">
        <NavButton
          active={view === 'planner'}
          onClick={() => setView('planner')}
          icon="📋"
          label="Plan"
        />
        <NavButton
          active={view === 'timer'}
          onClick={() => setView('timer')}
          icon="🍅"
          label="Timer"
        />
        <NavButton
          active={view === 'stats'}
          onClick={() => setView('stats')}
          icon="📊"
          label="Stats"
        />
        <NavButton
          active={view === 'settings'}
          onClick={() => setView('settings')}
          icon="⚙️"
          label="Settings"
        />
      </nav>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
        active
          ? 'text-red-500 dark:text-red-400'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}
