import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SpotifyTab } from '@/components/spotify/spotify-tab';
import { SpotifyTrack, spotifyService } from '@/services/spotify/spotify.service';
import { toast } from '@/hooks/use-toast';

// Mock del servicio de Spotify
jest.mock('@/services/spotify/spotify.service');
const mockSpotifyService = spotifyService as jest.Mocked<typeof spotifyService>;

// Mock del hook de toast
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

const mockToast = toast as jest.MockedFunction<typeof toast>;

// Mock de los componentes
jest.mock('@/components/spotify/spotify-player', () => ({
  SpotifyPlayer: ({ track, onTrackSelect }: any) => (
    <div data-testid="spotify-player">
      {track ? (
        <div>
          <span>Playing: {track.name}</span>
          <button onClick={() => onTrackSelect(track)}>Select Track</button>
        </div>
      ) : (
        <span>No track selected</span>
      )}
    </div>
  ),
}));

// Mock de los iconos
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
}));

describe('SpotifyTab', () => {
  const mockOnTrackSelect = jest.fn();
  
  const mockTrack: SpotifyTrack = {
    id: '1',
    name: 'Test Song',
    artists: ['Test Artist'],
    preview_url: 'https://preview.url',
    image: 'https://image.url',
    external_url: 'https://spotify.url',
  };

  const mockIntendedImpact = {
    name: 'Relajación',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpotifyService.searchTracks.mockResolvedValue({ tracks: [mockTrack] });
  });

  it('should render without crashing', () => {
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    expect(screen.getByText('Música personalizada')).toBeInTheDocument();
    expect(screen.getByTestId('spotify-player')).toBeInTheDocument();
  });

  it('should display search input and button', () => {
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    expect(searchInput).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });

  it('should display recommendations button', () => {
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const recommendationsButton = screen.getByText(/obtener recomendaciones musicales/i);
    expect(recommendationsButton).toBeInTheDocument();
  });

  it('should show different description when intendedImpact is provided', () => {
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={mockIntendedImpact}
      />
    );

    expect(screen.getByText(/relajación/i)).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    
    await user.type(searchInput, 'test song');
    
    expect(searchInput).toHaveValue('test song');
  });

  it('should call search when search button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'test');
    await user.click(searchButton);

    expect(mockSpotifyService.searchTracks).toHaveBeenCalledWith('test');
  });

  it('should load recommendations when button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={mockIntendedImpact}
      />
    );

    const recommendationsButton = screen.getByText(/obtener recomendaciones musicales/i);
    
    await user.click(recommendationsButton);

    expect(mockSpotifyService.searchTracks).toHaveBeenCalledWith('Relajación music');
  });

  it('should display loading state', async () => {
    mockSpotifyService.searchTracks.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ tracks: [mockTrack] }), 100))
    );

    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const recommendationsButton = screen.getByText(/obtener recomendaciones musicales/i);
    
    await user.click(recommendationsButton);

    expect(screen.getByText(/cargando recomendaciones/i)).toBeInTheDocument();
  });

  it('should display search results', async () => {
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const recommendationsButton = screen.getByText(/obtener recomendaciones musicales/i);
    
    await user.click(recommendationsButton);

    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });
  });

  it('should handle track selection', async () => {
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const recommendationsButton = screen.getByText(/obtener recomendaciones musicales/i);
    await user.click(recommendationsButton);

    await waitFor(() => {
      const trackElement = screen.getByText('Test Song');
      expect(trackElement).toBeInTheDocument();
    });

    const trackElement = screen.getByText('Test Song');
    await user.click(trackElement);

    // Verify the track is displayed in the player
    expect(screen.getByText('Playing: Test Song')).toBeInTheDocument();
  });

  it('should show selected track indicator', () => {
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={mockTrack}
        intendedImpact={null}
      />
    );

    // The selected track should be passed to the player
    expect(screen.getByText('Playing: Test Song')).toBeInTheDocument();
  });

  it('should handle search on Enter key press', async () => {
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    
    await user.type(searchInput, 'test');
    await user.keyboard('{Enter}');

    expect(mockSpotifyService.searchTracks).toHaveBeenCalledWith('test');
  });

  it('should display empty state when no results', async () => {
    mockSpotifyService.searchTracks.mockResolvedValue({ tracks: [] });
    
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const recommendationsButton = screen.getByText(/obtener recomendaciones musicales/i);
    await user.click(recommendationsButton);

    await waitFor(() => {
      expect(screen.getByText(/busca canciones o disfruta/i)).toBeInTheDocument();
    });
  });

  it('should handle search errors gracefully', async () => {
    mockSpotifyService.searchTracks.mockRejectedValue(new Error('Search failed'));
    
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const recommendationsButton = screen.getByText(/obtener recomendaciones musicales/i);
    await user.click(recommendationsButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "No se pudieron cargar las recomendaciones de música",
        variant: "destructive"
      });
    });
  });

  it('should show success toast when recommendations load', async () => {
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    const recommendationsButton = screen.getByText(/obtener recomendaciones musicales/i);
    await user.click(recommendationsButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Recomendaciones cargadas",
        description: "Hemos encontrado canciones que coinciden con tu estado de ánimo deseado",
      });
    });
  });

  it('should show toast when track is selected', async () => {
    const user = userEvent.setup();
    
    render(
      <SpotifyTab 
        onTrackSelect={mockOnTrackSelect}
        selectedTrack={null}
        intendedImpact={null}
      />
    );

    // Load recommendations first
    const recommendationsButton = screen.getByText(/obtener recomendaciones musicales/i);
    await user.click(recommendationsButton);

    await waitFor(() => {
      const trackElement = screen.getByText('Test Song');
      expect(trackElement).toBeInTheDocument();
    });

    // Click on track to open player
    const trackElement = screen.getByText('Test Song');
    await user.click(trackElement);

    // Now select the track from the player
    const selectButton = screen.getByText('Select Track');
    await user.click(selectButton);

    expect(mockToast).toHaveBeenCalledWith({
      title: "Canción seleccionada",
      description: "Test Artist - Test Song"
    });
    
    expect(mockOnTrackSelect).toHaveBeenCalledWith(mockTrack);
  });
});