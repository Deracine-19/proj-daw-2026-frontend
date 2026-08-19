import api from "./api";
import type { ArticuloDto, ArticuloCreateDto, ArticuloUpdateDto } from "@/types/articulo";
import type { PagedResultDto, ParametrosPaginacion } from "@/types/paginacion";

// Lista completa (sin paginar) — la usa ReservarPage para mostrar todos los artículos activos.
export async function obtenerArticulos(): Promise<ArticuloDto[]> {
  const { data } = await api.get<PagedResultDto<ArticuloDto>>("/articulo", { params: { pageSize: 200 } });
  return data.items;
}

// Versión paginada — la usa el panel de administrador.
export async function obtenerArticulosPaginados(params: ParametrosPaginacion): Promise<PagedResultDto<ArticuloDto>> {
  const { data } = await api.get<PagedResultDto<ArticuloDto>>("/articulo", { params });
  return data;
}

export async function crearArticulo(dto: ArticuloCreateDto): Promise<ArticuloDto> {
  const { data } = await api.post<ArticuloDto>("/articulo", dto);
  return data;
}

export async function actualizarArticulo(id: number, dto: ArticuloUpdateDto): Promise<ArticuloDto> {
  const { data } = await api.put<ArticuloDto>(`/articulo/${id}`, dto);
  return data;
}

export async function cambiarEstadoArticulo(id: number): Promise<ArticuloDto> {
  const { data } = await api.patch<ArticuloDto>(`/articulo/${id}/status`);
  return data;
}
