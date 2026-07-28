import api from "./api";

import type {
  ArticuloDto,
  ArticuloCreateDto,
  ArticuloUpdateDto,
} from "@/types/articulo";

export async function obtenerArticulos(): Promise<ArticuloDto[]> {
  const response = await api.get<ArticuloDto[]>("/articulo");
  return response.data;
}

export async function obtenerArticuloPorId(
  id: number
): Promise<ArticuloDto> {
  const response = await api.get<ArticuloDto>(
    `/articulo/${id}`
  );

  return response.data;
}

export async function crearArticulo(
  articulo: ArticuloCreateDto
): Promise<ArticuloDto> {
  const response = await api.post<ArticuloDto>(
    "/articulo",
    articulo
  );

  return response.data;
}

export async function actualizarArticulo(
  id: number,
  articulo: ArticuloUpdateDto
): Promise<ArticuloDto> {
  const response = await api.put<ArticuloDto>(
    `/articulo/${id}`,
    articulo
  );

  return response.data;
}

export async function cambiarEstadoArticulo(
  id: number
): Promise<ArticuloDto> {
  const response = await api.patch<ArticuloDto>(
    `/articulo/${id}/estado`
  );

  return response.data;
}