import api from "./api";
import type { ArticuloDto, ArticuloCreateDto, ArticuloUpdateDto } from "@/types/articulo";

export async function obtenerArticulos(): Promise<ArticuloDto[]> {
  const { data } = await api.get<ArticuloDto[]>("/articulo");
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
