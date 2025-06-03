export interface Candle {
  id: string;
  name: string;
  description?: string;
  price: number;
  audioUrl?: string;
  modelUrl?: string;
  message?: string;
  qrUrl?: string;
  createdAt: string;
  updatedAt: string;
  container: {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
  };
  aroma: {
    color: string;
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
  };
  label?: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    text?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateCandleRequest {
  name: string;
  description?: string;
  price: number;
  message?: string;
  audioUrl?: string;
  qrUrl?: string;
  containerId: string;
  aromaId: string;
  userId?: string;
  isActive?: boolean;
}

export interface CreateCandleWithFilesRequest extends CreateCandleRequest {
  labelId?: string;
  audioFile?: File;
  labelFile?: File;
  modelFile?: File;
  labelName?: string;
  labelDescription?: string;
  labelType?: string;
  labelAiPrompt?: string;
}

export interface UpdateCandleRequest {
  name?: string;
  description?: string;
  price?: number;
  message?: string;
  qrUrl?: string;
  containerId?: string;
  aromaId?: string;
  isActive?: boolean;
}
