export interface FranjaHoraria {
  hora: string;
  disponible: boolean;
}

const HORAS_DEL_DIA = ["08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

function pseudoAleatorio(canchaId: number, fecha: Date, hora: string): number {
  const seed = canchaId * 31 + fecha.getDate() * 7 + parseInt(hora, 10);
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// TODO: reemplazar por GET /api/cancha/{id}/disponibilidad?fecha=... cuando el backend lo exponga
export async function obtenerDisponibilidad(canchaId: number, fecha: Date): Promise<FranjaHoraria[]> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          HORAS_DEL_DIA.map((hora) => ({
            hora,
            disponible: pseudoAleatorio(canchaId, fecha, hora) > 0.25,
          }))
        ),
      300
    )
  );
}

export interface ReservaCreateDto {
  canchaId: number;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
}

export interface ReservaCreadaDto {
  id: number;
  codigo: string;
}

function generarCodigoMock(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// TODO: reemplazar por POST /api/reserva cuando el backend lo exponga
export async function crearReservaMock(dto: ReservaCreateDto): Promise<ReservaCreadaDto> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ id: Math.floor(Math.random() * 1000), codigo: generarCodigoMock() }), 400)
  );
}