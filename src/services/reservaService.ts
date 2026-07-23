import api from "./api";

export interface ReservaArticuloDto {
  articuloId: number;
  nombreArticulo: string | null;
  cantidad: number;
  precioUnitario: number;
}

export interface ReservaDto {
  id: number;
  usuarioId: number;
  nombreUsuario: string | null;
  canchaId: number;
  nombreCancha: string | null;
  fecha: string; // "YYYY-MM-DD"
  horaEntrada: string; // "HH:mm:ss"
  horaSalida: string; // "HH:mm:ss"
  codigoReserva: string;
  estadoReserva: string; // "CONFIRMADA" | "CANCELADA" (confirmados hasta hoy)
  estadoPago: boolean;
  precioAplicado: number;
  total: number;
  articulos: ReservaArticuloDto[];
}

export async function obtenerReservas(): Promise<ReservaDto[]> {
  const { data } = await api.get<ReservaDto[]>("/reserva");
  return data;
}

export async function obtenerReservaPorId(id: number): Promise<ReservaDto> {
  const { data } = await api.get<ReservaDto>(`/reserva/${id}`);
  return data;
}

export async function obtenerMisReservas(): Promise<ReservaDto[]> {
  const { data } = await api.get<ReservaDto[]>("/reserva/mis-reservas");
  return data;
}

export async function marcarComoPagada(id: number): Promise<ReservaDto> {
  const { data } = await api.patch<ReservaDto>(`/reserva/${id}/pagar`);
  return data;
}

export async function marcarComoNoShow(id: number): Promise<ReservaDto> {
  const { data } = await api.patch<ReservaDto>(`/reserva/${id}/no-show`);
  return data;
}

// El endpoint solo devuelve un mensaje de confirmación, no la reserva actualizada
// (a diferencia de CambiarEstado en Usuario/Cancha), así que el frontend
// actualiza el estado localmente después de una respuesta exitosa.
export async function cancelarReserva(id: number): Promise<void> {
  await api.patch(`/reserva/${id}/cancelar`);
}

export interface CrearReservaDto {
  canchaId: number;
  fecha: string; // "YYYY-MM-DD"
  horaEntrada: string; // "HH:mm:ss" — el backend usa TimeSpan, exige el formato completo con segundos
  horaSalida: string; // "HH:mm:ss"
  articulos: { articuloId: number; cantidad: number }[];
}

export async function crearReserva(dto: CrearReservaDto): Promise<ReservaDto> {
  const { data } = await api.post<ReservaDto>("/reserva", dto);
  return data;
}

// ============================================================
// MOCK — pendiente de backend real (vista de cliente / ReservarPage)
// ============================================================

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

function generarCodigoMock(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export interface ReservaCreateMockDto {
  canchaId: number;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
}

export interface ReservaCreadaDto {
  id: number;
  codigo: string;
}

// TODO: reemplazar por crearReserva() (arriba) cuando ReservarPage esté lista para usar el backend real.
// OJO al hacer el cambio: crearReserva() exige horaEntrada/horaSalida en formato "HH:mm:ss" (con segundos),
// pero ReservarPage hoy genera horas tipo "09:00" (sin segundos) para HORAS_DEL_DIA. Hay que agregar
// ":00" al final antes de mandarlas, o el backend rechazará la petición con el mismo error de
// TimeSpan que ya vimos al probar en Postman.
export async function crearReservaMock(dto: ReservaCreateMockDto): Promise<ReservaCreadaDto> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ id: Math.floor(Math.random() * 1000), codigo: generarCodigoMock() }), 400)
  );
}