import api from "./api";
import type { DashboardDto } from "@/types/dashboard";

export async function obtenerDashboard(): Promise<DashboardDto> {
  const { data } = await api.get<DashboardDto>("/dashboard");
  return data;
}