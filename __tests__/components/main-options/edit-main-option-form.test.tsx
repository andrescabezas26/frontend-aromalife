// Tests para EditMainOptionForm
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { EditMainOptionForm } from '@/components/main-options/edit-main-option-form';
import { MainOption } from '@/types/main-option';
import { MainOptionService } from '@/services/main-option/main-option.service';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock del servicio
jest.mock('@/services/main-option/main-option.service');
const mockMainOptionService = MainOptionService as jest.Mocked<typeof MainOptionService>;

// Mock del hook useToast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock del MainOptionForm
jest.mock('@/components/main-options/main-option-form', () => ({
  MainOptionForm: ({ mainOption, onSubmit, isLoading }: any) => (
    <div data-testid="main-option-form">
      <div>Form for: {mainOption?.name || 'new'}</div>
      <div>Loading: {isLoading ? 'true' : 'false'}</div>
      <button onClick={() => onSubmit({ name: 'Updated Option', emoji: '✨' })}>
        Submit Form
      </button>
    </div>
  ),
}));

describe('EditMainOptionForm', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  const mockMainOption: MainOption = {
    id: 'main-option-1',
    name: 'Relajación',
    description: 'Opciones para relajación',
    emoji: '🧘‍♀️',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
    } as any);
  });

  it('carga y muestra la opción principal correctamente (happy path)', async () => {
    mockMainOptionService.getById.mockResolvedValue(mockMainOption);

    render(<EditMainOptionForm mainOptionId="main-option-1" />);

    // Inicialmente debería mostrar loading
    expect(screen.getByText(/cargando opción principal.../i)).toBeInTheDocument();

    // Después de cargar, debería mostrar el formulario
    await waitFor(() => {
      expect(screen.getByTestId('main-option-form')).toBeInTheDocument();
      expect(screen.getByText('Form for: Relajación')).toBeInTheDocument();
      expect(screen.getByText(/editar opción principal/i)).toBeInTheDocument();
      expect(screen.getByText(/modifica la información de la opción principal/i)).toBeInTheDocument();
    });

    expect(mockMainOptionService.getById).toHaveBeenCalledWith('main-option-1');
  });

  it('maneja errores al cargar la opción principal (not happy path)', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockMainOptionService.getById.mockRejectedValue(new Error('Not found'));

    render(<EditMainOptionForm mainOptionId="main-option-1" />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error al cargar opción principal",
        description: "Not found",
        variant: "destructive",
      });
      expect(mockPush).toHaveBeenCalledWith("/admin/management/main-options");
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading main option:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('actualiza la opción principal exitosamente', async () => {
    mockMainOptionService.getById.mockResolvedValue(mockMainOption);
    mockMainOptionService.update.mockResolvedValue(mockMainOption);

    render(<EditMainOptionForm mainOptionId="main-option-1" />);

    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.getByTestId('main-option-form')).toBeInTheDocument();
    });

    // Enviar el formulario
    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      expect(mockMainOptionService.update).toHaveBeenCalledWith('main-option-1', {
        name: 'Updated Option',
        emoji: '✨'
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: "¡Opción principal actualizada exitosamente!",
        description: 'La opción principal "Updated Option" ha sido actualizada correctamente.',
      });
      expect(mockPush).toHaveBeenCalledWith("/admin/management/main-options");
    });
  });

  it('maneja errores durante la actualización', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockMainOptionService.getById.mockResolvedValue(mockMainOption);
    mockMainOptionService.update.mockRejectedValue(new Error('Update failed'));

    render(<EditMainOptionForm mainOptionId="main-option-1" />);

    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.getByTestId('main-option-form')).toBeInTheDocument();
    });

    // Enviar el formulario
    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error al actualizar opción principal",
        description: "Update failed",
        variant: "destructive",
      });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating main option:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('maneja errores con respuesta del servidor', async () => {
    mockMainOptionService.getById.mockResolvedValue(mockMainOption);
    const serverError = {
      response: {
        data: {
          message: 'Validation failed'
        }
      }
    };
    mockMainOptionService.update.mockRejectedValue(serverError);

    render(<EditMainOptionForm mainOptionId="main-option-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('main-option-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error al actualizar opción principal",
        description: "Validation failed",
        variant: "destructive",
      });
    });
  });

  it('muestra el estado de carga durante la actualización', async () => {
    mockMainOptionService.getById.mockResolvedValue(mockMainOption);
    
    // Hacer que la actualización tarde en completarse
    let resolveUpdate: (value: MainOption) => void;
    const updatePromise = new Promise<MainOption>((resolve) => {
      resolveUpdate = resolve;
    });
    mockMainOptionService.update.mockReturnValue(updatePromise);

    render(<EditMainOptionForm mainOptionId="main-option-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('main-option-form')).toBeInTheDocument();
    });

    // Enviar el formulario
    fireEvent.click(screen.getByText('Submit Form'));

    // Verificar estado de carga
    await waitFor(() => {
      expect(screen.getByText('Loading: true')).toBeInTheDocument();
    });

    // Resolver la actualización
    resolveUpdate!(mockMainOption);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/management/main-options");
    });
  });

  it('navega hacia atrás al hacer click en el botón de volver', async () => {
    mockMainOptionService.getById.mockResolvedValue(mockMainOption);

    render(<EditMainOptionForm mainOptionId="main-option-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('main-option-form')).toBeInTheDocument();
    });

    // Click en el botón de volver
    const backButton = screen.getByRole('button', { name: '' }); // El botón tiene solo un ícono
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('maneja errores sin mensaje específico', async () => {
    mockMainOptionService.getById.mockResolvedValue(mockMainOption);
    mockMainOptionService.update.mockRejectedValue({});

    render(<EditMainOptionForm mainOptionId="main-option-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('main-option-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error al actualizar opción principal",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    });
  });

  it('no carga si no se proporciona mainOptionId', () => {
    render(<EditMainOptionForm mainOptionId="" />);

    expect(mockMainOptionService.getById).not.toHaveBeenCalled();
    expect(screen.getByText(/cargando opción principal.../i)).toBeInTheDocument();
  });

  it('maneja el caso cuando no se puede cargar la opción principal', async () => {
    mockMainOptionService.getById.mockResolvedValue(null as any);

    render(<EditMainOptionForm mainOptionId="main-option-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('main-option-form')).not.toBeInTheDocument();
    });
  });
});
