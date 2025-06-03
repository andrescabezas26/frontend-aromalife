export interface Container {
  id?: string
  name?: string
  description?: string
  basePrice: number
  imageUrl?: string
  dimensions?: {
    height?: number
    width?: number
    depth?: number
  }
  createdAt?: Date
  updatedAt?: Date
}