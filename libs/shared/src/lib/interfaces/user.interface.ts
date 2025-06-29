export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: number;
  name: string;
  description: string;
  permissions?: string[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role_id: number;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  full_name?: string;
  is_active?: boolean;
  role_id?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
} 