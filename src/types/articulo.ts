export interface ArticuloDto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: boolean;
  imagenBase64: string | null;
}

export interface ArticuloCreateDto {
  nombre: string;
  descripcion: string;
  precio: number;
  imagenBase64: string | null;
}

export interface ArticuloUpdateDto extends ArticuloCreateDto {
  estado: boolean;
}
