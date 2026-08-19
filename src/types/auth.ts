export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nombre: string;
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  tempPassword: string;
  newPassword: string;
}

export interface LoginResponse {
  token: string;
}

export interface JwtPayload {
  nameid: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export interface AuthUser {
  id: string;
  email: string;
  rol: string;
}