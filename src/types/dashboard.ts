export interface DashboardReserva {
  id: number;
  codigoReserva: string;
  cliente: string;
  cancha: string;
  fecha: string;
  horaEntrada: string;
  total: number;
  estadoReserva: string;
  estadoPago: boolean;
}

export interface DashboardDto {
  reservasHoy: number;
  ingresosHoy: number;
  usuariosActivos: number;
  canchasActivas: number;
  reservasPendientesPago: number;
  noShowsMes: number;
  canchaMasReservada: string;
  reservasRecientes: DashboardReserva[];
}