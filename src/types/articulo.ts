export interface ArticuloDto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: boolean;
}

export interface ArticuloCreateDto {
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface ArticuloUpdateDto extends ArticuloCreateDto {
  estado: boolean;
}
