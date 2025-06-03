"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { SpotifyPlayer } from "@/components/spotify/spotify-player"
import { SpotifyTrack, spotifyService } from "@/services/spotify/spotify.service"

interface SpotifyTabProps {
  onTrackSelect: (track: SpotifyTrack) => void
  selectedTrack: SpotifyTrack | null
  intendedImpact?: { name: string } | null
}

export function SpotifyTab({ onTrackSelect, selectedTrack, intendedImpact }: SpotifyTabProps) {
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(selectedTrack)
  const [searchQuery, setSearchQuery] = useState("")

  const loadRecommendations = async () => {
    try {
      setIsLoading(true)
      let query = "musica relajada"
      
      if (intendedImpact?.name) {
        query = `${intendedImpact.name} music`
      }
      
      const response = await spotifyService.searchTracks(query)
      setSearchResults(response.tracks)

      toast({
        title: "Recomendaciones cargadas",
        description: "Hemos encontrado canciones que coinciden con tu estado de ánimo deseado",
      })
    } catch (error) {
      console.error('Error loading Spotify recommendations:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las recomendaciones de música",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      const response = await spotifyService.searchTracks(searchQuery)
      setSearchResults(response.tracks)
      
      if (response.tracks.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron canciones con esa búsqueda"
        })
      }
    } catch (error) {
      console.error('Error searching Spotify:', error)
      toast({
        title: "Error",
        description: "Error al buscar en Spotify",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrackClick = (track: SpotifyTrack) => {
    setCurrentTrack(track)
  }

  const handleTrackSelect = (track: SpotifyTrack) => {
    onTrackSelect(track)
    toast({
      title: "Canción seleccionada",
      description: `${track.artists[0]} - ${track.name}`
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Música personalizada</h3>
            <p className="text-sm text-muted-foreground">
              {intendedImpact?.name 
                ? `Podemos recomendarte música que te ayude a sentir ${intendedImpact.name.toLowerCase()}. Haz clic en el botón para descubrir canciones seleccionadas especialmente para ti.`
                : "Podemos recomendarte música relajante que combine con tu vela. Haz clic en el botón para descubrir nuestra selección."
              }
            </p>
          </div>

          {/* Search Component */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar canciones en Spotify..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button 
              variant="default"
              onClick={loadRecommendations}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cargando recomendaciones...
                </>
              ) : (
                <>
                  ✨ Obtener recomendaciones musicales
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {searchResults.length > 0 ? 'Resultados de búsqueda' : 'Recomendaciones'}
              </h3>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Cargando...
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((track) => (
                    <div
                      key={track.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTrack?.id === track.id
                          ? 'border-primary bg-primary/5'
                          : currentTrack?.id === track.id
                          ? 'border-primary/50 bg-primary/2'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleTrackClick(track)}
                    >
                      <div className="flex items-center gap-3">
                        {track.image && (
                          <img
                            src={track.image}
                            alt={`Album artwork for ${track.name}`}
                            width={48}
                            height={48}
                            className="rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {track.artists.join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {track.preview_url ? 'Vista previa disponible' : 'Solo en Spotify'}
                          </p>
                        </div>
                        {selectedTrack?.id === track.id && (
                          <div className="flex items-center gap-1 text-xs text-primary font-medium">
                            ✓ Seleccionada
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Busca canciones o disfruta de nuestras recomendaciones
                  </div>
                )}
              </div>
            </div>

            {/* Player */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Reproductor</h3>
              <SpotifyPlayer
                track={currentTrack}
                onTrackSelect={handleTrackSelect}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
