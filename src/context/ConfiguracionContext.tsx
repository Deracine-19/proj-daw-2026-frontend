import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { obtenerConfiguracion, type ConfiguracionReadDto } from "@/services/configuracionService";
import { PROYECTO_NOMBRE } from "@/config/app";

interface ConfiguracionContextType {
  nombreNegocio: string;
  horaApertura: string; // "HH:mm:ss", tal cual la devuelve el backend
  horaCierre: string; // "HH:mm:ss"
  horaAperturaNum: number; // hora entera (8) — para construir la grilla de franjas horarias
  horaCierreNum: number; // hora entera (22)
  cargando: boolean;
  refrescar: () => Promise<void>;
}

// Se usan mientras se carga la configuración real (o si la petición falla) — mismos valores
// que tenía hardcodeados HorarioNegocioConstantes en el backend antes de esta migración.
const VALORES_POR_DEFECTO: ConfiguracionReadDto = {
  nombreNegocio: PROYECTO_NOMBRE,
  horaApertura: "08:00:00",
  horaCierre: "22:00:00",
  lastEditedDate: null,
};

const ConfiguracionContext = createContext<ConfiguracionContextType | undefined>(undefined);

function horaANumero(hora: string): number {
  return parseInt(hora.split(":")[0], 10);
}

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfiguracionReadDto>(VALORES_POR_DEFECTO);
  const [cargando, setCargando] = useState(true);

  async function refrescar() {
    try {
      setConfig(await obtenerConfiguracion());
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
