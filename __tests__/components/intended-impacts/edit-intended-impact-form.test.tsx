// Tests para EditIntendedImpactForm
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { EditIntendedImpactForm } from '@/components/intended-impacts/edit-intended-impact-form';
import { IntendedImpactService } from '@/services/intended-impacts/intended-impact.service';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock del hook useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock del IntendedImpactService
jest.mock('@/services/intended-impacts/intended-impact.service', () => ({
  IntendedImpactService: {
    getById: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock del IntendedImpactForm
jest.mock('@/components/intended-impacts/intended-impact-form', () => ({
  IntendedImpactForm: ({ intendedImpact, onSubmit, isLoading }: any) => (
    <div>
      <div data-testid="impact-form">
        <p>Editing: {intendedImpact?.name}</p>
        <button 
          onClick={() => onSubmit({ 
            id: intendedImpact?.id,
            name: 'Updated Impact',
            icon: '🔄',
            description: 'Updated description',
            mainOptionId: 'main-option-1'
          })}
          disabled={isLoading}
        >
          {isLoading ? 'Actualizando...' : 'Actualizar Impacto'}
        </button>
      </div>
    </div>
  ),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockToast = jest.fn();

describe('EditIntendedImpactForm', () => {
  const mockIntendedImpact = {
    id: 'impact-1',
    name: 'Impacto Test',
    icon: '🧘',
    description: 'Descripción del impacto',
    mainOptionId: 'main-option-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  it('carga y muestra el impacto para editar (happy path)', async () => {
    (IntendedImpactService.getById as jest.Mock).mockResolvedValue(mockIntendedImpact);

    render(<EditIntendedImpactForm intendedImpactId="impact-1" />);

    await waitFor(() => {
      expect(screen.getByText('Editar Impacto')).toBeInTheDocument();
      expect(screen.getByText('Editing: Impacto Test')).toBeInTheDocument();
    });

    expect(IntendedImpactService.getById).toHaveBeenCalledWith('impact-1');
  });

  it('actualiza el impacto exitosamente (happy path)', async () => {
    (IntendedImpactService.getById as jest.Mock).mockResolvedValue(mockIntendedImpact);
    (IntendedImpactService.update as jest.Mock).mockResolvedValue({});

    render(<EditIntendedImpactForm intendedImpactId="impact-1" />);

    await waitFor(() => {
      expect(screen.getByText('Actualizar Impacto')).toBeInTheDocument();
    });

    // Simular actualización
    fireEvent.click(screen.getByText('Actualizar Impacto'));

    await waitFor(() => {
      expect(IntendedImpactService.update).toHaveBeenCalledWith('impact-1', {
        id: 'impact-1',
        name: 'Updated Impact',
        icon: '🔄',
        description: 'Updated description',
        mainOptionId: 'main-option-1'
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: '¡Impacto  actualizado exitosamente!',
        description: 'El impacto  "Updated Impact" ha sido actualizado correctamente.',
      });
      expect(mockPush).toHaveBeenCalledWith('/admin/management/intended-impacts');
    });
  });

  it('maneja errores al cargar el impacto (not happy path)', async () => {
    const mockError = new Error('Impacto no encontrado');
    (IntendedImpactService.getById as jest.Mock).mockRejectedValue(mockError);

    render(<EditIntendedImpactForm intendedImpactId="nonexistent" />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error al cargar impacto ',
        description: 'Impacto no encontrado',
        variant: 'destructive',
      });
      expect(mockPush).toHaveBeenCalledWith('/admin/management/intended-impacts');
    });
  });

  it('muestra estado de carga mientras se obtienen los datos', () => {
    (IntendedImpactService.getById as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<EditIntendedImpactForm intendedImpactId="impact-1" />);

    expect(screen.getByText('Cargando impacto ...')).toBeInTheDocument();
  });

  it('maneja errores al actualizar el impacto', async () => {
    (IntendedImpactService.getById as jest.Mock).mockResolvedValue(mockIntendedImpact);
    const mockError = new Error('Error de servidor');
    (IntendedImpactService.update as jest.Mock).mockRejectedValue(mockError);

    render(<EditIntendedImpactForm intendedImpactId="impact-1" />);

    await waitFor(() => {
      expect(screen.getByText('Actualizar Impacto')).toBeInTheDocument();
    });

    // Simular actualización que falla
    fireEvent.click(screen.getByText('Actualizar Impacto'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error al actualizar impacto ',
        description: 'Error de servidor',
        variant: 'destructive',
      });
    });
  });

  it('permite navegar de regreso', async () => {
    (IntendedImpactService.getById as jest.Mock).mockResolvedValue(mockIntendedImpact);

    render(<EditIntendedImpactForm intendedImpactId="impact-1" />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: '' }); // El botón de flecha atrás
      fireEvent.click(backButton);
    });

    expect(mockBack).toHaveBeenCalled();
  });
});
