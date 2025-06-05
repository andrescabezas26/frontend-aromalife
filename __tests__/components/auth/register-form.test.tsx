import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/auth/register-form';

describe('RegisterForm', () => {
  it('renders all required fields', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('submits with valid data (happy path)', async () => {
    render(<RegisterForm />);
    userEvent.type(screen.getByLabelText(/nombre/i), 'Juan');
    userEvent.type(screen.getByLabelText(/apellido/i), 'Pérez');
    userEvent.type(screen.getByLabelText(/email/i), 'juan@example.com');
    userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123!');
    userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    // You can add expect for loading or success toast if needed
  });

  it('shows error on empty submit (not happy path)', async () => {
    render(<RegisterForm />);
    userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(await screen.findByText(/el apellido es requerido/i)).toBeInTheDocument();
    expect(await screen.findByText(/el email es requerido/i)).toBeInTheDocument();
    expect(await screen.findByText(/la contraseña es requerida/i)).toBeInTheDocument();
  });
});
