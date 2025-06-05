import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SpotifyPlayer } from '@/components/spotify/spotify-player';
import { SpotifyTrack } from '@/services/spotify/spotify.service';

// Mock Audio API
const mockAudio = {
  play: jest.fn(),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  volume: 0.5,
  currentTime: 0,
  duration: 30,
  src: '',
  onended: null,
  onloadedmetadata: null,
  ontimeupdate: null,
};

global.Audio = jest.fn().mockImplementation(() => mockAudio);

describe('SpotifyPlayer', () => {
  const user = userEvent.setup();
  const mockOnTrackSelect = jest.fn();

  const mockTrack: SpotifyTrack = {
    id: '1',
    name: 'Test Song',
    artists: ['Test Artist'],
    preview_url: 'https://p.scdn.co/mp3-preview/test.mp3',
    image: 'https://i.scdn.co/image/test.jpg',
    external_url: 'https://open.spotify.com/track/1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAudio.play.mockReset();
    mockAudio.pause.mockReset();
  });

  it('should render without track', () => {
    render(
      <SpotifyPlayer
        track={null}
        onTrackSelect={mockOnTrackSelect}
      />
    );

    const selectTrackElements = screen.getAllByText((content) => 
      content.includes('Selecciona') && content.includes('canción')
    );
    expect(selectTrackElements.length).toBeGreaterThan(0);
    expect(selectTrackElements[0]).toBeInTheDocument();
  });
  it('should create audio element when track has preview_url', () => {
    render(
      <SpotifyPlayer
        track={mockTrack}
        onTrackSelect={mockOnTrackSelect}
      />
    );

    expect(global.Audio).toHaveBeenCalledWith('https://p.scdn.co/mp3-preview/test.mp3');
  });

  it('should render select button', () => {
    render(
      <SpotifyPlayer
        track={mockTrack}
        onTrackSelect={mockOnTrackSelect}
      />
    );

    const selectButton = screen.getByRole('button', { name: /seleccionar/i });
    expect(selectButton).toBeInTheDocument();
    expect(selectButton).toHaveTextContent('✓ Seleccionar esta canción');
  });

  it('should not create audio element when track has no preview_url', () => {
    const trackWithoutPreview = {
      ...mockTrack,
      preview_url: null,
    };

    render(
      <SpotifyPlayer
        track={trackWithoutPreview}
        onTrackSelect={mockOnTrackSelect}
      />
    );

    expect(global.Audio).not.toHaveBeenCalled();
  });

  it('should handle track selection', async () => {
    render(
      <SpotifyPlayer
        track={mockTrack}
        onTrackSelect={mockOnTrackSelect}
      />
    );

    const selectButton = screen.getByRole('button', { name: /seleccionar/i });
    await user.click(selectButton);

    expect(mockOnTrackSelect).toHaveBeenCalledWith(mockTrack);
  });
  it('should apply custom className', () => {
    const { container } = render(
      <SpotifyPlayer
        track={mockTrack}
        onTrackSelect={mockOnTrackSelect}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle error in audio playback', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <SpotifyPlayer
        track={mockTrack}
        onTrackSelect={mockOnTrackSelect}
      />
    );

    // Simulate audio error
    const errorCallback = mockAudio.addEventListener.mock.calls.find(call => call[0] === 'error')?.[1];
    if (errorCallback) {
      errorCallback(new Error('Audio error'));
    }

    consoleErrorSpy.mockRestore();
  });

  it('should cleanup audio on unmount', () => {
    const { unmount } = render(
      <SpotifyPlayer
        track={mockTrack}
        onTrackSelect={mockOnTrackSelect}
      />
    );

    unmount();

    expect(mockAudio.pause).toHaveBeenCalled();
    expect(mockAudio.src).toBe('');
    expect(mockAudio.load).toHaveBeenCalled();
  });
});
