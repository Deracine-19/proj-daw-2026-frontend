export interface CanchaDto {
  id: number;
  nombre: string;
  descripcion: string;
  precioHora: number;
  estado: boolean;
  cantidadJugadores: number;
}

export interface CanchaCreateDto {
  nombre: string;
  descripcion: string;
  precioHora: number;
  estado: boolean;
  cantidadJugadores: number;
}

export interface CanchaUpdateDto extends CanchaCreateDto {}