import api from "./api";
import type { CanchaDto, CanchaCreateDto, CanchaUpdateDto } from "@/types/cancha";
import type { PagedResultDto, ParametrosPaginacion } from "@/types/paginacion";

// Lista completa (sin paginar) — la usan las pantallas de cliente (ej. reservar) que
// necesitan ver todas las canchas activas, no un subconjunto. 200 es el tope que
// también aplica el backend; de sobra para un catálogo de canchas.
export async function obtenerCanchas(): Promise<CanchaDto[]> {
  const { data } = await api.get<PagedResultDto<CanchaDto>>("/cancha", { params: { pageSize: 200 } });
  return data.items;
}

// Versión paginada — la usa el panel de administrador.
export async function obtenerCanchasPaginadas(params: ParametrosPaginacion): Promise<PagedResultDto<CanchaDto>> {
  const { data } = await api.get<PagedResultDto<CanchaDto>>("/cancha", { params });
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
