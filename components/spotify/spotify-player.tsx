"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { SpotifyTrack } from "@/services/spotify/spotify.service";

interface SpotifyPlayerProps {
  track: SpotifyTrack | null;
  onTrackSelect: (track: SpotifyTrack) => void;
  className?: string;
}

export function SpotifyPlayer({
  track,
  onTrackSelect,
  className = "",
}: SpotifyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element when track changes
  useEffect(() => {
    if (track?.preview_url) {
      // Cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }

      // Create new audio element
      const audio = new Audio(track.preview_url);
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (timeUpdateInterval.current) {
          clearInterval(timeUpdateInterval.current);
        }
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        setCurrentTime(0);
        if (timeUpdateInterval.current) {
          clearInterval(timeUpdateInterval.current);
        }
      });

      // Reset state
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    } else {
      // Cleanup if no preview URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [track?.id, track?.preview_url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, []);

  // Update volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current || !track?.preview_url) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (timeUpdateInterval.current) {
          clearInterval(timeUpdateInterval.current);
        }
      } else {
        await audioRef.current.play();
        setIsPlaying(true);

        // Start time update interval
        timeUpdateInterval.current = setInterval(() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      setIsPlaying(false);
    }
  }, [isPlaying, track?.preview_url]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    setIsMuted(false);
  };

  if (!track) {
    return (
      <div
        className={`p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg text-center border-2 border-dashed border-gray-300 ${className}`}
      >
        <div className="space-y-3">
          <div className="text-4xl">🎵</div>
          <p className="text-lg font-medium text-gray-700">
            Selecciona una canción
          </p>
          <p className="text-sm text-muted-foreground">
            Haz clic en una canción de la lista para reproducirla aquí
          </p>
        </div>
      </div>
    );
  }

  if (!track.preview_url) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Solo el iframe de Spotify */}
        <iframe
          src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
          width="100%"
          height="380"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-lg shadow-sm"
        />

        {/* Select button */}
        <Button
          onClick={() => onTrackSelect(track)}
          variant="default"
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          ✓ Seleccionar esta canción
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Iframe de Spotify - Principal */}
      <iframe
        src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
        width="100%"
        height="380"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg shadow-sm"
      />

      {/* Select button */}
      <Button
        onClick={() => onTrackSelect(track)}
        variant="default"
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        ✓ Seleccionar esta canción
      </Button>
    </div>
  );
}
