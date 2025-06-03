export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phone: string;
  phoneCountryCode: string;
  city: string;
  state?: string;
  country: string;
  address: string;
  profilePicture?: string;
  roles: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Campos adicionales para compatibilidad
  imageUrl?: string;
  bio?: string;
  location?: string;
}