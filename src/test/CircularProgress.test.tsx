import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularProgress } from '../renderer/components/CircularProgress';

describe('CircularProgress', () => {
  it('renders SVG with correct size', () => {
    render(<CircularProgress progress={0.5} size={200} />);

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });

  it('renders children inside the progress ring', () => {
    render(
      <CircularProgress progress={0.5}>
        <span data-testid="child">Test</span>
      </CircularProgress>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('uses red color for work phase (isBreak=false)', () => {
    render(<CircularProgress progress={0.5} isBreak={false} />);

    const circles = document.querySelectorAll('circle');
    const progressCircle = circles[1];
    expect(progressCircle).toHaveAttribute('stroke', '#ef4444');
  });

  it('uses green color for break phase (isBreak=true)', () => {
    render(<CircularProgress progress={0.5} isBreak={true} />);

    const circles = document.querySelectorAll('circle');
    const progressCircle = circles[1];
    expect(progressCircle).toHaveAttribute('stroke', '#22c55e');
  });

  it('renders two circles (background and progress)', () => {
    render(<CircularProgress progress={0.5} />);

    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });
});
