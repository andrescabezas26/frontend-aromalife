import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpotifySearch } from '@/components/spotify/spotify-search';
import { spotifyService, SpotifyTrack } from '@/services/spotify/spotify.service';
import '@testing-library/jest-dom';

// Mock del servicio de Spotify
jest.mock('@/services/spotify/spotify.service');
const mockSpotifyService = spotifyService as jest.Mocked<typeof spotifyService>;

// Mock del hook de toast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de los iconos
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
}));

const mockTracks: SpotifyTrack[] = [
  {
    id: 'track1',
    name: 'Test Song 1',
    artists: [{ name: 'Artist 1' }],
    preview_url: 'https://preview1.mp3',
    image: 'https://image1.jpg',
    external_url: 'https://open.spotify.com/track/1',
  },
  {
    id: 'track2',
    name: 'Test Song 2',
    artists: [{ name: 'Artist 2' }],
    preview_url: 'https://preview2.mp3',
    image: 'https://image2.jpg',
    external_url: 'https://open.spotify.com/track/2',
  },
];

describe('SpotifySearch', () => {
  const mockOnTracksFound = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpotifyService.searchTracks.mockReset();
  });
  it('renders search input and button correctly', () => {
    render(<SpotifySearch onTracksFound={mockOnTracksFound} />);
    
    expect(screen.getByPlaceholderText(/buscar canciones en spotify/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('calls spotifyService.searchTracks and onTracksFound when search is successful', async () => {
    mockSpotifyService.searchTracks.mockResolvedValue({ tracks: mockTracks });
    const user = userEvent.setup();
    
    render(<SpotifySearch onTracksFound={mockOnTracksFound} />);
    
    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    const searchButton = screen.getByRole('button');
    
    await user.type(searchInput, 'test query');
    await user.click(searchButton);
    
    expect(mockSpotifyService.searchTracks).toHaveBeenCalledWith('test query');
    expect(mockOnTracksFound).toHaveBeenCalledWith(mockTracks);
  });

  it('triggers search on Enter key press', async () => {
    mockSpotifyService.searchTracks.mockResolvedValue({ tracks: mockTracks });
    const user = userEvent.setup();
    
    render(<SpotifySearch onTracksFound={mockOnTracksFound} />);
    
    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    
    await user.type(searchInput, 'test query');
    await user.keyboard('{Enter}');
    
    expect(mockSpotifyService.searchTracks).toHaveBeenCalledWith('test query');
    expect(mockOnTracksFound).toHaveBeenCalledWith(mockTracks);
  });

  it('shows loading state during search', async () => {
    mockSpotifyService.searchTracks.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ tracks: mockTracks }), 100))
    );
    const user = userEvent.setup();
    
    render(<SpotifySearch onTracksFound={mockOnTracksFound} />);
    
    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    const searchButton = screen.getByRole('button');
    
    await user.type(searchInput, 'test query');
    await user.click(searchButton);
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(searchButton).toBeDisabled();
    expect(searchInput).toBeDisabled();
  });

  it('shows error toast when search query is empty', async () => {
    const user = userEvent.setup();
    
    render(<SpotifySearch onTracksFound={mockOnTracksFound} />);
    
    const searchButton = screen.getByRole('button');
    await user.click(searchButton);
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Por favor ingresa un término de búsqueda",
      variant: "destructive",
    });
    expect(mockSpotifyService.searchTracks).not.toHaveBeenCalled();
  });

  it('shows error toast when search query contains only whitespace', async () => {
    const user = userEvent.setup();
    
    render(<SpotifySearch onTracksFound={mockOnTracksFound} />);
    
    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    const searchButton = screen.getByRole('button');
    
    await user.type(searchInput, '   ');
    await user.click(searchButton);
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Por favor ingresa un término de búsqueda",
      variant: "destructive",
    });
    expect(mockSpotifyService.searchTracks).not.toHaveBeenCalled();
  });

  it('shows error toast when search fails', async () => {
    mockSpotifyService.searchTracks.mockRejectedValue(new Error('Search failed'));
    const user = userEvent.setup();
    
    render(<SpotifySearch onTracksFound={mockOnTracksFound} />);
    
    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    const searchButton = screen.getByRole('button');
    
    await user.type(searchInput, 'test query');
    await user.click(searchButton);
    
    await screen.findByTestId('search-icon'); // Wait for loading to complete
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Error al buscar canciones. Inténtalo de nuevo.",
      variant: "destructive",
    });
  });

  it('shows no results toast when search returns empty array', async () => {
    mockSpotifyService.searchTracks.mockResolvedValue({ tracks: [] });
    const user = userEvent.setup();
    
    render(<SpotifySearch onTracksFound={mockOnTracksFound} />);
    
    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    const searchButton = screen.getByRole('button');
    
    await user.type(searchInput, 'nonexistent song');
    await user.click(searchButton);
    
    await screen.findByTestId('search-icon'); // Wait for loading to complete
    
    expect(mockOnTracksFound).toHaveBeenCalledWith([]);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Sin resultados",
      description: "No se encontraron canciones para tu búsqueda",
    });
  });

  it('disables input and button when isLoading prop is true', () => {
    render(<SpotifySearch onTracksFound={mockOnTracksFound} isLoading={true} />);
    
    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    const searchButton = screen.getByRole('button');
    
    expect(searchInput).toBeDisabled();
    expect(searchButton).toBeDisabled();
  });

  it('enables input and button when isLoading prop is false', () => {
    render(<SpotifySearch onTracksFound={mockOnTracksFound} isLoading={false} />);
    
    const searchInput = screen.getByPlaceholderText(/buscar canciones en spotify/i);
    const searchButton = screen.getByRole('button');
    
    expect(searchInput).not.toBeDisabled();
    expect(searchButton).not.toBeDisabled();
  });
});
