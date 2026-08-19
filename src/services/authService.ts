import api from "./api";
import type { LoginDto, RegisterDto, LoginResponse, ForgotPasswordDto, ResetPasswordDto } from "@/types/auth";

export async function login(dto: LoginDto): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", dto);
  return data;
}

export async function register(dto: RegisterDto): Promise<void> {
  await api.post("/auth/register", dto);
}

export async function forgotPassword(dto: ForgotPasswordDto): Promise<string> {
  const { data } = await api.post<{ mensaje: string }>("/auth/forgot-password", dto);
  return data.mensaje;
}

export async function resetPassword(dto: ResetPasswordDto): Promise<string> {
  const { data } = await api.post<{ mensaje: string }>("/auth/reset-password", dto);
  return data.mensaje;
}