import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { obtenerCanchas } from "@/services/canchaService";
import { obtenerDisponibilidad, crearReserva, type FranjaHoraria } from "@/services/reservaService";
import type { CanchaDto } from "@/types/cancha";

function mensajeError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && typeof (data as { mensaje?: unknown }).mensaje === "string") {
      return (data as { mensaje: string }).mensaje;
    }
  }
  return fallback;
}

const DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DOW_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MON = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MON_FULL = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

interface Dia {
  fecha: Date;
  dow: string;
  num: string;
  mon: string;
  label: string;
}

function generarDias(cantidad: number): Dia[] {
  const hoy = new Date();
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    return {
      fecha: d,
      dow: DOW[d.getDay()],
      num: String(d.getDate()).padStart(2, "0"),
      mon: MON[d.getMonth()],
      label: `${DOW_FULL[d.getDay()]} ${d.getDate()} de ${MON_FULL[d.getMonth()]}`,
    };
  });
}

function formatoMoneda(n: number) {
  return "L " + n.toLocaleString("en-US");
}

function sumarHora(hora: string) {
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

// El backend usa TimeSpan y exige "HH:mm:ss" con segundos.
function conSegundos(hora: string): string {
  return `${hora}:00`;
}

interface Seleccion {
  canchaId: number;
  canchaNombre: string;
  hora: string;
  precioHora: number;
}

function ReservarPage() {
  const navigate = useNavigate();
  const [dias] = useState(() => generarDias(7));
  const [diaIdx, setDiaIdx] = useState(0);
  const [canchas, setCanchas] = useState<CanchaDto[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<Record<number, FranjaHoraria[]>>({});
  const [cargando, setCargando] = useState(true);
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  const diaActual = dias[diaIdx];

  useEffect(() => {
    cargarCanchasYDisponibilidad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaIdx]);

  async function cargarCanchasYDisponibilidad() {
    setCargando(true);
    setError("");
    try {
      const todas = await obtenerCanchas();
      const activas = todas.filter((c) => c.estado);
      setCanchas(activas);

      const entradas = await Promise.all(
        activas.map(async (c) => [c.id, await obtenerDisponibilidad(c.id, diaActual.fecha)] as const)
      );
      setDisponibilidad(Object.fromEntries(entradas));
    } catch {
      setError("No se pudo cargar la disponibilidad de canchas.");
    } finally {
      setCargando(false);
    }
  }

  function cambiarDia(idx: number) {
    setDiaIdx(idx);
    setSeleccion(null);
  }

  function elegirHorario(cancha: CanchaDto, hora: string) {
    setSeleccion({ canchaId: cancha.id, canchaNombre: cancha.nombre, hora, precioHora: cancha.precioHora });
  }

  async function confirmarReserva() {
    if (!seleccion) return;
    setConfirmando(true);
    setError("");
    try {
      const reserva = await crearReserva({
        canchaId: seleccion.canchaId,
        fecha: aFechaISO(diaActual.fecha),
        horaEntrada: conSegundos(seleccion.hora),
        horaSalida: conSegundos(sumarHora(seleccion.hora)),
        articulos: [],
      });
      setSeleccion(null);
      navigate(`/reservas/confirmacion/${reserva.id}`, { state: { reserva } });
    } catch (err) {
      setError(mensajeError(err, "No se pudo confirmar la reserva. Intenta de nuevo."));
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-7 px-7 pb-20 pt-9">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[28px] font-semibold tracking-[-0.02em]">Hola</h1>
        <p className="m-0 text-[15px] text-ink-muted">
          Reserva tu cancha de fútbol. Elige un día y un horario disponible.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-medium uppercase tracking-[.06em] text-ink-faint">Selecciona un día</span>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {dias.map((d, i) => (
            <button
              key={d.label}
              onClick={() => cambiarDia(i)}
              className={`flex min-w-[60px] flex-col items-center gap-[3px] rounded-[11px] border px-1.5 py-3 transition-all ${
                i === diaIdx
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-line bg-surface text-ink-secondary"
              }`}
            >
              <span className="text-[11px] uppercase tracking-[.05em] opacity-70">{d.dow}</span>
              <span className="text-[19px] font-semibold">{d.num}</span>
              <span className="text-[11px] opacity-70">{d.mon}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-negative">{error}</p>}

      <div className="grid grid-cols-[1fr_320px] items-start gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold">Canchas disponibles</span>
            <span className="text-[13px] text-ink-faint">{diaActual.label}</span>
          </div>

          {cargando ? (
            <div className="text-sm text-ink-faint">Cargando disponibilidad...</div>
          ) : (
            canchas.map((c) => (
              <div key={c.id} className="flex flex-col gap-4 rounded-[14px] border border-line bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[11px] border border-line-strong bg-[repeating-linear-gradient(135deg,var(--color-hover)_0_6px,var(--color-surface-sunken)_6px_12px)]">
                      <span className="font-mono text-[7px] text-ink-disabled">FOTO</span>
                    </div>
                    <div className="flex flex-col gap-[5px]">
                      <span className="text-base font-semibold">{c.nombre}</span>
                      <span className="text-[13px] text-ink-muted">{c.descripcion}</span>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-[13px] text-ink-secondary">
                    {formatoMoneda(c.precioHora)} / hora
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(disponibilidad[c.id] ?? []).map((franja) => {
                    const isSel = seleccion?.canchaId === c.id && seleccion?.hora === franja.hora;
                    return (
                      <button
                        key={franja.hora}
                        disabled={!franja.disponible}
                        onClick={() => elegirHorario(c, franja.hora)}
                        className={`h-9 min-w-[58px] rounded-lg px-3 text-[13px] font-medium transition-all ${
                          !franja.disponible
                            ? "cursor-not-allowed border border-hover-strong bg-surface-raised text-ink-ghost line-through"
                            : isSel
                            ? "border border-brand bg-brand text-brand-foreground"
                            : "border border-line-strong bg-hover text-ink-secondary hover:border-line-hover"
                        }`}
                      >
                        {franja.hora}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sticky top-[88px] mt-[37px] flex flex-col gap-4 rounded-[14px] border border-line bg-surface p-5">
          <span className="text-[15px] font-semibold">Tu reserva</span>

          {seleccion ? (
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-2.5 rounded-[10px] border border-line bg-page p-3.5">
                <Fila label="Cancha" valor={seleccion.canchaNombre} />
                <Fila label="Día" valor={diaActual.label} />
                <Fila label="Horario" valor={`${seleccion.hora} – ${sumarHora(seleccion.hora)}`} />
                <div className="my-0.5 h-px bg-line" />
                <div className="flex justify-between gap-2.5">
                  <span className="text-[13px] text-ink-faint">Total</span>
                  <span className="text-[15px] font-semibold">{formatoMoneda(seleccion.precioHora)}</span>
                </div>
              </div>
              <button
                onClick={confirmarReserva}
                disabled={confirmando}
                className="h-[42px] rounded-[9px] border-none bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
              >
                {confirmando ? "Confirmando..." : "Confirmar reserva"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-dashed border-ink-ghost">
                <span className="text-base text-ink-disabled">+</span>
              </div>
              <p className="m-0 max-w-[200px] text-[13px] leading-relaxed text-ink-faint">
                Selecciona un horario disponible para ver el resumen de tu reserva.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between gap-2.5">
      <span className="text-[13px] text-ink-faint">{label}</span>
      <span className="text-right text-[13px] font-medium">{valor}</span>
    </div>
  );
}

export default ReservarPage;