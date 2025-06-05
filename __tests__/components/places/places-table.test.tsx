import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlacesTable } from '@/components/places/places-table';
import { Place } from '@/types/place';
import '@testing-library/jest-dom';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockPlaces: Place[] = [
  {
    id: 'place-1',
    name: 'Sala de estar',
    icon: '🛋️',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'place-2',
    name: 'Dormitorio',
    icon: '🛏️',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
  },
  {
    id: 'place-3',
    name: 'Comedor',
    icon: '🍽️',
    createdAt: '2024-01-17T14:45:00Z',
    updatedAt: '2024-01-17T14:45:00Z',
  },
];

const mockPlaceWithoutDate: Place = {
  id: 'place-no-date',
  name: 'Baño',
  icon: '🚿',
};

describe('PlacesTable', () => {
  const mockOnDelete = jest.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table with all places correctly', () => {
    render(<PlacesTable places={mockPlaces} onDelete={mockOnDelete} />);

    // Check table headers
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Icono')).toBeInTheDocument();
    expect(screen.getByText('Fecha de Creación')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();

    // Check all places are rendered
    mockPlaces.forEach(place => {
      expect(screen.getByText(place.name)).toBeInTheDocument();
      expect(screen.getByText(place.icon)).toBeInTheDocument();
    });

    // Check formatted dates
    expect(screen.getByText('15/1/2024')).toBeInTheDocument();
    expect(screen.getByText('16/1/2024')).toBeInTheDocument();
    expect(screen.getByText('17/1/2024')).toBeInTheDocument();
  });

  it('displays empty state when no places are provided', () => {
    render(<PlacesTable places={[]} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('No hay lugares disponibles')).toBeInTheDocument();
    
    // Should still show headers
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Icono')).toBeInTheDocument();
  });

  it('handles missing creation date gracefully', () => {
    render(<PlacesTable places={[mockPlaceWithoutDate]} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Baño')).toBeInTheDocument();
    expect(screen.getByText('🚿')).toBeInTheDocument();
    expect(screen.getByText('Fecha no disponible')).toBeInTheDocument();
  });

  it('navigates to place details when view button is clicked', async () => {
    render(<PlacesTable places={[mockPlaces[0]]} onDelete={mockOnDelete} />);
    
    const viewButton = screen.getByTitle('Ver detalles');
    await user.click(viewButton);
    
    expect(mockPush).toHaveBeenCalledWith('/admin/management/places/place-1');
  });

  it('navigates to edit place when edit button is clicked', async () => {
    render(<PlacesTable places={[mockPlaces[0]]} onDelete={mockOnDelete} />);
    
    const editButton = screen.getByTitle('Editar');
    await user.click(editButton);
    
    expect(mockPush).toHaveBeenCalledWith('/admin/management/places/place-1/edit');
  });

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    render(<PlacesTable places={[mockPlaces[0]]} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByTitle('Eliminar');
    await user.click(deleteButton);
    
    // Check dialog is open
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
    expect(screen.getByText(/Esta acción no se puede deshacer.*Sala de estar/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
  });

  it('cancels deletion when cancel button is clicked', async () => {
    render(<PlacesTable places={[mockPlaces[0]]} onDelete={mockOnDelete} />);
    
    // Open dialog
    const deleteButton = screen.getByTitle('Eliminar');
    await user.click(deleteButton);
    
    // Cancel deletion
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelButton);
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument();
    });
    
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('confirms deletion when confirm button is clicked', async () => {
    render(<PlacesTable places={[mockPlaces[0]]} onDelete={mockOnDelete} />);
    
    // Open dialog
    const deleteButton = screen.getByTitle('Eliminar');
    await user.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: 'Eliminar' });
    await user.click(confirmButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockPlaces[0]);
    
    // Dialog should be closed after deletion
    await waitFor(() => {
      expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument();
    });
  });

  it('renders icons correctly in each place row', () => {
    render(<PlacesTable places={mockPlaces} onDelete={mockOnDelete} />);
    
    // Check that each icon is rendered with correct size
    const salaIcon = screen.getByText('🛋️');
    const dormitorioIcon = screen.getByText('🛏️');
    const comedorIcon = screen.getByText('🍽️');
    
    expect(salaIcon).toBeInTheDocument();
    expect(dormitorioIcon).toBeInTheDocument();
    expect(comedorIcon).toBeInTheDocument();
    
    // Check icons are in proper containers with text-2xl class
    expect(salaIcon).toHaveClass('text-2xl');
    expect(dormitorioIcon).toHaveClass('text-2xl');
    expect(comedorIcon).toHaveClass('text-2xl');
  });
});
