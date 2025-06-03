export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterClientRequest {
  name: string;
  email: string;
  password: string;
  roles: string[];
}

export interface AuthResponse {
  user_id: string;
  name: string;
  email: string;
  token: string;
  roles?: string[];
  profilePicture?: string;
}
