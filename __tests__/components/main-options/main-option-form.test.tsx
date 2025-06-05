// Tests para MainOptionForm
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MainOptionForm } from '@/components/main-options/main-option-form';
import { MainOption } from '@/types/main-option';

describe('MainOptionForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza los campos del formulario correctamente (happy path)', () => {
    render(<MainOptionForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/nombre de la opción principal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/emoji/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear opción principal/i })).toBeInTheDocument();
  });

  it('muestra errores de validación cuando faltan campos requeridos (not happy path)', async () => {
    render(<MainOptionForm onSubmit={mockOnSubmit} />);
    
    // Intentar enviar formulario vacío
    fireEvent.click(screen.getByRole('button', { name: /crear opción principal/i }));

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/el emoji es requerido/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('pre-llena el formulario cuando se proporciona una opción principal existente', () => {
    const existingMainOption: MainOption = {
      id: 'main-option-1',
      name: 'Relajación',
      description: 'Opciones para relajación y alivio del estrés',
      emoji: '🧘‍♀️',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    render(<MainOptionForm mainOption={existingMainOption} onSubmit={mockOnSubmit} />);
    
    expect((screen.getByLabelText(/nombre de la opción principal/i) as HTMLInputElement).value).toBe('Relajación');
    expect((screen.getByLabelText(/descripción/i) as HTMLTextAreaElement).value).toBe('Opciones para relajación y alivio del estrés');
    expect((screen.getByLabelText(/emoji/i) as HTMLInputElement).value).toBe('🧘‍♀️');
    expect(screen.getByRole('button', { name: /actualizar opción principal/i })).toBeInTheDocument();
    
    // Verificar que se muestra el emoji en preview
    expect(screen.getByText('🧘‍♀️')).toBeInTheDocument();
  });

  it('llama a onSubmit con los datos correctos cuando el formulario es válido', async () => {
    render(<MainOptionForm onSubmit={mockOnSubmit} />);
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/nombre de la opción principal/i), {
      target: { value: 'Energía' }
    });
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Opciones para aumentar la energía' }
    });
    fireEvent.change(screen.getByLabelText(/emoji/i), {
      target: { value: '⚡' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /crear opción principal/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Energía',
        description: 'Opciones para aumentar la energía',
        emoji: '⚡',
        id: undefined
      });
    });
  });

  it('limpia los errores cuando el usuario empieza a escribir', async () => {
    render(<MainOptionForm onSubmit={mockOnSubmit} />);
    
    // Intentar enviar formulario vacío para mostrar errores
    fireEvent.click(screen.getByRole('button', { name: /crear opción principal/i }));

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
    });

    // Escribir en el campo nombre
    fireEvent.change(screen.getByLabelText(/nombre de la opción principal/i), {
      target: { value: 'Nuevo nombre' }
    });

    // El error debería desaparecer
    await waitFor(() => {
      expect(screen.queryByText(/el nombre es requerido/i)).not.toBeInTheDocument();
    });
  });

  it('muestra el estado de carga correctamente', () => {
    render(<MainOptionForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /guardando.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardando.../i })).toBeDisabled();
  });

  it('actualiza la vista previa del emoji cuando se cambia', () => {
    render(<MainOptionForm onSubmit={mockOnSubmit} />);
    
    const emojiInput = screen.getByLabelText(/emoji/i);
    
    // Cambiar el emoji
    fireEvent.change(emojiInput, { target: { value: '🌟' } });
    
    // Verificar que se muestra en la vista previa
    expect(screen.getByText('🌟')).toBeInTheDocument();
  });

  it('permite enviar formulario solo con nombre y emoji (descripción opcional)', async () => {
    render(<MainOptionForm onSubmit={mockOnSubmit} />);
    
    // Llenar solo campos requeridos
    fireEvent.change(screen.getByLabelText(/nombre de la opción principal/i), {
      target: { value: 'Concentración' }
    });
    fireEvent.change(screen.getByLabelText(/emoji/i), {
      target: { value: '🎯' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /crear opción principal/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Concentración',
        description: '',
        emoji: '🎯',
        id: undefined
      });
    });
  });

  it('maneja errores en onSubmit correctamente', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockOnSubmitWithError = jest.fn().mockRejectedValue(new Error('Server error'));
    
    render(<MainOptionForm onSubmit={mockOnSubmitWithError} />);
    
    // Llenar formulario válido
    fireEvent.change(screen.getByLabelText(/nombre de la opción principal/i), {
      target: { value: 'Test Option' }
    });
    fireEvent.change(screen.getByLabelText(/emoji/i), {
      target: { value: '🧪' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /crear opción principal/i }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error submitting main option form:', 
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('valida que el nombre no sea solo espacios en blanco', async () => {
    render(<MainOptionForm onSubmit={mockOnSubmit} />);
    
    // Llenar con espacios en blanco
    fireEvent.change(screen.getByLabelText(/nombre de la opción principal/i), {
      target: { value: '   ' }
    });
    fireEvent.change(screen.getByLabelText(/emoji/i), {
      target: { value: '🧪' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /crear opción principal/i }));

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('valida que el emoji no sea solo espacios en blanco', async () => {
    render(<MainOptionForm onSubmit={mockOnSubmit} />);
    
    // Llenar con espacios en blanco en emoji
    fireEvent.change(screen.getByLabelText(/nombre de la opción principal/i), {
      target: { value: 'Test Option' }
    });
    fireEvent.change(screen.getByLabelText(/emoji/i), {
      target: { value: '   ' }
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /crear opción principal/i }));

    await waitFor(() => {
      expect(screen.getByText(/el emoji es requerido/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
