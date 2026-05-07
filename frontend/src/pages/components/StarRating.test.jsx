import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StarRating from './StarRating';

describe('StarRating', () => {
  it('shows an empty prompt before a rating is selected', () => {
    render(<StarRating value={0} />);

    expect(screen.getByText('Tap a star to rate')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Empty star')).toHaveLength(5);
  });

  it('renders filled and empty stars from the value', () => {
    render(<StarRating value={2} />);

    expect(screen.getAllByLabelText('Filled star')).toHaveLength(2);
    expect(screen.getAllByLabelText('Empty star')).toHaveLength(3);
  });

  it('calls onChange with the clicked star value', () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} />);

    fireEvent.click(screen.getAllByLabelText('Empty star')[1]);

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('updates display text while hovering over stars', async () => {
    const user = userEvent.setup();
    render(<StarRating value={1} />);

    await user.hover(screen.getAllByRole('button')[4]);

    expect(screen.getByText('5')).toBeInTheDocument();

    await user.unhover(screen.getAllByRole('button')[4]);

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
