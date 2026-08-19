import api from "./api";

export interface ConfiguracionDto {
  nombreNegocio: string;
  horaApertura: string; // "HH:mm:ss" — el backend usa TimeSpan, exige el formato completo con segundos
  horaCierre: string; // "HH:mm:ss"
}

export interface ConfiguracionReadDto extends ConfiguracionDto {
  lastEditedDate: string | null;
}

// Público (sin token) — el nombre del negocio se muestra en el login, antes de autenticarse.
export async function obtenerConfiguracion(): Promise<ConfiguracionReadDto> {
  const { data } = await api.get<ConfiguracionReadDto>("/configuracion");
  return data;
}

// Solo Administrador.
export async function actualizarConfiguracion(dto: ConfiguracionDto): Promise<ConfiguracionReadDto> {
  const { data } = await api.put<ConfiguracionReadDto>("/configuracion", dto);
  return data;
}
