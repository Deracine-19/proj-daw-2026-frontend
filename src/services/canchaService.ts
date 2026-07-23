import api from "./api";
import type { CanchaDto, CanchaCreateDto, CanchaUpdateDto } from "@/types/cancha";

export async function obtenerCanchas(): Promise<CanchaDto[]> {
  const { data } = await api.get<CanchaDto[]>("/cancha");
  return data;
}

export async function crearCancha(dto: CanchaCreateDto): Promise<CanchaDto> {
  const { data } = await api.post<CanchaDto>("/cancha", dto);
  return data;
}

export async function actualizarCancha(id: number, dto: CanchaUpdateDto): Promise<CanchaDto> {
  const { data } = await api.put<CanchaDto>(`/cancha/${id}`, dto);
  return data;
}

export async function cambiarEstadoCancha(id: number): Promise<CanchaDto> {
  const { data } = await api.patch<CanchaDto>(`/cancha/${id}/status`);
  return data;
}