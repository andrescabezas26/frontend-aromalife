// Tests para IntendedImpactsTable
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { IntendedImpactsTable } from '@/components/intended-impacts/intended-impacts-table';
import { IntendedImpactTableView } from '@/types/intended-impact';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

describe('IntendedImpactsTable', () => {
  const mockIntendedImpacts: IntendedImpactTableView[] = [
    {
      id: 'impact-1',
      name: 'Relajación',
      description: 'Promueve la relajación profunda',
      icon: '🧘',
      mainOptionName: 'Bienestar',
      mainOptionEmoji: '💆‍♀️',
    },
    {
      id: 'impact-2',
      name: 'Energía',
      description: 'Aumenta los niveles de energía',
      icon: '⚡',
      mainOptionName: 'Activación',
      mainOptionEmoji: '🔥',
    },
    {
      id: 'impact-3',
      name: 'Sin Asociar',
      description: 'Impacto sin opción principal',
      icon: '🌟',
      mainOptionName: undefined,
      mainOptionEmoji: undefined,
    },
  ];

  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renderiza la tabla con impactos correctamente (happy path)', () => {
    render(<IntendedImpactsTable intendedImpacts={mockIntendedImpacts} onDelete={mockOnDelete} />);

    // Verifica que se muestran los datos de los impactos
    expect(screen.getByText('Relajación')).toBeInTheDocument();
    expect(screen.getByText('Energía')).toBeInTheDocument();
    expect(screen.getByText('Sin Asociar')).toBeInTheDocument();
    expect(screen.getByText('Promueve la relajación profunda')).toBeInTheDocument();
    expect(screen.getByText('Aumenta los niveles de energía')).toBeInTheDocument();
    expect(screen.getByText('🧘')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();

    // Verifica que se muestran los botones de acción
    const viewButtons = screen.getAllByTitle('Ver detalles');
    const editButtons = screen.getAllByTitle('Editar');
    const deleteButtons = screen.getAllByTitle('Eliminar');

    expect(viewButtons).toHaveLength(3);
    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });

  it('navega correctamente a las páginas de detalle y edición (happy path)', () => {
    render(<IntendedImpactsTable intendedImpacts={mockIntendedImpacts} onDelete={mockOnDelete} />);

    // Simula clic en botón de ver detalles
    const viewButton = screen.getAllByTitle('Ver detalles')[0];
    fireEvent.click(viewButton);
    expect(mockPush).toHaveBeenCalledWith('/admin/management/intended-impacts/impact-1');

    // Simula clic en botón de editar
    const editButton = screen.getAllByTitle('Editar')[0];
    fireEvent.click(editButton);
    expect(mockPush).toHaveBeenCalledWith('/admin/management/intended-impacts/impact-1/edit');
  });

  it('elimina un impacto exitosamente', async () => {
    mockOnDelete.mockResolvedValue({});

    render(<IntendedImpactsTable intendedImpacts={mockIntendedImpacts} onDelete={mockOnDelete} />);

    // Abre el diálogo de confirmación
    const deleteButton = screen.getAllByTitle('Eliminar')[0];
    fireEvent.click(deleteButton);

    // Verifica que se muestra el diálogo
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument();
    expect(screen.getByText(/"Relajación"/)).toBeInTheDocument();

    // Confirma la eliminación
    const confirmButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockIntendedImpacts[0]);
    });
  });

  it('muestra mensaje cuando no hay impactos', () => {
    render(<IntendedImpactsTable intendedImpacts={[]} onDelete={mockOnDelete} />);

    expect(screen.getByText('No hay impactos disponibles')).toBeInTheDocument();
  });

  it('muestra correctamente impactos con y sin opciones principales asociadas', () => {
    render(<IntendedImpactsTable intendedImpacts={mockIntendedImpacts} onDelete={mockOnDelete} />);

    // Verifica impactos con opción principal
    expect(screen.getByText('💆‍♀️')).toBeInTheDocument();
    expect(screen.getByText('Bienestar')).toBeInTheDocument();
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('Activación')).toBeInTheDocument();

    // Verifica impacto sin opción principal
    expect(screen.getByText('Sin asociar')).toBeInTheDocument();
  });

  it('cancela la eliminación correctamente (not happy path)', () => {
    render(<IntendedImpactsTable intendedImpacts={mockIntendedImpacts} onDelete={mockOnDelete} />);

    // Abre el diálogo de confirmación
    const deleteButton = screen.getAllByTitle('Eliminar')[0];
    fireEvent.click(deleteButton);

    // Verifica que se muestra el diálogo
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();

    // Cancela la eliminación
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    // Verifica que no se llamó la función de eliminación
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('trunca descripciones largas correctamente', () => {
    const impactWithLongDescription: IntendedImpactTableView[] = [
      {
        id: 'impact-long',
        name: 'Impacto con descripción larga',
        description: 'Esta es una descripción muy larga que debería ser truncada en la tabla para mantener el diseño limpio y ordenado',
        icon: '📝',
        mainOptionName: 'Test',
        mainOptionEmoji: '🧪',
      },
    ];

    render(<IntendedImpactsTable intendedImpacts={impactWithLongDescription} onDelete={mockOnDelete} />);

    const descriptionCell = screen.getByText('Esta es una descripción muy larga que debería ser truncada en la tabla para mantener el diseño limpio y ordenado');
    expect(descriptionCell).toHaveClass('max-w-xs', 'truncate');
    expect(descriptionCell).toHaveAttribute('title', 'Esta es una descripción muy larga que debería ser truncada en la tabla para mantener el diseño limpio y ordenado');
  });
});
