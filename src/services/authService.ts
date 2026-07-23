import api from "./api";
import type { LoginDto, RegisterDto, LoginResponse } from "@/types/auth";

export async function login(dto: LoginDto): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", dto);
  return data;
}

export async function register(dto: RegisterDto): Promise<void> {
  await api.post("/auth/register", dto);
}