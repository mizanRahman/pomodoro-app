import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TimerView } from '../renderer/components/TimerView';

describe('TimerView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders timer display with initial time', async () => {
    render(<TimerView />);

    await waitFor(() => {
      expect(screen.getByText('25:00')).toBeInTheDocument();
    });
  });

  it('renders Focus label for work phase', async () => {
    render(<TimerView />);

    await waitFor(() => {
      expect(screen.getByText('Focus')).toBeInTheDocument();
    });
  });

  it('renders Start button when timer is idle', async () => {
    render(<TimerView />);

    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
  });

  it('renders Reset and Skip buttons', async () => {
    render(<TimerView />);

    await waitFor(() => {
      expect(screen.getByText('Reset')).toBeInTheDocument();
      expect(screen.getByText('Skip')).toBeInTheDocument();
    });
  });

  it('calls startTimer when Start button is clicked', async () => {
    render(<TimerView />);

    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Start'));

    expect(window.api.startTimer).toHaveBeenCalled();
  });

  it('calls resetTimer when Reset button is clicked', async () => {
    render(<TimerView />);

    await waitFor(() => {
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Reset'));

    expect(window.api.resetTimer).toHaveBeenCalled();
  });

  it('calls skipPhase when Skip button is clicked', async () => {
    render(<TimerView />);

    await waitFor(() => {
      expect(screen.getByText('Skip')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Skip'));

    expect(window.api.skipPhase).toHaveBeenCalled();
  });

  it('displays keyboard shortcut hints', async () => {
    render(<TimerView />);

    await waitFor(() => {
      expect(screen.getByText(/⌘⇧P Toggle/)).toBeInTheDocument();
    });
  });

  it('renders cycle dots indicator', async () => {
    render(<TimerView />);

    await waitFor(() => {
      const dots = document.querySelectorAll('.rounded-full.w-2.h-2');
      expect(dots.length).toBe(4);
    });
  });
});
