// Tests para LabelsTable
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LabelsTable } from '@/components/labels/labels-table';
import { Label } from '@/services/labels/labels.service';
import { useRouter } from 'next/navigation';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock de next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

const mockPush = jest.fn();
const mockOnDelete = jest.fn();

describe('LabelsTable', () => {
  const mockLabels: Label[] = [
    {
      id: 'label-1',
      name: 'Etiqueta Template',
      description: 'Descripción template',
      imageUrl: 'https://example.com/template.jpg',
      type: 'template',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'label-2',
      name: 'Etiqueta IA',
      description: 'Generada por IA',
      imageUrl: 'https://example.com/ai.jpg',
      type: 'ai-generated',
      aiPrompt: 'Prompt para IA',
      isActive: true,
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
    {
      id: 'label-3',
      name: 'Etiqueta Custom',
      imageUrl: 'https://example.com/custom.jpg',
      type: 'custom',
      isActive: true,
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renderiza la tabla con etiquetas correctamente (happy path)', () => {
    render(<LabelsTable labels={mockLabels} onDelete={mockOnDelete} />);

    // Verifica que se muestran los datos de las etiquetas
    expect(screen.getByText('Etiqueta Template')).toBeInTheDocument();
    expect(screen.getByText('Etiqueta IA')).toBeInTheDocument();
    expect(screen.getByText('Etiqueta Custom')).toBeInTheDocument();

    expect(screen.getByText('Descripción template')).toBeInTheDocument();
    expect(screen.getByText('Generada por IA')).toBeInTheDocument();
    expect(screen.getByText('Sin descripción')).toBeInTheDocument(); // Para label-3 sin descripción

    // Verifica los tipos de etiquetas
    expect(screen.getByText('Plantilla')).toBeInTheDocument();
    expect(screen.getByText('IA')).toBeInTheDocument();
    expect(screen.getByText('Personalizada')).toBeInTheDocument();

    // Verifica las fechas
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();

    // Verifica que se muestran los botones de acción
    const viewButtons = screen.getAllByTitle('Ver detalles');
    const editButtons = screen.getAllByTitle('Editar');
    const deleteButtons = screen.getAllByTitle('Eliminar');

    expect(viewButtons).toHaveLength(3);
    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });

  it('navega correctamente a las páginas de detalle y edición (happy path)', () => {
    render(<LabelsTable labels={mockLabels} onDelete={mockOnDelete} />);

    // Simula clic en botón de ver detalles
    const viewButton = screen.getAllByTitle('Ver detalles')[0];
    fireEvent.click(viewButton);
    expect(mockPush).toHaveBeenCalledWith('/admin/management/labels/label-1');

    // Simula clic en botón de editar
    const editButton = screen.getAllByTitle('Editar')[0];
    fireEvent.click(editButton);
    expect(mockPush).toHaveBeenCalledWith('/admin/management/labels/edit/label-1');
  });

  it('elimina una etiqueta exitosamente', async () => {
    mockOnDelete.mockResolvedValue(undefined);

    render(<LabelsTable labels={mockLabels} onDelete={mockOnDelete} />);

    // Abre el diálogo de confirmación
    const deleteButton = screen.getAllByTitle('Eliminar')[0];
    fireEvent.click(deleteButton);

    // Verifica que se muestra el diálogo
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument();

    // Confirma la eliminación
    const confirmButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockLabels[0]);
    });
  });

  it('muestra mensaje cuando no hay etiquetas', () => {
    render(<LabelsTable labels={[]} onDelete={mockOnDelete} />);

    expect(screen.getByText('No hay etiquetas disponibles')).toBeInTheDocument();
  });

  it('cancela la eliminación correctamente', () => {
    render(<LabelsTable labels={mockLabels} onDelete={mockOnDelete} />);

    // Abre el diálogo de confirmación
    const deleteButton = screen.getAllByTitle('Eliminar')[0];
    fireEvent.click(deleteButton);

    // Verifica que se muestra el diálogo
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();

    // Cancela la eliminación
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    // Verifica que el diálogo se cierra
    expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('muestra las imágenes de las etiquetas correctamente', () => {
    render(<LabelsTable labels={mockLabels} onDelete={mockOnDelete} />);

    // Verifica que las imágenes se renderizan con los atributos correctos
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    
    expect(images[0]).toHaveAttribute('src', 'https://example.com/template.jpg');
    expect(images[0]).toHaveAttribute('alt', 'Etiqueta Template');
    
    expect(images[1]).toHaveAttribute('src', 'https://example.com/ai.jpg');
    expect(images[1]).toHaveAttribute('alt', 'Etiqueta IA');
    
    expect(images[2]).toHaveAttribute('src', 'https://example.com/custom.jpg');
    expect(images[2]).toHaveAttribute('alt', 'Etiqueta Custom');
  });
});
