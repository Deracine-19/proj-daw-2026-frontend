export interface CanchaDto {
  id: number;
  nombre: string;
  descripcion: string;
  precioHora: number;
  estado: boolean;
  cantidadJugadores: number;
  imagenBase64: string | null;
}

export interface CanchaCreateDto {
  nombre: string;
  descripcion: string;
  precioHora: number;
  estado: boolean;
  cantidadJugadores: number;
  imagenBase64: string | null;
}

export interface CanchaUpdateDto extends CanchaCreateDto {}