import api from "./api";
import type { UsuarioDto, UsuarioUpdateDto, UsuarioCreateDto } from "@/types/usuario";
import type { PagedResultDto, ParametrosPaginacion } from "@/types/paginacion";

export async function obtenerUsuarios(
  params: ParametrosPaginacion & { rol?: string; activo?: boolean }
): Promise<PagedResultDto<UsuarioDto>> {
  const { data } = await api.get<PagedResultDto<UsuarioDto>>("/usuarios", { params });
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

// Perfil propio del usuario autenticado (cualquier rol) — el JWT no trae nombre ni foto.
export async function obtenerMiPerfil(): Promise<UsuarioDto> {
  const { data } = await api.get<UsuarioDto>("/usuarios/perfil");
  return data;
}

export async function actualizarMiFoto(imagenBase64: string | null): Promise<UsuarioDto> {
  const { data } = await api.patch<UsuarioDto>("/usuarios/perfil/foto", { imagenBase64 });
  return data;
}