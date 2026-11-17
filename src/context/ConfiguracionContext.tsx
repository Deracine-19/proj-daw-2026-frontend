import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { obtenerConfiguracion, type ConfiguracionReadDto } from "@/services/configuracionService";

interface ConfiguracionContextType {
  nombreNegocio: string;
  horaApertura: string; // "HH:mm:ss", tal cual la devuelve el backend
  horaCierre: string; // "HH:mm:ss"
  horaAperturaNum: number; // hora entera (8) — para construir la grilla de franjas horarias
  horaCierreNum: number; // hora entera (22)
  cargando: boolean;
  refrescar: () => Promise<void>;
}

// El nombre del negocio viene del backend. Guardamos el último recibido en localStorage para
// mostrarlo desde el primer render al refrescar; sin esto se veía un nombre por defecto ("DEMO")
// durante un instante antes de que llegara la respuesta. En la primera visita queda vacío.
const NOMBRE_NEGOCIO_CACHE_KEY = "nombreNegocio";

function leerNombreCacheado(): string {
  try {
    return localStorage.getItem(NOMBRE_NEGOCIO_CACHE_KEY) ?? "";
  } catch {
    return "";
  }
}

// Se usan mientras se carga la configuración real (o si la petición falla) — mismos horarios
// que tenía hardcodeados HorarioNegocioConstantes en el backend antes de esta migración.
const VALORES_POR_DEFECTO: ConfiguracionReadDto = {
  nombreNegocio: "",
  horaApertura: "08:00:00",
  horaCierre: "22:00:00",
  lastEditedDate: null,
};

const ConfiguracionContext = createContext<ConfiguracionContextType | undefined>(undefined);

function horaANumero(hora: string): number {
  return parseInt(hora.split(":")[0], 10);
}

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfiguracionReadDto>(() => ({
    ...VALORES_POR_DEFECTO,
    nombreNegocio: leerNombreCacheado(),
  }));
  const [cargando, setCargando] = useState(true);

  async function refrescar() {
    try {
      const nueva = await obtenerConfiguracion();
      setConfig(nueva);
      try {
        localStorage.setItem(NOMBRE_NEGOCIO_CACHE_KEY, nueva.nombreNegocio);
      } catch {
        // Sin acceso a localStorage (modo privado, etc.) simplemente no se cachea.
      }
    } catch {
      // Si falla (ej. backend caído), la app sigue funcionando con los valores por defecto.
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    refrescar();
  }, []);

  return (
    <ConfiguracionContext.Provider
      value={{
        nombreNegocio: config.nombreNegocio,
        horaApertura: config.horaApertura,
        horaCierre: config.horaCierre,
        horaAperturaNum: horaANumero(config.horaApertura),
        horaCierreNum: horaANumero(config.horaCierre),
        cargando,
        refrescar,
      }}
    >
      {children}
    </ConfiguracionContext.Provider>
  );
}

export function useConfiguracion() {
  const context = useContext(ConfiguracionContext);
  if (!context) throw new Error("useConfiguracion debe usarse dentro de ConfiguracionProvider");
  return context;
}
