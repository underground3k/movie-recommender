import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RegisterPage from './RegisterPage';

describe('RegisterPage', () => {
  it('renders registration fields and navigation link', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('minLength', '8');
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');

    await user.type(screen.getByLabelText('Name'), 'Neo');
    await user.type(screen.getByLabelText('Email'), 'neo@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));
  });
});
