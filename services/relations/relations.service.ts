import { createRequestWithEntity } from "@/lib/axios"
import { MainOption } from "@/types/main-option"
import { IntendedImpact } from "@/types/intended-impact"
import { Aroma } from "@/types/aroma"
import { Place } from "@/types/place"
import { AromaService } from "@/services/aromas/aroma.service"

// Crear cliente HTTP específico para relaciones
const relationsApi = createRequestWithEntity("relación")

export interface RelationData {
  mainOptions: MainOption[]
  intendedImpacts: IntendedImpact[]
  aromas: Aroma[]
  places: Place[]
  mainOptionIntendedImpacts: { mainOptionId: string; intendedImpactIds: string[] }[]
  intendedImpactAromas: { intendedImpactId: string; aromaIds: string[] }[]
  placeIntendedImpacts: { placeId: string; intendedImpactIds: string[] }[]
}

export class RelationsService {
  static async getAllRelationsData(): Promise<RelationData> {
    try {
      // Fetch all entities with their relationships
      const mainOptions = await this.getMainOptions()
      const intendedImpacts = await this.getIntendedImpacts()
      const aromas = await this.getAromasWithRelations()
      const places = await this.getPlaces()

      // Get real relationships from the backend
      const mainOptionIntendedImpacts = this.generateMainOptionIntendedImpactRelations(mainOptions, intendedImpacts)
      const intendedImpactAromas = this.generateIntendedImpactAromaRelationsFromData(intendedImpacts, aromas)
      const placeIntendedImpacts = await this.getPlaceIntendedImpactRelations()

      return {
        mainOptions,
        intendedImpacts,
        aromas,
        places,
        mainOptionIntendedImpacts,
        intendedImpactAromas,
        placeIntendedImpacts
      }
    } catch (error) {
      console.error("Error fetching relations data:", error)
      throw error
    }
  }

  static async getMainOptions(): Promise<MainOption[]> {
    const response = await relationsApi.get("/main-options")
    return response.data
  }

  static async getIntendedImpacts(): Promise<IntendedImpact[]> {
    const response = await relationsApi.get("/intended-impacts")
    return response.data
  }

  static async getAromas(): Promise<Aroma[]> {
    const response = await relationsApi.get("/aromas")
    return response.data
  }

  static async getAromasWithRelations(): Promise<Aroma[]> {
    return await AromaService.getAllWithRelations()
  }

  static async getPlaces(): Promise<Place[]> {
    const response = await relationsApi.get("/places")
    return response.data
  }

  static async updateRelations(
    intendedImpactId: string,
    aromaIds: string[]
  ): Promise<void> {
    try {
      // Get all aromas with their relations to identify which ones are new (orange)
      const allAromas = await this.getAromasWithRelations()
      
      // Get current relations for this intended impact (handle case where none exist)
      let currentRelatedAromas: any[] = []
      try {
        currentRelatedAromas = await AromaService.getAromasByIntendedImpact(intendedImpactId)
      } catch (error) {
        console.log('No existing aromas found for this intended impact, starting with empty relations')
        currentRelatedAromas = []
      }
      
      const currentAromaIds = currentRelatedAromas.map(aroma => aroma.id!).filter(Boolean)
      
      // Find aromas to add (present in aromaIds but not in currentAromaIds)
      const aromasToAdd = aromaIds.filter(aromaId => !currentAromaIds.includes(aromaId))
      
      // Find aromas to remove (present in currentAromaIds but not in aromaIds)
      const aromasToRemove = currentAromaIds.filter(aromaId => !aromaIds.includes(aromaId))
      
      
      // Process aromas to add
      for (const aromaId of aromasToAdd) {
        // Check if this aroma is already related to THIS specific intended impact
        const aroma = allAromas.find(a => a.id === aromaId)
        const isAlreadyRelatedToThisIntendedImpact = aroma?.intendedImpacts?.some(
          impact => impact.id === intendedImpactId
        ) || false
        
        if (!isAlreadyRelatedToThisIntendedImpact) {
          // Create new relation - aromas can have multiple relations with different intended impacts
          console.log(`Creating new relation: aroma ${aromaId} -> intended impact ${intendedImpactId}`)
          await AromaService.assignIntendedImpact(aromaId, intendedImpactId)
        } else {
          console.log(`Aroma ${aromaId} is already related to intended impact ${intendedImpactId} - skipping`)
        }
      }
      
      // Process aromas to remove
      for (const aromaId of aromasToRemove) {
        await AromaService.removeIntendedImpact(aromaId, intendedImpactId)
      }
    } catch (error) {
      console.error("Error updating relations:", error)
      throw error
    }
  }

  // Helper methods to generate relationship data from real backend data
  
  private static generateMainOptionIntendedImpactRelations(
    mainOptions: MainOption[],
    intendedImpacts: IntendedImpact[]
  ) {
    
    return mainOptions.map((mainOption) => {
      // Use ONLY the real mainOptionId field relationships from the database
      const relatedImpacts = intendedImpacts
        .filter(impact => {
          // Check if the impact's mainOptionId matches this main option's id
          const matches = impact.mainOptionId === mainOption.id
          return matches
        })
        .map(impact => impact.id!)
        .filter(id => id) // Filter out undefined ids
      
      return {
        mainOptionId: mainOption.id!,
        intendedImpactIds: relatedImpacts
      }
    })
  }

  private static generateIntendedImpactAromaRelationsFromData(
    intendedImpacts: IntendedImpact[],
    aromas: Aroma[]
  ) {
    
    return intendedImpacts.map(impact => {
      // Find all aromas that have this intended impact
      const relatedAromas = aromas
        .filter(aroma => {
          if (!aroma.intendedImpacts) return false
          const hasRelation = aroma.intendedImpacts.some(aromaImpact => aromaImpact.id === impact.id)
          return hasRelation
        })
        .map(aroma => aroma.id!)
        .filter(id => id) // Filter out undefined ids
      return {
        intendedImpactId: impact.id!,
        aromaIds: relatedAromas
      }
    })
  }

  private static generatePlaceIntendedImpactRelations(
    places: Place[],
    intendedImpacts: IntendedImpact[]
  ) {
  
    return places.map(place => {
      // Use a seed based on place ID to ensure consistent relationships
      // In a real app, this would come from your backend
      const seed = this.hashString(place.id || "");
      const impactCount = Math.max(1, Math.floor((seed % 3) + 1)); // 1-3 impacts per place
      
      const assignedImpacts = [];
      for (let i = 0; i < impactCount && i < intendedImpacts.length; i++) {
        const impactIndex = (seed + i * 3) % intendedImpacts.length; // Use different multiplier for variety
        if (intendedImpacts[impactIndex] && intendedImpacts[impactIndex].id) {
          assignedImpacts.push(intendedImpacts[impactIndex].id!);
        }
      }
      
      return {
        placeId: place.id!,
        intendedImpactIds: assignedImpacts
      }
    })
  }

  private static async getPlaceIntendedImpactRelations() {
    // For now, return empty array - this relationship needs to be implemented in backend
    return []
  }

  // Simple hash function for consistent seeding
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
