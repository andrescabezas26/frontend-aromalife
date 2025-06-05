// Tests para EditGiftForm
import { render, screen, waitFor } from '@testing-library/react';
import { EditGiftForm } from '@/components/gifts/edit-gift-form';
import { GiftService } from '@/services/gifts/gift.service';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock del hook useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock del GiftService
jest.mock('@/services/gifts/gift.service', () => ({
  GiftService: {
    getById: jest.fn(),
    update: jest.fn(),
    updateWithFile: jest.fn(),
  },
}));

// Mock del componente GiftForm
jest.mock('@/components/gifts/gift-form', () => ({
  GiftForm: ({ gift, onSubmit, isLoading }: any) => (
    <div data-testid="gift-form">
      <div data-testid="gift-name">{gift?.name}</div>
      <button 
        data-testid="submit-button" 
        onClick={() => onSubmit({ name: 'Updated Gift', description: 'Updated desc', price: 30.00 })}
        disabled={isLoading}
      >
        {isLoading ? 'Actualizando...' : 'Actualizar'}
      </button>
    </div>
  ),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockToast = jest.fn();

describe('EditGiftForm', () => {
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

  it('carga y muestra los datos del regalo correctamente (happy path)', async () => {
    const mockGift = {
      id: '1',
      name: 'Test Gift',
      description: 'Test description',
      price: 25.99,
      imageUrl: 'test-image.jpg',
    };

    (GiftService.getById as jest.Mock).mockResolvedValue(mockGift);

    render(<EditGiftForm giftId="1" />);

    // Verifica que muestra el loader inicialmente
    expect(screen.getByText('Cargando regalo...')).toBeInTheDocument();

    // Espera a que carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Editar Regalo')).toBeInTheDocument();
      expect(screen.getByTestId('gift-form')).toBeInTheDocument();
      expect(screen.getByTestId('gift-name')).toHaveTextContent('Test Gift');
    });

    expect(GiftService.getById).toHaveBeenCalledWith('1');
  });

  it('actualiza el regalo exitosamente (happy path)', async () => {
    const mockGift = {
      id: '1',
      name: 'Test Gift',
      description: 'Test description',
      price: 25.99,
      imageUrl: 'test-image.jpg',
    };

    (GiftService.getById as jest.Mock).mockResolvedValue(mockGift);
    (GiftService.update as jest.Mock).mockResolvedValue({});

    render(<EditGiftForm giftId="1" />);

    await waitFor(() => {
      expect(screen.getByTestId('gift-form')).toBeInTheDocument();
    });

    // Simula envío del formulario
    const submitButton = screen.getByTestId('submit-button');
    submitButton.click();

    await waitFor(() => {
      expect(GiftService.update).toHaveBeenCalledWith('1', {
        name: 'Updated Gift',
        description: 'Updated desc',
        price: 30.00,
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: '¡Regalo actualizado exitosamente!',
        description: 'El regalo "Updated Gift" ha sido actualizado correctamente.',
      });
      expect(mockPush).toHaveBeenCalledWith('/admin/management/gifts');
    });
  });

  it('maneja errores al cargar el regalo (not happy path)', async () => {
    const mockError = new Error('Regalo no encontrado');
    (GiftService.getById as jest.Mock).mockRejectedValue(mockError);

    render(<EditGiftForm giftId="1" />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error al cargar regalo',
        description: 'Regalo no encontrado',
        variant: 'destructive',
      });
      expect(mockPush).toHaveBeenCalledWith('/admin/management/gifts');
    });
  });
});
