export type PresetRango = "hoy" | "semana" | "semanaPasada" | "ultimos30" | "custom";

export interface RangoFechas {
  desde: string; // "YYYY-MM-DD"
  hasta: string;
}

export function aFechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function parseFechaISO(fecha: string): Date {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

// Lunes de la semana que contiene `fecha`.
function lunesDeLaSemana(fecha: Date): Date {
  const dia = fecha.getDay(); // 0 = domingo, 1 = lunes, ... 6 = sábado
  const offset = dia === 0 ? -6 : 1 - dia;
  return sumarDias(fecha, offset);
}

export function calcularRango(preset: PresetRango): RangoFechas {
  const hoy = new Date();
  switch (preset) {
    case "hoy":
      return { desde: aFechaISO(hoy), hasta: aFechaISO(hoy) };
    case "semana": {
      const lunes = lunesDeLaSemana(hoy);
      return { desde: aFechaISO(lunes), hasta: aFechaISO(sumarDias(lunes, 6)) };
    }
    case "semanaPasada": {
      const lunesPasado = sumarDias(lunesDeLaSemana(hoy), -7);
      return { desde: aFechaISO(lunesPasado), hasta: aFechaISO(sumarDias(lunesPasado, 6)) };
    }
    case "ultimos30":
      return { desde: aFechaISO(sumarDias(hoy, -29)), hasta: aFechaISO(hoy) };
    case "custom":
      return { desde: aFechaISO(hoy), hasta: aFechaISO(hoy) };
  }
}
