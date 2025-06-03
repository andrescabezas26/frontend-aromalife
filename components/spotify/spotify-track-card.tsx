"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Pause, ExternalLink } from "lucide-react";
import { SpotifyTrack } from "@/services/spotify/spotify.service";

interface SpotifyTrackCardProps {
  track: SpotifyTrack;
  isSelected?: boolean;
  isPlaying?: boolean;
  onSelect: (track: SpotifyTrack) => void;
  onPlayPause?: (track: SpotifyTrack) => void;
  showPreview?: boolean;
}

export function SpotifyTrackCard({
  track,
  isSelected = false,
  isPlaying = false,
  onSelect,
  onPlayPause,
  showPreview = true,
}: SpotifyTrackCardProps) {
  const handleCardClick = () => {
    onSelect(track);
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayPause?.(track);
  };

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3">
        {/* Album Image */}
        <div className="relative w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
          {track.image ? (
            <Image
              src={track.image}
              alt={`${track.name} album cover`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Sin imagen
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{track.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {track.artists.join(", ")}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {track.preview_url && showPreview && onPlayPause && (
            <Button variant="outline" size="sm" onClick={handlePlayPause}>
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}

          <Button variant="ghost" size="sm" asChild>
            <a
              href={track.external_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Spotify Embed for tracks without preview */}
      {!track.preview_url && showPreview && (
        <div className="mt-3 pt-3 border-t">
          <iframe
            src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
