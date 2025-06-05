// Tests para IntendedImpactForm
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntendedImpactForm } from '@/components/intended-impacts/intended-impact-form';
import { MainOptionService } from '@/services/main-option/main-option.service';
import { MainOption } from '@/types/main-option';

// Mock del MainOptionService
jest.mock('@/services/main-option/main-option.service', () => ({
  MainOptionService: {
    getAll: jest.fn(),
  },
}));

describe('IntendedImpactForm', () => {
  const mockOnSubmit = jest.fn();
  const mockMainOptions: Array<MainOption & { id: string }> = [
    {
      id: 'main-option-1',
      name: 'Relajación',
      description: 'Opciones para relajarse',
      emoji: '🧘‍♀️',
    },
    {
      id: 'main-option-2',
      name: 'Energía',
      description: 'Opciones para energizarse',
      emoji: '⚡',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (MainOptionService.getAll as jest.Mock).mockResolvedValue(mockMainOptions);
  });

  it('renderiza los campos del formulario correctamente (happy path)', async () => {
    render(<IntendedImpactForm onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/icono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
      expect(screen.getByText(/selecciona una opción principal/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /crear impacto/i })).toBeInTheDocument();
    });
  });

  it('envía datos válidos del formulario (happy path)', async () => {
    render(<IntendedImpactForm onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    });

    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Relajación Profunda' } });
    fireEvent.change(screen.getByLabelText(/icono/i), { target: { value: '🌙' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Promueve relajación profunda' } });
    
    // Seleccionar opción principal
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    
    await waitFor(() => {
      const option = screen.getByText('Relajación');
      fireEvent.click(option);
    });

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /crear impacto/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Relajación Profunda',
        icon: '🌙',
        description: 'Promueve relajación profunda',
        mainOptionId: 'main-option-1',
      });
    });
  });

  it('muestra errores de validación cuando faltan campos requeridos (not happy path)', async () => {
    render(<IntendedImpactForm onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /crear impacto/i })).toBeInTheDocument();
    });

    // Intentar enviar formulario vacío
    fireEvent.click(screen.getByRole('button', { name: /crear impacto/i }));

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/el icono es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/la descripción es requerida/i)).toBeInTheDocument();
      expect(screen.getByText(/la opción principal es requerida/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('pre-llena el formulario cuando se proporciona un impacto existente', async () => {
    const existingImpact = {
      id: 'impact-1',
      name: 'Impacto Existente',
      icon: '✨',
      description: 'Descripción existente',
      mainOptionId: 'main-option-1',
    };

    render(<IntendedImpactForm intendedImpact={existingImpact} onSubmit={mockOnSubmit} />);
    
    await waitFor(() => {
      expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Impacto Existente');
      expect((screen.getByLabelText(/icono/i) as HTMLInputElement).value).toBe('✨');
      expect((screen.getByLabelText(/descripción/i) as HTMLTextAreaElement).value).toBe('Descripción existente');
      expect(screen.getByRole('button', { name: /actualizar impacto/i })).toBeInTheDocument();
    });
  });
});
