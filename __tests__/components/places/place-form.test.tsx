import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceForm } from '@/components/places/place-form';
import { Place } from '@/types/place';
import '@testing-library/jest-dom';

const mockPlace: Place = {
  id: 'place-1',
  name: 'Sala de estar',
  icon: '🛋️',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

describe('PlaceForm', () => {
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<PlaceForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Nombre del Lugar')).toBeInTheDocument();
    expect(screen.getByLabelText('Icono')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Sala de estar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: 🏠, 🛋️, 🛏️, 🍽️')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear Lugar' })).toBeInTheDocument();
  });

  it('populates form with existing place data', () => {
    render(<PlaceForm place={mockPlace} onSubmit={mockOnSubmit} />);

    expect(screen.getByDisplayValue('Sala de estar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('🛋️')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar Lugar' })).toBeInTheDocument();
  });

  it('shows icon preview when icon is entered', async () => {
    render(<PlaceForm onSubmit={mockOnSubmit} />);

    const iconInput = screen.getByPlaceholderText('Ej: 🏠, 🛋️, 🛏️, 🍽️');
    await user.type(iconInput, '🏠');

    expect(screen.getByText('🏠')).toBeInTheDocument();
    
    // Check icon preview container
    const iconPreview = screen.getByText('🏠').parentElement;
    expect(iconPreview).toHaveClass('flex', 'items-center', 'justify-center', 'w-12', 'h-10');
  });

  it('validates required fields and shows errors', async () => {
    render(<PlaceForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: 'Crear Lugar' });
    await user.click(submitButton);

    expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    expect(screen.getByText('El icono es requerido')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears errors when user starts typing', async () => {
    render(<PlaceForm onSubmit={mockOnSubmit} />);

    // Submit to show errors
    const submitButton = screen.getByRole('button', { name: 'Crear Lugar' });
    await user.click(submitButton);

    expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    expect(screen.getByText('El icono es requerido')).toBeInTheDocument();

    // Start typing in name field
    const nameInput = screen.getByLabelText('Nombre del Lugar');
    await user.type(nameInput, 'Test');

    await waitFor(() => {
      expect(screen.queryByText('El nombre es requerido')).not.toBeInTheDocument();
    });

    // Start typing in icon field
    const iconInput = screen.getByLabelText('Icono');
    await user.type(iconInput, '🏠');

    await waitFor(() => {
      expect(screen.queryByText('El icono es requerido')).not.toBeInTheDocument();
    });
  });

  it('validates whitespace-only inputs', async () => {
    render(<PlaceForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Nombre del Lugar');
    const iconInput = screen.getByLabelText('Icono');

    await user.type(nameInput, '   ');
    await user.type(iconInput, '   ');

    const submitButton = screen.getByRole('button', { name: 'Crear Lugar' });
    await user.click(submitButton);

    expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    expect(screen.getByText('El icono es requerido')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with correct data for new place', async () => {
    render(<PlaceForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Nombre del Lugar');
    const iconInput = screen.getByLabelText('Icono');

    await user.type(nameInput, 'Cocina');
    await user.type(iconInput, '🍳');

    const submitButton = screen.getByRole('button', { name: 'Crear Lugar' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Cocina',
        icon: '🍳',
        id: undefined,
      });
    });
  });

  it('submits form with correct data for existing place', async () => {
    render(<PlaceForm place={mockPlace} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByDisplayValue('Sala de estar');
    await user.clear(nameInput);
    await user.type(nameInput, 'Sala renovada');

    const submitButton = screen.getByRole('button', { name: 'Actualizar Lugar' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Sala renovada',
        icon: '🛋️',
        id: 'place-1',
      });
    });
  });

  it('shows loading state during form submission', async () => {
    render(<PlaceForm onSubmit={mockOnSubmit} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: 'Guardando...' });
    expect(submitButton).toBeDisabled();
  });

  it('handles form submission errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockOnSubmit.mockRejectedValue(new Error('Submission failed'));

    render(<PlaceForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Nombre del Lugar');
    const iconInput = screen.getByLabelText('Icono');

    await user.type(nameInput, 'Test Place');
    await user.type(iconInput, '🏠');

    const submitButton = screen.getByRole('button', { name: 'Crear Lugar' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error submitting place form:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('displays helpful icon examples in description', () => {
    render(<PlaceForm onSubmit={mockOnSubmit} />);

    const helpText = screen.getByText(/Puedes usar emojis como iconos/);
    expect(helpText).toBeInTheDocument();
    expect(helpText).toHaveTextContent('🏠 (hogar), 🛋️ (sala), 🛏️ (dormitorio), 🍽️ (comedor)');
  });

  it('applies error styling to input fields when validation fails', async () => {
    render(<PlaceForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: 'Crear Lugar' });
    await user.click(submitButton);

    const nameInput = screen.getByLabelText('Nombre del Lugar');
    const iconInput = screen.getByLabelText('Icono');

    expect(nameInput).toHaveClass('border-red-500');
    expect(iconInput).toHaveClass('border-red-500');
  });
});
