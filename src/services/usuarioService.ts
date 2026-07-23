import api from "./api";
import type { UsuarioDto, UsuarioUpdateDto, UsuarioCreateDto } from "@/types/usuario";

export async function obtenerUsuarios(): Promise<UsuarioDto[]> {
  const { data } = await api.get<UsuarioDto[]>("/usuarios");
  return data;
}

export async function obtenerUsuarioPorId(id: number): Promise<UsuarioDto> {
  const { data } = await api.get<UsuarioDto>(`/usuarios/${id}`);
  return data;
}

export async function actualizarUsuario(id: number, dto: UsuarioUpdateDto): Promise<UsuarioDto> {
  const { data } = await api.put<UsuarioDto>(`/usuarios/${id}`, dto);
  return data;
}

export async function crearUsuario(dto: UsuarioCreateDto): Promise<UsuarioDto> {
  const { data } = await api.post<UsuarioDto>("/usuarios", dto);
  return data;
}

export async function cambiarEstadoUsuario(id: number): Promise<UsuarioDto> {
  const { data } = await api.patch<UsuarioDto>(`/usuarios/${id}/estado`);
  return data;
}