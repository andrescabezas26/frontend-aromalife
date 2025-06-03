import { IntendedImpact } from "./intended-impact";

export interface OlfativePyramid {
  salida: string;
  corazon: string;
  fondo: string;
}

export interface Aroma {
  imageUrl: string;
  id?: string;
  name: string;
  description: string;
  olfativePyramid: {
    salida: string;
    corazon: string;
    fondo: string;
  };
  color: string;
  intendedImpacts?: IntendedImpact[];
  createdAt?: Date;
  updatedAt?: Date;
}
