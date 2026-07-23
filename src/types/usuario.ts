export interface UsuarioDto {
  id: number;
  nombre: string;
  email: string;
  rolId: number;
  rolNombre: string;
  activo: boolean;
}

export interface UsuarioUpdateDto {
  nombre: string;
  email: string;
  rolId: number;
}

export interface UsuarioCreateDto {
  nombre: string;
  email: string;
  password: string;
  rolId: number;
}