import api from "./api";
import type { PagedResultDto, ParametrosPaginacion } from "@/types/paginacion";

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

// Solo para el panel de administrador — paginado, con búsqueda/orden y rango de fechas.
// Sin fechaInicio/fechaFin, el backend responde solo con las reservas de HOY.
export async function obtenerReservas(
  params: ParametrosPaginacion & { fechaInicio?: string; fechaFin?: string; estado?: string }
): Promise<PagedResultDto<ReservaDto>> {
  const { data } = await api.get<PagedResultDto<ReservaDto>>("/reserva", { params });
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
// Disponibilidad de horarios (ReservarPage)
// ============================================================

export interface FranjaHoraria {
  hora: string; // "HH:mm"
  disponible: boolean;
}

interface HorarioOcupadoDto {
  horaEntrada: string; // "HH:mm:ss"
  horaSalida: string; // "HH:mm:ss"
}

// Franjas fijas de 1 hora que ofrecemos para reservar. El backend no tiene noción
// de "slots" (las reservas son de horario libre), así que esta grilla es una
// decisión de producto del frontend, no algo que venga del servidor — pero el
// rango (8:00 a 22:00) debe coincidir con HorarioNegocioConstantes en el backend,
// que es quien realmente lo valida al crear la reserva.
const HORA_APERTURA = 8;
const HORA_CIERRE = 22;

const HORAS_DEL_DIA = Array.from({ length: HORA_CIERRE - HORA_APERTURA }, (_, i) =>
  String(HORA_APERTURA + i).padStart(2, "0") + ":00"
);

function sumarHora(hora: string): string {
  const h = parseInt(hora.split(":")[0], 10) + 1;
  return String(h).padStart(2, "0") + ":00";
}

// Evita usar toISOString() acá: convierte a UTC primero y puede correr la fecha
// un día hacia atrás en zonas horarias negativas (ej. Honduras, UTC-6).
function aFechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Dos franjas [aInicio, aFin) y [bInicio, bFin) se traslapan si aInicio < bFin && aFin > bInicio.
// Comparación por string funciona porque "HH:mm:ss" siempre viene con ceros a la izquierda.
function seTraslapan(aInicio: string, aFin: string, bInicio: string, bFin: string): boolean {
  return aInicio < bFin && aFin > bInicio;
}

export async function obtenerDisponibilidad(canchaId: number, fecha: Date): Promise<FranjaHoraria[]> {
  const { data: ocupados } = await api.get<HorarioOcupadoDto[]>("/reserva/disponibilidad", {
    params: { canchaId, fecha: aFechaISO(fecha) },
  });

  return HORAS_DEL_DIA.map((hora) => {
    const inicio = `${hora}:00`;
    const fin = `${sumarHora(hora)}:00`;
    const disponible = !ocupados.some((o) => seTraslapan(inicio, fin, o.horaEntrada, o.horaSalida));
    return { hora, disponible };
  });
}
