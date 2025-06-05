// Tests para MainOptionsTable
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { MainOptionsTable } from '@/components/main-options/main-options-table';
import { MainOption } from '@/types/main-option';


// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('MainOptionsTable', () => {
  const mockPush = jest.fn();
  const mockOnDelete = jest.fn();

  const mockMainOptions: MainOption[] = [
    {
      id: 'main-option-1',
      name: 'Relajación',
      description: 'Opciones para relajación y alivio del estrés',
      emoji: '🧘‍♀️',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'main-option-2',
      name: 'Energía',
      description: 'Opciones para aumentar la energía',
      emoji: '⚡',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
    {
      id: 'main-option-3',
      name: 'Concentración',
      emoji: '🎯',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
  });

  it('renderiza la tabla con opciones principales correctamente (happy path)', () => {
    render(
      <MainOptionsTable 
        mainOptions={mockMainOptions} 
        onDelete={mockOnDelete} 
      />
    );

    // Verificar encabezados de tabla
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Emoji')).toBeInTheDocument();
    expect(screen.getByText('Fecha de Creación')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();

    // Verificar datos de las opciones principales
    expect(screen.getByText('Relajación')).toBeInTheDocument();
    expect(screen.getByText('Opciones para relajación y alivio del estrés')).toBeInTheDocument();
    expect(screen.getByText('🧘‍♀️')).toBeInTheDocument();
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();

    expect(screen.getByText('Energía')).toBeInTheDocument();
    expect(screen.getByText('Opciones para aumentar la energía')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();

    expect(screen.getByText('Concentración')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay opciones principales', () => {
    render(
      <MainOptionsTable 
        mainOptions={[]} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText('No hay categorías disponibles')).toBeInTheDocument();
  });

  it('muestra "Sin descripción" para opciones sin descripción', () => {
    render(
      <MainOptionsTable 
        mainOptions={mockMainOptions} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText('Sin descripción')).toBeInTheDocument();
  });

  it('maneja fechas inválidas correctamente', () => {
    const optionsWithInvalidDate: MainOption[] = [
      {
        id: 'option-invalid',
        name: 'Opción sin fecha',
        description: 'Descripción de prueba',
        emoji: '❓',
      },
    ];

    render(
      <MainOptionsTable 
        mainOptions={optionsWithInvalidDate} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText('Fecha no disponible')).toBeInTheDocument();
  });

  it('navega a la página de detalles al hacer click en el botón de ver', () => {
    render(
      <MainOptionsTable 
        mainOptions={mockMainOptions} 
        onDelete={mockOnDelete} 
      />
    );

    const viewButtons = screen.getAllByTitle('Ver detalles');
    fireEvent.click(viewButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/admin/management/main-options/main-option-1');
  });

  it('navega a la página de edición al hacer click en el botón de editar', () => {
    render(
      <MainOptionsTable 
        mainOptions={mockMainOptions} 
        onDelete={mockOnDelete} 
      />
    );

    const editButtons = screen.getAllByTitle('Editar');
    fireEvent.click(editButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/admin/management/main-options/main-option-1/edit');
  });

  it('abre el diálogo de confirmación al hacer click en eliminar', () => {
    render(
      <MainOptionsTable 
        mainOptions={mockMainOptions} 
        onDelete={mockOnDelete} 
      />
    );

    const deleteButtons = screen.getAllByTitle('Eliminar');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/¿estás seguro\?/i)).toBeInTheDocument();
    expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();
    expect(screen.getByText(/se eliminará permanentemente la opción principal "relajación"/i)).toBeInTheDocument();
  });

  it('cierra el diálogo de eliminación al hacer click en cancelar', async () => {
    render(
      <MainOptionsTable 
        mainOptions={mockMainOptions} 
        onDelete={mockOnDelete} 
      />
    );

    // Abrir diálogo
    const deleteButtons = screen.getAllByTitle('Eliminar');
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByText(/¿estás seguro\?/i)).toBeInTheDocument();

    // Cancelar
    fireEvent.click(screen.getByText(/cancelar/i));

    // El diálogo debería cerrarse
    await waitFor(() => {
      expect(screen.queryByText(/¿estás seguro\?/i)).not.toBeInTheDocument();
    });
  });

  it('llama a onDelete cuando se confirma la eliminación', async () => {
    render(
      <MainOptionsTable 
        mainOptions={mockMainOptions} 
        onDelete={mockOnDelete} 
      />
    );

    // Abrir diálogo de eliminación
    const deleteButtons = screen.getAllByTitle('Eliminar');
    fireEvent.click(deleteButtons[0]);

    // Confirmar eliminación
    const eliminarButtons = screen.getAllByText(/eliminar/i);
    fireEvent.click(eliminarButtons.find(btn => btn.tagName === 'BUTTON')!);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockMainOptions[0]);
    });

    // El diálogo debería cerrarse después de la eliminación
    await waitFor(() => {
      expect(screen.queryByText(/¿estás seguro\?/i)).not.toBeInTheDocument();
    });
  });

  it('trunca descripciones largas correctamente', () => {
    const optionWithLongDescription: MainOption[] = [
      {
        id: 'option-long',
        name: 'Opción con descripción larga',
        description: 'Esta es una descripción extremadamente larga que debería ser truncada en la tabla para mantener un diseño limpio y legible para el usuario final que está revisando las opciones principales disponibles en el sistema',
        emoji: '📝',
        createdAt: '2023-01-01T00:00:00Z',
      },
    ];

    render(
      <MainOptionsTable 
        mainOptions={optionWithLongDescription} 
        onDelete={mockOnDelete} 
      />
    );

    // La descripción debería estar presente pero truncada visualmente por CSS
    expect(screen.getByText(/esta es una descripción extremadamente larga/i)).toBeInTheDocument();
  });

  it('maneja múltiples opciones principales con diferentes estados', () => {
    const mixedOptions: MainOption[] = [
      {
        id: 'option-1',
        name: 'Completa',
        description: 'Con todos los campos',
        emoji: '✅',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'option-2',
        name: 'Sin descripción',
        emoji: '❌',
        createdAt: '2023-01-02T00:00:00Z',
      },
      {
        id: 'option-3',
        name: 'Sin fecha',
        description: 'Sin createdAt',
        emoji: '📅',
      },
    ];

    render(
      <MainOptionsTable 
        mainOptions={mixedOptions} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText('Completa')).toBeInTheDocument();
    expect(screen.getByText('Con todos los campos')).toBeInTheDocument();
    expect(screen.getByText('Sin descripción', { selector: 'div' })).toBeInTheDocument(); // El texto "Sin descripción" por falta de descripción
    expect(screen.getByText('Sin fecha')).toBeInTheDocument();
    expect(screen.getByText('Fecha no disponible')).toBeInTheDocument();
  });

  it('muestra todos los botones de acción para cada opción principal', () => {
    render(
      <MainOptionsTable 
        mainOptions={[mockMainOptions[0]]} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByTitle('Ver detalles')).toBeInTheDocument();
    expect(screen.getByTitle('Editar')).toBeInTheDocument();
    expect(screen.getByTitle('Eliminar')).toBeInTheDocument();
  });
});
