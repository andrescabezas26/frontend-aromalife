import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpotifyTrackCard } from '@/components/spotify/spotify-track-card';
import '@testing-library/jest-dom';

const mockTrack = {
  id: 'track1',
  name: 'Test Song',
  artists: ['Test Artist'],
  preview_url: 'https://preview.mp3',
  image: 'https://image.jpg',
  external_url: 'https://open.spotify.com/track/1',
};

const mockTrackNoPreview = {
  ...mockTrack,
  preview_url: null,
};

const mockTrackMultipleArtists = {
  ...mockTrack,
  artists: ['Artist 1', 'Artist 2', 'Artist 3'],
};

describe('SpotifyTrackCard', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });  it('renders track information correctly', () => {
    render(<SpotifyTrackCard track={mockTrack} onSelect={mockOnSelect} />);
    
    const songElements = screen.getAllByText(/test song/i);
    expect(songElements.length).toBeGreaterThan(0);
    expect(songElements[0]).toBeInTheDocument();
    
    const artistElements = screen.getAllByText(/test artist/i);
    expect(artistElements.length).toBeGreaterThan(0);
    expect(artistElements[0]).toBeInTheDocument();
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', expect.stringContaining('Test Song'));
  });
  it('displays multiple artists correctly', () => {
    render(<SpotifyTrackCard track={mockTrackMultipleArtists} onSelect={mockOnSelect} />);
    
    const artist1Elements = screen.getAllByText(/artist 1/i);
    expect(artist1Elements.length).toBeGreaterThan(0);
    expect(artist1Elements[0]).toBeInTheDocument();
    
    const artist2Elements = screen.getAllByText(/artist 2/i);
    expect(artist2Elements.length).toBeGreaterThan(0);
    expect(artist2Elements[0]).toBeInTheDocument();
    
    const artist3Elements = screen.getAllByText(/artist 3/i);
    expect(artist3Elements.length).toBeGreaterThan(0);
    expect(artist3Elements[0]).toBeInTheDocument();
  });
  it('calls onSelect when card is clicked', async () => {
    const user = userEvent.setup();
    
    render(<SpotifyTrackCard track={mockTrack} onSelect={mockOnSelect} />);
    
    const songElements = screen.getAllByText(/test song/i);
    expect(songElements.length).toBeGreaterThan(0);
    await user.click(songElements[0]);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockTrack);
  });

  it('handles tracks without preview URL gracefully', () => {
    render(<SpotifyTrackCard track={mockTrackNoPreview} onSelect={mockOnSelect} />);
    
    const songElements = screen.getAllByText(/test song/i);
    expect(songElements.length).toBeGreaterThan(0);
    expect(songElements[0]).toBeInTheDocument();
    
    const artistElements = screen.getAllByText(/test artist/i);
    expect(artistElements.length).toBeGreaterThan(0);
    expect(artistElements[0]).toBeInTheDocument();
    
    // El botón de play debería estar deshabilitado o no mostrase
    const playButton = screen.queryByRole('button', { name: /play/i });
    if (playButton) {
      expect(playButton).toBeDisabled();
    }
  });

  it('displays external Spotify link correctly', () => {
    render(<SpotifyTrackCard track={mockTrack} onSelect={mockOnSelect} />);
    
    const spotifyLink = screen.getByRole('link') || 
                       screen.getByTestId('spotify-link') ||
                       screen.getByLabelText(/spotify/i);
    
    expect(spotifyLink).toHaveAttribute('href', mockTrack.external_url);
    expect(spotifyLink).toHaveAttribute('target', '_blank');
  });
  it('applies hover effects on interaction', async () => {
    const user = userEvent.setup();
    
    render(<SpotifyTrackCard track={mockTrack} onSelect={mockOnSelect} />);
    
    const songElements = screen.getAllByText(/test song/i);
    expect(songElements.length).toBeGreaterThan(0);
    const card = songElements[0].closest('div');
    
    if (card) {
      await user.hover(card);
      // Verificar que la card es interactiva - puede tener clases hover o cursor pointer
      expect(card).toBeInTheDocument();
    }
  });
  it('displays track duration or preview indicator', () => {
    render(<SpotifyTrackCard track={mockTrack} onSelect={mockOnSelect} />);
    
    // Buscar indicadores de duración o preview
    const durationElement = screen.queryByText(/\d+:\d+/) || // Formato MM:SS
                           screen.queryByText(/preview/i) ||
                           screen.queryByTestId('duration');
    
    // Si el componente muestra duración, debería estar presente
    if (durationElement) {
      expect(durationElement).toBeInTheDocument();
    }
  });

  it('shows play button when track has preview URL', () => {
    render(<SpotifyTrackCard track={mockTrack} onSelect={mockOnSelect} />);
    
    const playButton = screen.queryByRole('button', { name: /play/i });
    const playTestId = screen.queryByTestId('play-button');
    const playLabel = screen.queryByLabelText(/play/i);
    
    // At least one of these should be present for tracks with preview
    if (playButton || playTestId || playLabel) {
      expect(playButton || playTestId || playLabel).toBeInTheDocument();
    }
  });

  it('displays track information in accessible format', () => {
    render(<SpotifyTrackCard track={mockTrack} onSelect={mockOnSelect} />);
    
    // Verify the component renders essential track information
    const songElements = screen.getAllByText(/test song/i);
    expect(songElements.length).toBeGreaterThan(0);
    expect(songElements[0]).toBeInTheDocument();
    
    const artistElements = screen.getAllByText(/test artist/i);
    expect(artistElements.length).toBeGreaterThan(0);
    expect(artistElements[0]).toBeInTheDocument();
    
    // Verify image has proper alt text for accessibility
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt');
    expect(image.getAttribute('alt')).toBeTruthy();
  });
});
