// Tests para DeleteMainOptionButton
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteMainOptionButton } from '@/components/main-options/delete-main-option-button';
import { MainOption } from '@/types/main-option';
import { MainOptionService } from '@/services/main-option/main-option.service';

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

describe('DeleteMainOptionButton', () => {
  const mockOnDelete = jest.fn();
  const mockMainOption: MainOption = {
    id: 'main-option-1',
    name: 'Relajación',
    description: 'Opciones para relajación',
    emoji: '🧘‍♀️',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el botón de eliminar correctamente', () => {
    render(
      <DeleteMainOptionButton 
        mainOption={mockMainOption} 
        onDelete={mockOnDelete} 
      />
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('cierra el diálogo al hacer click en cancelar', async () => {
    render(
      <DeleteMainOptionButton 
        mainOption={mockMainOption} 
        onDelete={mockOnDelete} 
      />
    );
    
    // Abrir diálogo
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/¿estás seguro\?/i)).toBeInTheDocument();
    
    // Cancelar
    fireEvent.click(screen.getByText(/cancelar/i));
    
    // El diálogo debería cerrarse
    await waitFor(() => {
      expect(screen.queryByText(/¿estás seguro\?/i)).not.toBeInTheDocument();
    });
  });

  it('muestra el nombre de la opción principal en el mensaje de confirmación', () => {
    const optionWithLongName: MainOption = {
      id: 'option-2',
      name: 'Opción Principal con Nombre Muy Largo',
      description: 'Descripción',
      emoji: '📝',
    };
    
    render(
      <DeleteMainOptionButton 
        mainOption={optionWithLongName} 
        onDelete={mockOnDelete} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText(/se eliminará permanentemente la opción principal "opción principal con nombre muy largo"/i)).toBeInTheDocument();
  });

  it('maneja opción principal con emoji complejo', () => {
    const optionWithComplexEmoji: MainOption = {
      id: 'option-3',
      name: 'Opción Especial',
      description: 'Con emoji complejo',
      emoji: '🧘‍♀️✨🌟',
    };
    
    render(
      <DeleteMainOptionButton 
        mainOption={optionWithComplexEmoji} 
        onDelete={mockOnDelete} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText(/se eliminará permanentemente la opción principal "opción especial"/i)).toBeInTheDocument();
  });
});
