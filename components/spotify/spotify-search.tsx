"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { spotifyService, SpotifyTrack } from "@/services/spotify/spotify.service"
import { useToast } from "@/hooks/use-toast"

interface SpotifySearchProps {
  onTracksFound: (tracks: SpotifyTrack[]) => void
  isLoading?: boolean
}

export function SpotifySearch({ onTracksFound, isLoading = false }: SpotifySearchProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un término de búsqueda",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    try {
      const response = await spotifyService.searchTracks(query)
      onTracksFound(response.tracks)
      
      if (response.tracks.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron canciones para tu búsqueda",
        })
      }
    } catch (error) {
      console.error("Error searching tracks:", error)
      toast({
        title: "Error",
        description: "Error al buscar canciones. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Buscar canciones en Spotify..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isLoading || isSearching}
      />
      <Button 
        onClick={handleSearch} 
        disabled={isLoading || isSearching}
      >
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
