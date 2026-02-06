# Pomodoro Time Management App

A macOS menu bar app that combines the Pomodoro technique with daily task planning for focused productivity.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)
![Electron](https://img.shields.io/badge/electron-28.x-blue.svg)

## Features

### Task Management
- **Quick Capture** - Add tasks with title, time estimate (15/25/45/60 min), and priority (P1/P2/P3)
- **Task Inbox** - Collect tasks before scheduling them
- **Daily Planning** - Schedule tasks for today with drag-and-drop reordering
- **Progress Tracking** - Visual progress bar showing completed vs planned tasks

### Pomodoro Timer
- **25-minute Focus Sessions** - Configurable work duration
- **Automatic Breaks** - Short (5 min) and long (15 min) breaks
- **Cycle Tracking** - Visual dots showing progress toward long break
- **Active Task Display** - See what you're working on during focus sessions
- **Break Mode** - Shows "Take a break" with next task hint

### Menu Bar Integration
- **Always Accessible** - Lives in your macOS menu bar
- **Current Task Display** - Shows active task name and timer in menu bar
- **Global Shortcuts**:
  - `⌘⇧P` - Toggle timer (start/pause)
  - `⌘⇧S` - Stop timer
  - `⌘⇧R` - Reset timer

### Statistics
- **Daily Stats** - Completed pomodoros and total focus time
- **Weekly Chart** - Visual bar chart of productivity trends
- **Per-Task Tracking** - Pomodoros completed per task

## Screenshots

| Planning View | Timer View | Break Mode |
|--------------|------------|------------|
| Plan your day with tasks | Focus with active task | Rest between sessions |

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- macOS (menu bar app)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/mizanRahman/pomodoro-app.git
cd pomodoro-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the app
npm run build

# Output: release/Pomodoro-{version}-arm64.dmg
```

## Usage

### Morning Planning Ritual
1. Open the app from menu bar
2. Go to **Plan** tab
3. Add tasks to **Inbox** with time estimates
4. Move tasks to **Today** by clicking →
5. Reorder by dragging tasks
6. Click **Start Day**

### During the Day
1. Timer shows current task
2. Focus for 25 minutes
3. Take breaks when prompted
4. Mark tasks complete with ✓
5. Click ▶ on next task to switch

### Task States
| State | Description |
|-------|-------------|
| Inbox | Captured but not scheduled |
| Scheduled | Planned for today |
| In Progress | Currently working on |
| Completed | Done (click ✓ again to restart) |

## Architecture

```
src/
├── main/           # Electron main process
│   ├── main.ts     # App initialization, IPC handlers
│   ├── timer.ts    # Timer state machine
│   ├── store.ts    # Data persistence (electron-store)
│   └── preload.ts  # Context bridge for renderer
├── renderer/       # React UI
│   ├── components/ # React components
│   ├── hooks/      # Custom hooks (useTasks, useDailyPlan)
│   └── App.tsx     # Main app with navigation
├── shared/         # Shared types and constants
│   ├── types.ts    # TypeScript interfaces
│   └── constants.ts# IPC channels, defaults
└── test/           # Test suites
```

### Tech Stack
- **Electron** - Desktop framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **electron-store** - Persistent storage
- **Recharts** - Statistics visualization
- **Vitest** - Testing

### Data Model

```typescript
interface Task {
  id: string;
  title: string;
  timeEstimateMinutes: number;
  priority: 'P1' | 'P2' | 'P3';
  status: 'inbox' | 'scheduled' | 'in-progress' | 'completed';
  completedPomodoros: number;
}

interface DailyPlan {
  date: string;
  scheduledTaskIds: string[];
  activeTaskId?: string;
}
```

## Configuration

Settings are accessible from the **Settings** tab:

| Setting | Default | Description |
|---------|---------|-------------|
| Work Duration | 25 min | Focus session length |
| Short Break | 5 min | Break after each pomodoro |
| Long Break | 15 min | Break after 4 pomodoros |
| Cycles | 4 | Pomodoros before long break |
| Sound | On | Play sound on completion |
| Auto-start Breaks | On | Automatically start breaks |
| Auto-start Pomodoros | Off | Automatically start next focus |

## Development

### Scripts

```bash
npm run dev          # Start dev server + electron
npm run build        # Production build
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run build:main   # Compile main process only
npm run build:renderer # Build renderer only
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- timer.test.ts

# Watch mode
npm run test:watch
```

### Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/main` | Electron main process (Node.js) |
| `src/renderer` | React UI (browser context) |
| `src/shared` | Shared types/constants |
| `src/test` | Test files |
| `dist/` | Compiled output |
| `release/` | Built .dmg files |

## Roadmap

### Phase 1 (Current)
- [x] Task inbox and daily planning
- [x] Pomodoro timer with task integration
- [x] Menu bar app with shortcuts
- [x] Basic statistics

### Phase 2 (Planned)
- [ ] Auto-advance to next task on completion
- [ ] Task categories and labels
- [ ] Energy level tagging (high/medium/low)
- [ ] Smart task batching suggestions

### Phase 3 (Future)
- [ ] End-of-day review prompt
- [ ] Planned vs actual time comparison
- [ ] Weekly/monthly analytics
- [ ] Calendar integration
- [ ] Todoist/Things import

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Inspired by the [Pomodoro Technique](https://francescocirillo.com/products/the-pomodoro-technique) by Francesco Cirillo
- Built with [Electron](https://www.electronjs.org/) and [React](https://react.dev/)
