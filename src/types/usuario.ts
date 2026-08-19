export interface UsuarioDto {
  id: number;
  nombre: string;
  email: string;
  rolId: number;
  rolNombre: string;
  activo: boolean;
  imagenBase64: string | null;
}

export interface UsuarioUpdateDto {
  nombre: string;
  email: string;
  rolId: number;
  imagenBase64: string | null;
}

export interface UsuarioCreateDto {
  nombre: string;
  email: string;
  password: string;
  rolId: number;
}