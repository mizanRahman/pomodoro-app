import React from 'react';
import { useSettings } from '../hooks/useTimer';

export function SettingsView() {
  const { settings, update } = useSettings();

  if (!settings) return null;

  const toggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      update({ [key]: !settings[key] });
    }
  };

  return (
    <div className="p-4 h-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Settings
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sound
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Play sound on completion
            </div>
          </div>
          <Toggle
            enabled={settings.soundEnabled}
            onChange={() => toggleSetting('soundEnabled')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-start breaks
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Automatically start break timer
            </div>
          </div>
          <Toggle
            enabled={settings.autoStartBreaks}
            onChange={() => toggleSetting('autoStartBreaks')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-start pomodoros
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Automatically start focus timer
            </div>
          </div>
          <Toggle
            enabled={settings.autoStartPomodoros}
            onChange={() => toggleSetting('autoStartPomodoros')}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Work: {settings.workDuration / 60} min</p>
            <p>Short break: {settings.shortBreakDuration / 60} min</p>
            <p>Long break: {settings.longBreakDuration / 60} min</p>
            <p>Long break after: {settings.cyclesBeforeLongBreak} pomodoros</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
