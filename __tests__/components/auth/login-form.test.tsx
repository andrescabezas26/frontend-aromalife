import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('submits with valid data (happy path)', async () => {
    render(<LoginForm />);
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123!');
    userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    // You can add expect for loading or success toast if needed
  });

  it('shows error on empty submit (not happy path)', async () => {
    render(<LoginForm />);
    userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(await screen.findByText(/el email es requerido/i)).toBeInTheDocument();
    expect(await screen.findByText(/la contraseña es requerida/i)).toBeInTheDocument();
  });
});
