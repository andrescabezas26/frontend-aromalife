// Tests para GiftsTable
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GiftsTable } from '@/components/gifts/gifts-table';
import { GiftService } from '@/services/gifts/gift.service';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock del hook useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock del GiftService
jest.mock('@/services/gifts/gift.service', () => ({
  GiftService: {
    delete: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockToast = jest.fn();

describe('GiftsTable', () => {
  const mockGifts = [
    {
      id: '1',
      name: 'Regalo 1',
      description: 'Descripción 1',
      price: 25.99,
      imageUrl: 'image1.jpg',
    },
    {
      id: '2',
      name: 'Regalo 2',
      description: 'Descripción 2',
      price: 35.50,
      imageUrl: undefined,
    },
  ];

  const mockOnGiftDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  it('renderiza la tabla con regalos correctamente (happy path)', () => {
    render(<GiftsTable gifts={mockGifts} onGiftDeleted={mockOnGiftDeleted} />);

    // Verifica que se muestran los datos de los regalos
    expect(screen.getByText('Regalo 1')).toBeInTheDocument();
    expect(screen.getByText('Regalo 2')).toBeInTheDocument();
    expect(screen.getByText('Descripción 1')).toBeInTheDocument();
    expect(screen.getByText('Descripción 2')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
    expect(screen.getByText('$35.50')).toBeInTheDocument();

    // Verifica que se muestran los botones de acción
    const viewButtons = screen.getAllByTitle('Ver detalles');
    const editButtons = screen.getAllByTitle('Editar');
    const deleteButtons = screen.getAllByTitle('Eliminar');

    expect(viewButtons).toHaveLength(2);
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('navega correctamente a las páginas de detalle y edición (happy path)', () => {
    render(<GiftsTable gifts={mockGifts} onGiftDeleted={mockOnGiftDeleted} />);

    // Simula clic en botón de ver detalles
    const viewButton = screen.getAllByTitle('Ver detalles')[0];
    fireEvent.click(viewButton);
    expect(mockPush).toHaveBeenCalledWith('/admin/management/gifts/1');

    // Simula clic en botón de editar
    const editButton = screen.getAllByTitle('Editar')[0];
    fireEvent.click(editButton);
    expect(mockPush).toHaveBeenCalledWith('/admin/management/gifts/1/edit');
  });

  it('elimina un regalo exitosamente', async () => {
    (GiftService.delete as jest.Mock).mockResolvedValue({});

    render(<GiftsTable gifts={mockGifts} onGiftDeleted={mockOnGiftDeleted} />);

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
      expect(GiftService.delete).toHaveBeenCalledWith('1');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Regalo eliminado',
        description: 'El regalo ha sido eliminado correctamente',
      });
      expect(mockOnGiftDeleted).toHaveBeenCalled();
    });
  });

  it('muestra mensaje cuando no hay regalos', () => {
    render(<GiftsTable gifts={[]} onGiftDeleted={mockOnGiftDeleted} />);

    expect(screen.getByText('No hay regalos disponibles')).toBeInTheDocument();
  });

  it('maneja errores al eliminar regalo (not happy path)', async () => {
    const mockError = new Error('Error al eliminar');
    (GiftService.delete as jest.Mock).mockRejectedValue(mockError);

    render(<GiftsTable gifts={mockGifts} onGiftDeleted={mockOnGiftDeleted} />);

    // Abre el diálogo de confirmación
    const deleteButton = screen.getAllByTitle('Eliminar')[0];
    fireEvent.click(deleteButton);

    // Confirma la eliminación
    const confirmButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Error al eliminar',
        variant: 'destructive',
      });
    });
  });
});
