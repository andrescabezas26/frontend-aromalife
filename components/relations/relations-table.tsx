import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MainOption } from "@/types/main-option"
import { IntendedImpact } from "@/types/intended-impact"
import { Aroma } from "@/types/aroma"
import { Place } from "@/types/place"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { IntendedImpactService } from "@/services/intended-impacts/intended-impact.service"
import { AromaService } from "@/services/aromas/aroma.service"

interface RelationsTableProps {
  mainOptions: MainOption[]
  intendedImpacts: IntendedImpact[]
  aromas: Aroma[]
  places: Place[]
  mainOptionIntendedImpacts: { mainOptionId: string; intendedImpactIds: string[] }[]
  intendedImpactAromas: { intendedImpactId: string; aromaIds: string[] }[]
  placeIntendedImpacts: { placeId: string; intendedImpactIds: string[] }[]
  onUpdate: (intendedImpactId: string, aromaIds: string[]) => Promise<void>
}

export function RelationsTable({
  mainOptions,
  intendedImpacts,
  aromas,
  places,
  mainOptionIntendedImpacts,
  intendedImpactAromas,
  placeIntendedImpacts,
  onUpdate
}: RelationsTableProps) {
  const router = useRouter()
  const [selectedMainOptionId, setSelectedMainOptionId] = useState<string | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null) // Changed from array to single selection
  const [selectedIntendedImpactId, setSelectedIntendedImpactId] = useState<string | null>(null)
  const [selectedAromaIds, setSelectedAromaIds] = useState<string[]>([])
  const [originalSelectedAromaIds, setOriginalSelectedAromaIds] = useState<string[]>([])
  
    // Dynamic data state for fetched intended impacts and aromas
  const [dynamicIntendedImpacts, setDynamicIntendedImpacts] = useState<IntendedImpact[]>([])
  const [dynamicAromas, setDynamicAromas] = useState<Aroma[]>([])
  const [isLoadingIntendedImpacts, setIsLoadingIntendedImpacts] = useState(false)
  const [isLoadingAromas, setIsLoadingAromas] = useState(false)
  
  // Function to get related aromas from backend API call
  const [relatedAromasFromBackend, setRelatedAromasFromBackend] = useState<Aroma[]>([])
  
  // Track which main options have intended impacts available from backend
  const [mainOptionsWithIntendedImpacts, setMainOptionsWithIntendedImpacts] = useState<Set<string>>(new Set())
  
  // Track which places have intended impacts available from backend
  const [placesWithIntendedImpacts, setPlacesWithIntendedImpacts] = useState<Set<string>>(new Set())
  
  // Track which intended impacts have relations with any main option from backend
  const [intendedImpactsWithMainOptions, setIntendedImpactsWithMainOptions] = useState<Set<string>>(new Set())
  
  // Update aroma selection when dynamic aromas change (after a successful update)
  useEffect(() => {
    if (selectedIntendedImpactId && relatedAromasFromBackend.length > 0) {
      // Set only the related aromas from backend as selected
      const relatedAromaIds = relatedAromasFromBackend.map(aroma => aroma.id!).filter(Boolean)
      setSelectedAromaIds([...relatedAromaIds])
      setOriginalSelectedAromaIds([...relatedAromaIds])
    }
  }, [relatedAromasFromBackend, selectedIntendedImpactId])
  
  // Check which main options have intended impacts available on component mount
  useEffect(() => {
    const checkMainOptionsForIntendedImpacts = async () => {
      const mainOptionsWithIntendedImpactsSet = new Set<string>()
      
      for (const mainOption of mainOptions) {
        const isDecoratOption = mainOption.name === "Decorar espacios"
        
        if (isDecoratOption) {
          // For "Decorar espacios", always mark as having relations since it works through places
          // It doesn't need static relations in mainOptionIntendedImpacts to be functional
          mainOptionsWithIntendedImpactsSet.add(mainOption.id!)
        } else {
          // For other options, check backend
          try {
            const fetchedIntendedImpacts = await IntendedImpactService.getByMainOption(mainOption.id!)
            if (fetchedIntendedImpacts.length > 0) {
              mainOptionsWithIntendedImpactsSet.add(mainOption.id!)
            }
          } catch (error) {
            // If there's an error, we assume no intended impacts
            console.error(`Error checking intended impacts for main option ${mainOption.id}:`, error)
          }
        }
      }
      
      setMainOptionsWithIntendedImpacts(mainOptionsWithIntendedImpactsSet)
    }
    
    const checkPlacesForIntendedImpacts = async () => {
      const placesWithIntendedImpactsSet = new Set<string>()
      
      // Find the "Decorar espacios" main option
      const decorarEspaciosOption = mainOptions.find(option => option.name === "Decorar espacios")
      
      if (decorarEspaciosOption) {
        for (const place of places) {
          try {
            // Check if this place has intended impacts when combined with "Decorar espacios"
            const fetchedIntendedImpacts = await IntendedImpactService.getByMainOption(decorarEspaciosOption.id!, place.id!)
            if (fetchedIntendedImpacts.length > 0) {
              placesWithIntendedImpactsSet.add(place.id!)
            }
          } catch (error) {
            // If there's an error, we assume no intended impacts
            console.error(`Error checking intended impacts for place ${place.id}:`, error)
          }
        }
      }
      
      setPlacesWithIntendedImpacts(placesWithIntendedImpactsSet)
    }
    
    const checkIntendedImpactsForMainOptions = async () => {
      const intendedImpactsWithMainOptionsSet = new Set<string>()
      
      for (const impact of intendedImpacts) {
        try {
          // Check if this intended impact has any relations with main options
          const mainOptionRelations = mainOptionIntendedImpacts.find(rel => rel.intendedImpactIds.includes(impact.id!))
          if (mainOptionRelations) {
            intendedImpactsWithMainOptionsSet.add(impact.id!)
          }
        } catch (error) {
          console.error(`Error checking relations for intended impact ${impact.id}:`, error)
        }
      }
      
      setIntendedImpactsWithMainOptions(intendedImpactsWithMainOptionsSet)
    }
    
    if (mainOptions.length > 0) {
      checkMainOptionsForIntendedImpacts()
    }
    
    if (places.length > 0 && mainOptions.length > 0) {
      checkPlacesForIntendedImpacts()
    }
    
    if (intendedImpacts.length > 0) {
      checkIntendedImpactsForMainOptions()
    }
  }, [mainOptions, mainOptionIntendedImpacts, places, intendedImpacts])
  
  // Is the current selection the "Decorar espacios" option?
  const isDecorateOption = mainOptions.find(option => option.id === selectedMainOptionId)?.name === "Decorar espacios"
  
  // Handle main option selection
  const handleMainOptionSelect = async (mainOptionId: string) => {
    console.log("Selecting main option:", mainOptionId)
    const selectedOption = mainOptions.find(option => option.id === mainOptionId)
    console.log("Selected option name:", selectedOption?.name)
    
    setSelectedMainOptionId(mainOptionId)
    setSelectedPlaceId(null) // Reset place selection
    setSelectedIntendedImpactId(null)
    setSelectedAromaIds([])
    setOriginalSelectedAromaIds([])
    setDynamicAromas([]) // Clear dynamic aromas
    
    // Check if this is the "Decorar espacios" option
    const isDecorateOption = selectedOption?.name === "Decorar espacios"
    
    if (!isDecorateOption) {
      // For non-"Decorar espacios" options, fetch intended impacts from backend
      setIsLoadingIntendedImpacts(true)
      try {
        const fetchedIntendedImpacts = await IntendedImpactService.getByMainOption(mainOptionId)
        console.log("Fetched intended impacts:", fetchedIntendedImpacts)
        setDynamicIntendedImpacts(fetchedIntendedImpacts)
        
        // Track if this main option has intended impacts
        setMainOptionsWithIntendedImpacts(prev => {
          const newSet = new Set(prev)
          if (fetchedIntendedImpacts.length > 0) {
            newSet.add(mainOptionId)
          } else {
            newSet.delete(mainOptionId)
          }
          return newSet
        })
      } catch (error) {
        console.error("Error fetching intended impacts:", error)
        setDynamicIntendedImpacts([])
        
        // Mark this main option as having no intended impacts
        setMainOptionsWithIntendedImpacts(prev => {
          const newSet = new Set(prev)
          newSet.delete(mainOptionId)
          return newSet
        })
      } finally {
        setIsLoadingIntendedImpacts(false)
      }
    } else {
      // For "Decorar espacios", clear dynamic intended impacts
      setDynamicIntendedImpacts([])
    }
  }
  
  // Handle place selection (for "Decorar espacios" flow)
  const handlePlaceSelect = async (placeId: string) => {
    console.log("Selecting place:", placeId)
    setSelectedPlaceId(placeId)
    setSelectedIntendedImpactId(null) // Reset intended impact selection
    setSelectedAromaIds([])
    setOriginalSelectedAromaIds([])
    setDynamicAromas([]) // Clear dynamic aromas
    
    // For "Decorar espacios" flow, fetch intended impacts filtered by main option and place
    if (selectedMainOptionId) {
      setIsLoadingIntendedImpacts(true)
      try {
        const fetchedIntendedImpacts = await IntendedImpactService.getByMainOption(selectedMainOptionId, placeId)
        console.log("Fetched intended impacts for place:", fetchedIntendedImpacts)
        setDynamicIntendedImpacts(fetchedIntendedImpacts)
      } catch (error) {
        console.error("Error fetching intended impacts for place:", error)
        setDynamicIntendedImpacts([])
      } finally {
        setIsLoadingIntendedImpacts(false)
      }
    }
  }
  
  // Handle intended impact selection
  const handleIntendedImpactSelect = async (intendedImpactId: string) => {
    setSelectedIntendedImpactId(intendedImpactId)
    
    // Fetch aromas for this intended impact from backend
    setIsLoadingAromas(true)
    try {
      const fetchedAromas = await AromaService.getAromasByIntendedImpact(intendedImpactId)
      console.log("Fetched aromas for intended impact:", fetchedAromas)
      
      // Store the related aromas from backend
      setRelatedAromasFromBackend(fetchedAromas)
      
      // Show all available aromas
      setDynamicAromas(aromas)
      
      // Set only the related aromas as selected
      const relatedAromaIds = fetchedAromas.map(aroma => aroma.id!).filter(Boolean)
      setSelectedAromaIds([...relatedAromaIds])
      setOriginalSelectedAromaIds([...relatedAromaIds])
    } catch (error) {
      console.error("Error fetching aromas:", error)
      // Even if there's an error, show all aromas so user can assign new ones
      setRelatedAromasFromBackend([])
      setDynamicAromas(aromas)
      setSelectedAromaIds([])
      setOriginalSelectedAromaIds([])
    } finally {
      setIsLoadingAromas(false)
    }
  }
  
  // Handle aroma selection/deselection
  const handleAromaToggle = (aromaId: string) => {
    setSelectedAromaIds(prev => {
      if (prev.includes(aromaId)) {
        return prev.filter(id => id !== aromaId)
      } else {
        return [...prev, aromaId]
      }
    })
  }
  
  // Check if there are changes to save
  const hasChanges = () => {
    if (!selectedIntendedImpactId) return false
    
    // Compare current selection with original
    if (selectedAromaIds.length !== originalSelectedAromaIds.length) return true
    
    // Check if all selected aromas are in the original selection
    const hasNewAromas = selectedAromaIds.some(id => !originalSelectedAromaIds.includes(id))
    const hasRemovedAromas = originalSelectedAromaIds.some(id => !selectedAromaIds.includes(id))
    
    return hasNewAromas || hasRemovedAromas
  }
  
  // Handle update (save changes)
  const handleUpdate = async () => {
    if (!selectedIntendedImpactId) return
    
    try {
      await onUpdate(selectedIntendedImpactId, selectedAromaIds)
      
      // Refresh the aromas after successful update
      console.log("Relations updated successfully, refreshing aromas...")
      
      // Re-fetch the aromas for the current intended impact to get the updated relations
      setIsLoadingAromas(true)
      try {
        const refreshedAromas = await AromaService.getAromasByIntendedImpact(selectedIntendedImpactId)
        console.log("Refreshed aromas after update:", refreshedAromas)
        
        // Update the related aromas from backend with fresh data
        setRelatedAromasFromBackend(refreshedAromas)
        
        // Update the selected aromas to match the fresh backend data
        const refreshedAromaIds = refreshedAromas.map(aroma => aroma.id!).filter(Boolean)
        setSelectedAromaIds([...refreshedAromaIds])
        setOriginalSelectedAromaIds([...refreshedAromaIds])
        
        console.log("Aromas refreshed successfully after update")
      } catch (refreshError) {
        console.error("Error refreshing aromas after update:", refreshError)
        // If refresh fails, at least update the original selection to current selection
        setOriginalSelectedAromaIds([...selectedAromaIds])
      } finally {
        setIsLoadingAromas(false)
      }
      
    } catch (error) {
      console.error("Error updating relations:", error)
    }
  }
  
  // Handle cancel (revert changes)
  const handleCancel = () => {
    setSelectedAromaIds([...originalSelectedAromaIds])
  }
  
  // Filter intended impacts based on selected main option and place (if applicable)
  const filteredIntendedImpacts = selectedMainOptionId
    ? (() => {      
        if (isDecorateOption) {
          // For "Decorar espacios" flow: show all intended impacts only after place is selected
          if (selectedPlaceId) {
            console.log("Using all intended impacts for decorate option, marking related ones")
            return intendedImpacts // Show ALL intended impacts
          } else {
            // No place selected yet for "Decorar espacios"
            return []
          }
        } else {
          return intendedImpacts // Show ALL intended impacts
        }
      })()
    : []

  // Get the intended impacts that are actually related to the current selection
  const getRelatedIntendedImpacts = () => {
    if (!selectedMainOptionId) return []
    
    if (isDecorateOption && selectedPlaceId) {
      return dynamicIntendedImpacts
    } else if (!isDecorateOption) {
      return dynamicIntendedImpacts
    }
    return []
  }

  const relatedIntendedImpacts = getRelatedIntendedImpacts()

  // Function to check if an intended impact is related (has a relationship)
  const isIntendedImpactRelated = (intendedImpactId: string) => {
    if (!selectedMainOptionId) return false
    
    if (isDecorateOption && selectedPlaceId) {
      // For "Decorar espacios" with place selected, check dynamic intended impacts
      return relatedIntendedImpacts.some(impact => impact.id === intendedImpactId)
    } else if (!isDecorateOption) {
      // For non-"Decorar espacios" options, check dynamic intended impacts
      return relatedIntendedImpacts.some(impact => impact.id === intendedImpactId)
    } else {
      // For "Decorar espacios" without place selected, no intended impacts are related yet
      return false
    }
  }

  // Function to check if an aroma is related (has a relationship) 
  const isAromaRelated = (aromaId: string) => {
    if (!selectedIntendedImpactId) return false
    
    // Check if this aroma is in the related aromas fetched from backend
    return relatedAromasFromBackend.some(aroma => aroma.id === aromaId)
  }

  // Function to check if an aroma has any relation with any intended impact
  const aromaHasAnyRelation = (aromaId: string) => {
    // Check if this aroma appears in any intendedImpactAromas relation
    return intendedImpactAromas.some(relation => relation.aromaIds.includes(aromaId))
  }
  
  // Determine if a main option has any related intended impacts
  const mainOptionHasRelations = (mainOptionId: string) => {
    // Simply check if this main option is in our tracked set
    return mainOptionsWithIntendedImpacts.has(mainOptionId)
  }
  
  // Determine if a place has any related intended impacts
  const placeHasRelations = (placeId: string) => {
    // Check if this place is in our tracked set (has intended impacts available)
    return placesWithIntendedImpacts.has(placeId)
  }
  
  // Determine if an intended impact has any related aromas
  const intendedImpactHasRelations = (intendedImpactId: string) => {
    // Check if there are any aromas related to this intended impact in the static relations
    const relations = intendedImpactAromas.find(rel => rel.intendedImpactId === intendedImpactId)
    return relations && relations.aromaIds.length > 0
  }
  
  // Determine intended impact color state: orange, black, or gray
  const getIntendedImpactColorState = (intendedImpactId: string) => {
    // Check if this intended impact has relations with any main option
    const hasRelationsWithAnyMainOption = intendedImpactsWithMainOptions.has(intendedImpactId)
    
    if (!hasRelationsWithAnyMainOption) {
      // Orange: intended impacts that have no relation with any main-option
      return 'orange'
    }
    
    // Check if it's related to the currently selected main option
    const isRelatedToCurrentSelection = isIntendedImpactRelated(intendedImpactId)
    
    if (isRelatedToCurrentSelection) {
      // Black: intended impacts that are related to the currently selected main-option
      return 'black'
    }
    
    // Gray: intended impacts that have relations but not with the currently selected main-option
    return 'gray'
  }
  
  // Check if an intended impact should be clickable
  const isIntendedImpactClickable = (intendedImpactId: string) => {
    const colorState = getIntendedImpactColorState(intendedImpactId)
    // Gray items should not be clickable since they don't belong to the selected main-option's flow
    return colorState !== 'gray'
  }
  
  // Sort main options: items with relations (black) first, then items without relations (orange)
  const sortedMainOptions = [...mainOptions].sort((a, b) => {
    const aHasRelations = mainOptionHasRelations(a.id!)
    const bHasRelations = mainOptionHasRelations(b.id!)
    
    // Items with relations come first (true = 1, false = 0, so we reverse the comparison)
    if (aHasRelations && !bHasRelations) return -1
    if (!aHasRelations && bHasRelations) return 1
    return 0 // Keep original order for items with same relation status
  })
  
  // Sort places: items with relations (black) first, then items without relations (orange)
  const sortedPlaces = [...places].sort((a, b) => {
    const aHasRelations = placeHasRelations(a.id!)
    const bHasRelations = placeHasRelations(b.id!)
    
    if (aHasRelations && !bHasRelations) return -1
    if (!aHasRelations && bHasRelations) return 1
    return 0
  })
  
  // Sort intended impacts: related items (black) first, then non-related items (orange)
  const sortedFilteredIntendedImpacts = [...filteredIntendedImpacts].sort((a, b) => {
    const aIsRelated = isIntendedImpactRelated(a.id!)
    const bIsRelated = isIntendedImpactRelated(b.id!)
    
    if (aIsRelated && !bIsRelated) return -1
    if (!aIsRelated && bIsRelated) return 1
    return 0
  })
  
  // Sort aromas: items related to current intended impact (black) first, then items without any relations (orange), then items with any relations (gray)
  const sortedDynamicAromas = [...dynamicAromas].sort((a, b) => {
    const aIsRelatedToCurrent = isAromaRelated(a.id!)
    const bIsRelatedToCurrent = isAromaRelated(b.id!)
    const aHasAnyRelation = aromaHasAnyRelation(a.id!)
    const bHasAnyRelation = aromaHasAnyRelation(b.id!)
    
    // Priority 1: Items related to current intended impact (black)
    if (aIsRelatedToCurrent && !bIsRelatedToCurrent) return -1
    if (!aIsRelatedToCurrent && bIsRelatedToCurrent) return 1
    
    // Priority 2: Among non-current-related items, prioritize those without any relation (orange) over those with relations (gray)
    if (!aIsRelatedToCurrent && !bIsRelatedToCurrent) {
      if (!aHasAnyRelation && bHasAnyRelation) return -1
      if (aHasAnyRelation && !bHasAnyRelation) return 1
    }
    
    return 0
  })
  
  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${isDecorateOption ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {/* Main Options Column */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-base">Categorías</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/admin/management/main-options/create")}
            >
              Agregar
            </Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sortedMainOptions.map((option) => {
              const hasRelations = mainOptionHasRelations(option.id!)
              const isSelected = selectedMainOptionId === option.id
              
              return (
                <div
                  key={option.id}
                  className={cn(
                    "p-2 rounded cursor-pointer flex items-center hover:bg-secondary",
                    isSelected ? "bg-secondary font-medium" : "",
                    !hasRelations ? "text-orange-500" : 
                    isSelected ? "" : 
                    selectedMainOptionId ? "text-gray-400" : ""
                  )}
                  onClick={() => handleMainOptionSelect(option.id!)}
                >
                  <div className="w-5 h-5 border rounded-sm flex items-center justify-center mr-2">
                    {isSelected && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                  <span>{option.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Places Column - Show only if "Decorar espacios" is selected */}
        {isDecorateOption && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-base">Lugares</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/admin/management/places/create")}
              >
                Agregar
              </Button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sortedPlaces.map((place) => {
                const hasRelations = placeHasRelations(place.id!)
                const isSelected = selectedPlaceId === place.id
                
                return (
                  <div
                    key={place.id}
                    className={cn(
                      "p-2 rounded cursor-pointer flex items-center hover:bg-secondary",
                      isSelected ? "bg-secondary font-medium" : "",
                      !hasRelations ? "text-orange-500" : 
                      isSelected ? "" : 
                      selectedPlaceId ? "text-gray-400" : ""
                    )}
                    onClick={() => handlePlaceSelect(place.id!)}
                  >
                    <div className="w-5 h-5 border rounded-sm flex items-center justify-center mr-2">
                      {isSelected && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <span>{place.name}</span>
                  </div>
                )
              })}
              {places.length === 0 && (
                <div className="text-sm text-muted-foreground py-2">
                  No hay lugares disponibles.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Intended Impacts Column */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-base">¿Qué quiero provocar? (Impactos)</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/admin/management/intended-impacts/create")}
            >
              Agregar
            </Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isLoadingIntendedImpacts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Cargando impactos...</span>
              </div>
            ) : (
              sortedFilteredIntendedImpacts.map((impact) => {
                const isRelated = isIntendedImpactRelated(impact.id!)
                const isSelected = selectedIntendedImpactId === impact.id
                const isClickable = isRelated
                
                return (
                  <div
                    key={impact.id}
                    className={cn(
                      "p-2 rounded flex items-center",
                      isClickable ? "cursor-pointer hover:bg-secondary" : "cursor-not-allowed",
                      isSelected ? "bg-secondary font-medium" : "",
                      !isRelated ? "text-gray-400" : ""
                    )}
                    onClick={() => isClickable && handleIntendedImpactSelect(impact.id!)}
                  >
                    <div className="w-5 h-5 border rounded-sm flex items-center justify-center mr-2">
                      {isSelected && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <span>{impact.name}</span>
                  </div>
                )
              })
            )}
            {!isLoadingIntendedImpacts && selectedMainOptionId && filteredIntendedImpacts.length === 0 && (
              <div className="text-sm text-muted-foreground py-2">
                {isDecorateOption 
                  ? selectedPlaceId 
                    ? "No hay impactos asociados a este lugar."
                    : "Selecciona un lugar para ver los impactos relacionados."
                  : "No hay impactos asociados a esta opción principal."
                }
              </div>
            )}
          </div>
        </div>

        {/* Aromas Column */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-base">Aromas</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/admin/management/aromas/create")}
            >
              Agregar
            </Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isLoadingAromas ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Cargando aromas...</span>
              </div>
            ) : selectedIntendedImpactId ? (
              sortedDynamicAromas.map((aroma) => {
                const aromaIsRelated = isAromaRelated(aroma.id!)
                const hasAnyRelation = aromaHasAnyRelation(aroma.id!)
                // All aromas are now clickable
                const isClickable = true
                
                return (
                  <div
                    key={aroma.id}
                    className={cn(
                      "p-2 rounded flex items-center cursor-pointer hover:bg-secondary",
                      selectedIntendedImpactId && selectedAromaIds.includes(aroma.id!) ? "bg-secondary font-medium" : "",
                      !hasAnyRelation ? "text-orange-500" : 
                      !aromaIsRelated ? "text-gray-400" : ""
                    )}
                    onClick={() => selectedIntendedImpactId && handleAromaToggle(aroma.id!)}
                  >
                    <div className="w-5 h-5 border rounded-sm flex items-center justify-center mr-2">
                      {selectedIntendedImpactId && selectedAromaIds.includes(aroma.id!) && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <span>{aroma.name}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                Selecciona un impacto para ver los aromas relacionados.
              </div>
            )}
            {!isLoadingAromas && selectedIntendedImpactId && dynamicAromas.length === 0 && (
              <div className="text-sm text-muted-foreground py-2">
                No hay aromas asociados a este impacto.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!hasChanges()}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleUpdate}
            disabled={!hasChanges()}
          >
            Actualizar
          </Button>
        </div>
      </div>
    </div>
  )
}
