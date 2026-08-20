import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { obtenerMisReservas, type ReservaDto } from "@/services/reservaService";
import BotonExportar from "@/components/BotonExportar";

const ESTADO_COLOR: Record<string, string> = {
  CONFIRMADA: "var(--color-positive)",
  CANCELADA: "var(--color-ink-faint)",
  NOSHOW: "var(--color-negative)",
};

function formatoEstado(estado: string): string {
  if (estado === "NOSHOW") return "No-Show";
  return estado.charAt(0) + estado.slice(1).toLowerCase();
}

function formatoFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${dia} ${meses[mes - 1]} ${anio}`;
}

function formatoHora(hora: string): string {
  return hora.slice(0, 5);
}

function formatoMoneda(n: number): string {
  return "L " + n.toLocaleString("en-US");
}

function MisReservasPage() {
  const [reservas, setReservas] = useState<ReservaDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());

  useEffect(() => {
    cargar();
  }, []);

  function toggleExpandida(id: number) {
    setExpandidas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      setReservas(await obtenerMisReservas());
    } catch {
      setError("No se pudo cargar tus reservas.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-7 px-7 pb-20 pt-9">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[28px] font-semibold tracking-[-0.02em]">Mis reservas</h1>
          <p className="m-0 text-[15px] text-ink-muted">Historial de tus reservaciones y su estado actual.</p>
        </div>
        {reservas.length > 0 && (
          <BotonExportar url="/reportes/exportar/mis-reservas" nombreDato="mis-reservas" hayDatos={reservas.length > 0} />
        )}
      </div>

      {error && <p className="text-sm text-negative">{error}</p>}

      {cargando ? (
        <div className="text-sm text-ink-faint">Cargando tus reservas...</div>
      ) : reservas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-line-strong px-5 py-16 text-center">
          <p className="m-0 text-sm text-ink-muted">Todavía no tienes reservas.</p>
          <Link
            to="/reservas"
            className="rounded-lg border-none bg-brand px-3.5 py-2 text-[13px] font-semibold text-brand-foreground no-underline hover:bg-brand-hover"
          >
            Reservar una cancha
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reservas.map((r) => {
            const tieneArticulos = r.articulos.length > 0;
            const expandida = expandidas.has(r.id);

            return (
              <div key={r.id} className="overflow-hidden rounded-[14px] border border-line bg-surface">
                <button
                  type="button"
                  onClick={() => tieneArticulos && toggleExpandida(r.id)}
                  disabled={!tieneArticulos}
                  className={`flex w-full items-center justify-between gap-4 p-5 text-left ${
                    tieneArticulos ? "cursor-pointer hover:bg-surface-sunken" : "cursor-default"
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-semibold">{r.nombreCancha ?? "—"}</span>
                      <span className="font-mono text-xs text-ink-faint">{r.codigoReserva}</span>
                    </div>
                    <span className="text-[13px] text-ink-muted">
                      {formatoFecha(r.fecha)} · {formatoHora(r.horaEntrada)} – {formatoHora(r.horaSalida)}
                    </span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-medium" style={{ color: ESTADO_COLOR[r.estadoReserva] ?? "var(--color-ink-muted)" }}>
                          {formatoEstado(r.estadoReserva)}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: r.estadoPago ? "var(--color-positive)" : "var(--color-ink-faint)" }}
                        >
                          {r.estadoPago ? "Pagado" : "Pendiente"}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-medium">{formatoMoneda(r.total)}</span>
                    </div>
                    {tieneArticulos && (
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 text-ink-faint transition-transform ${expandida ? "rotate-180" : ""}`}
                      />
                    )}
                  </div>
                </button>

                {expandida && tieneArticulos && (
                  <div className="flex flex-col gap-2 border-t border-line-subtle bg-page px-5 py-4">
                    <span className="text-[11px] uppercase tracking-[.06em] text-ink-faint">Artículos</span>
                    {r.articulos.map((a, i) => (
                      <div key={i} className="flex justify-between gap-2.5 text-[13px]">
                        <span className="text-ink-secondary">
                          {a.nombreArticulo ?? "Artículo"} × {a.cantidad}
                        </span>
                        <span className="font-mono text-ink-muted">{formatoMoneda(a.precioUnitario * a.cantidad)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default MisReservasPage;
