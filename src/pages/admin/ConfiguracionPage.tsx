import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { actualizarConfiguracion } from "@/services/configuracionService";
import { useConfiguracion } from "@/context/ConfiguracionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function mensajeError(err: unknown, fallback: string): string {
  if (isAxiosError(err) && typeof err.response?.data?.mensaje === "string") {
    return err.response.data.mensaje;
  }
  return fallback;
}

// El backend usa TimeSpan y exige "HH:mm:ss". El horario solo se maneja en horas exactas
// (igual que la grilla de franjas de ReservarPage, que tampoco tiene granularidad de minutos).
function conSegundos(hora: string): string {
  return `${hora}:00`;
}

function sinSegundos(hora: string): string {
  return hora.slice(0, 5);
}

const HORAS_DISPONIBLES = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

function ConfiguracionPage() {
  const { nombreNegocio, horaApertura, horaCierre, cargando, refrescar } = useConfiguracion();

  const [nombre, setNombre] = useState(nombreNegocio);
  const [apertura, setApertura] = useState(sinSegundos(horaApertura));
  const [cierre, setCierre] = useState(sinSegundos(horaCierre));
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Una vez que el contexto termina de cargar la configuración real, refleja esos
  // valores en el formulario (hasta entonces se muestran los valores por defecto).
  useEffect(() => {
    if (!cargando) {
      setNombre(nombreNegocio);
      setApertura(sinSegundos(horaApertura));
      setCierre(sinSegundos(horaCierre));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando]);

  const huboCambios =
    nombre.trim() !== nombreNegocio || apertura !== sinSegundos(horaApertura) || cierre !== sinSegundos(horaCierre);

  async function guardar() {
    setError("");

    if (!nombre.trim()) {
      setError("El nombre del negocio es obligatorio.");
      return;
    }
    if (apertura >= cierre) {
      setError("La hora de apertura debe ser anterior a la hora de cierre.");
      return;
    }

    setGuardando(true);
    try {
      await actualizarConfiguracion({
        nombreNegocio: nombre.trim(),
        horaApertura: conSegundos(apertura),
        horaCierre: conSegundos(cierre),
      });
      await refrescar();
      toast.success("Configuración actualizada.");
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar la configuración."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center border-b border-line bg-page/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">Configuración</span>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        <div className="max-w-[480px] overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="border-b border-line px-5 py-4">
            <span className="text-[15px] font-semibold">Datos del negocio</span>
            <p className="m-0 mt-1 text-[13px] text-ink-faint">
              El nombre se muestra en el login y en la barra de navegación. El horario define
              cuándo los clientes pueden reservar canchas.
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5">
            <Campo label="Nombre del negocio">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={60}
                disabled={cargando}
                className="h-10.5 rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none placeholder:text-ink-disabled focus:border-ink-disabled disabled:opacity-60"
              />
            </Campo>

            <div className="grid grid-cols-2 gap-4">
              <Campo label="Hora de apertura">
                <Select value={apertura} onValueChange={setApertura} disabled={cargando}>
                  <SelectTrigger className="h-10.5 w-full rounded-[9px] border-line-strong bg-panel px-3 text-sm text-ink">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HORAS_DISPONIBLES.map((hora) => (
                      <SelectItem key={hora} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Hora de cierre">
                <Select value={cierre} onValueChange={setCierre} disabled={cargando}>
                  <SelectTrigger className="h-10.5 w-full rounded-[9px] border-line-strong bg-panel px-3 text-sm text-ink">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HORAS_DISPONIBLES.map((hora) => (
                      <SelectItem key={hora} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
            </div>

            {error && <p className="text-sm text-negative">{error}</p>}

            <div className="mt-1 flex justify-end">
              <button
                onClick={guardar}
                disabled={cargando || guardando || !huboCambios}
                className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">{label}</label>
      {children}
    </div>
  );
}

export default ConfiguracionPage;
