import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditPlaceForm } from '@/components/places/edit-place-form';
import { PlaceService } from '@/services/places/place.service';
import { Place } from '@/types/place';
import '@testing-library/jest-dom';

// Mock services
jest.mock('@/services/places/place.service');

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock router
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock PlaceForm component
jest.mock('@/components/places/place-form', () => ({
  PlaceForm: ({ place, onSubmit, isLoading }: any) => (
    <div data-testid="place-form">
      <div>Place Name: {place?.name}</div>
      <div>Place Icon: {place?.icon}</div>
      <button 
        onClick={() => onSubmit({ name: 'Updated Place', icon: '🏠' })}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}));

const mockPlaceService = PlaceService as jest.Mocked<typeof PlaceService>;

describe('EditPlaceForm', () => {
  const user = userEvent.setup();
  const placeId = 'place-123';

  const mockPlace: Place = {
    id: placeId,
    name: 'Test Place',
    icon: '🏠',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays place data successfully', async () => {
    mockPlaceService.getById.mockResolvedValue(mockPlace);

    render(<EditPlaceForm placeId={placeId} />);

    // Should show loading initially
    expect(screen.getByText('Cargando lugar...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('place-form')).toBeInTheDocument();
      expect(screen.getByText(`Place Name: ${mockPlace.name}`)).toBeInTheDocument();
      expect(screen.getByText(`Place Icon: ${mockPlace.icon}`)).toBeInTheDocument();
    });

    expect(mockPlaceService.getById).toHaveBeenCalledWith(placeId);
  });

  it('renders page header with title and description', async () => {
    mockPlaceService.getById.mockResolvedValue(mockPlace);

    render(<EditPlaceForm placeId={placeId} />);

    await waitFor(() => {
      expect(screen.getByText('Editar Lugar')).toBeInTheDocument();
      expect(screen.getByText('Modifica la información del lugar')).toBeInTheDocument();
    });

    // Check heading level
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Editar Lugar');
    expect(heading).toHaveClass('text-3xl', 'font-bold');
  });

  it('renders back button with correct styling', async () => {
    mockPlaceService.getById.mockResolvedValue(mockPlace);

    render(<EditPlaceForm placeId={placeId} />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: '' }); // Icon button
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveClass('h-8', 'w-8');
    });
  });

  it('navigates back when back button is clicked', async () => {
    mockPlaceService.getById.mockResolvedValue(mockPlace);

    render(<EditPlaceForm placeId={placeId} />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: '' });
      expect(backButton).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: '' });
    await user.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('handles successful form submission', async () => {
    mockPlaceService.getById.mockResolvedValue(mockPlace);
    mockPlaceService.update.mockResolvedValue(undefined);

    render(<EditPlaceForm placeId={placeId} />);

    await waitFor(() => {
      expect(screen.getByTestId('place-form')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockPlaceService.update).toHaveBeenCalledWith(placeId, {
        name: 'Updated Place',
        icon: '🏠'
      });
      expect(mockPush).toHaveBeenCalledWith('/admin/management/places');
    });
  });

  it('handles form submission errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockPlaceService.getById.mockResolvedValue(mockPlace);
    
    const apiError = {
      response: {
        data: {
          message: 'Place name already exists'
        }
      }
    };
    mockPlaceService.update.mockRejectedValue(apiError);

    render(<EditPlaceForm placeId={placeId} />);

    await waitFor(() => {
      expect(screen.getByTestId('place-form')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating place:', apiError);
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles place loading errors and redirects', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockPlaceService.getById.mockRejectedValue(new Error('Place not found'));

    render(<EditPlaceForm placeId={placeId} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/management/places');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading place:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('does not render form if place loading failed', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockPlaceService.getById.mockRejectedValue(new Error('Not found'));

    render(<EditPlaceForm placeId={placeId} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/management/places');
    });

    // Should not render the form
    expect(screen.queryByTestId('place-form')).not.toBeInTheDocument();
    expect(screen.queryByText('Editar Lugar')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('handles missing placeId gracefully', () => {
    render(<EditPlaceForm placeId="" />);

    // Should not make API call with empty placeId
    expect(mockPlaceService.getById).not.toHaveBeenCalled();
  });

  it('handles generic submission errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockPlaceService.getById.mockResolvedValue(mockPlace);
    mockPlaceService.update.mockRejectedValue(new Error('Network error'));

    render(<EditPlaceForm placeId={placeId} />);

    await waitFor(() => {
      expect(screen.getByTestId('place-form')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating place:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('passes correct props to PlaceForm component', async () => {
    mockPlaceService.getById.mockResolvedValue(mockPlace);

    render(<EditPlaceForm placeId={placeId} />);

    await waitFor(() => {
      expect(screen.getByTestId('place-form')).toBeInTheDocument();
      expect(screen.getByText(`Place Name: ${mockPlace.name}`)).toBeInTheDocument();
    });

    // Form should initially not be in loading state
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
  });
});
