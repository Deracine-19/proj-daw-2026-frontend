import { Fragment, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  obtenerReservas,
  cancelarReserva as apiCancelarReserva,
  marcarComoPagada as apiMarcarComoPagada,
  marcarComoNoShow as apiMarcarComoNoShow,
} from "@/services/reservaService";
import type { ReservaDto } from "@/services/reservaService";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectorRangoFechas from "@/components/SelectorRangoFechas";
import { calcularRango, type PresetRango, type RangoFechas } from "@/lib/rangoFechas";
import Paginador from "@/components/Paginador";
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

type ColumnaOrdenable = "nombreUsuario" | "nombreCancha" | "fecha" | "total" | "estadoReserva";

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

function esPasada(r: ReservaDto): boolean {
  const [anio, mes, dia] = r.fecha.split("-").map(Number);
  const [h, m] = r.horaEntrada.split(":").map(Number);
  const fechaHora = new Date(anio, mes - 1, dia, h, m);
  return fechaHora.getTime() < Date.now();
}

function EncabezadoOrdenable({
  label,
  columna,
  ordenColumna,
  ordenDireccion,
  onClick,
}: {
  label: string;
  columna: ColumnaOrdenable;
  ordenColumna: ColumnaOrdenable | null;
  ordenDireccion: "asc" | "desc";
  onClick: (columna: ColumnaOrdenable) => void;
}) {
  const activa = ordenColumna === columna;
  return (
    <button
      onClick={() => onClick(columna)}
      className="flex items-center gap-1 text-[11px] uppercase tracking-[.06em] text-ink-faint hover:text-ink-muted"
    >
      {label}
      <span className={activa ? "text-ink-secondary" : "text-ink-ghost"}>
        {activa ? (ordenDireccion === "asc" ? "▲" : "▼") : "▲"}
      </span>
    </button>
  );
}

interface AccionConfirmar {
  reserva: ReservaDto;
  tipo: "cancelar" | "no-show";
}

function ReservasPage() {
  const [reservas, setReservas] = useState<ReservaDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [rangoPreset, setRangoPreset] = useState<PresetRango>("hoy");
  const [rango, setRango] = useState<RangoFechas>(() => calcularRango("hoy"));

  const [ordenColumna, setOrdenColumna] = useState<ColumnaOrdenable | null>(null);
  const [ordenDireccion, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [accionConfirmar, setAccionConfirmar] = useState<AccionConfirmar | null>(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [procesandoPagoId, setProcesandoPagoId] = useState<number | null>(null);
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, busquedaDebounced, filtroEstado, rango, ordenColumna, ordenDireccion]);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const resultado = await obtenerReservas({
        page,
        pageSize,
        busqueda: busquedaDebounced || undefined,
        ordenarPor: ordenColumna ?? undefined,
        ordenDireccion,
        fechaInicio: rango.desde,
        fechaFin: rango.hasta,
        estado: filtroEstado || undefined,
      });
      setReservas(resultado.items);
      setTotalCount(resultado.totalCount);
      setTotalPages(resultado.totalPages);
    } catch {
      setError("No se pudo cargar la lista de reservas.");
    } finally {
      setCargando(false);
    }
  }

  function cambiarOrden(columna: ColumnaOrdenable) {
    if (ordenColumna === columna) {
      setOrdenDireccion((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setOrdenColumna(columna);
      setOrdenDireccion("asc");
    }
    setPage(1);
  }

  function cambiarRango(preset: PresetRango, nuevoRango: RangoFechas) {
    setRangoPreset(preset);
    setRango(nuevoRango);
    setPage(1);
  }

  function cambiarFiltroEstado(v: string) {
    setFiltroEstado(v);
    setPage(1);
  }

  function cambiarPageSize(nuevo: number) {
    setPageSize(nuevo);
    setPage(1);
  }

  function toggleExpandida(id: number) {
    setExpandidas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  async function marcarPagada(r: ReservaDto) {
    setProcesandoPagoId(r.id);
    setError("");
    try {
      const actualizado = await apiMarcarComoPagada(r.id);
      toast.success(`Reserva ${actualizado.codigoReserva} marcada como pagada`);
      await cargar();
    } catch {
      setError("No se pudo marcar la reserva como pagada.");
      toast.error("No se pudo marcar la reserva como pagada.");
    } finally {
      setProcesandoPagoId(null);
    }
  }

  async function ejecutarAccionConfirmada() {
    if (!accionConfirmar) return;
    setProcesandoAccion(true);
    setError("");
    try {
      if (accionConfirmar.tipo === "cancelar") {
        await apiCancelarReserva(accionConfirmar.reserva.id);
        toast.success(`Reserva ${accionConfirmar.reserva.codigoReserva} cancelada`);
      } else {
        const actualizado = await apiMarcarComoNoShow(accionConfirmar.reserva.id);
        toast.success(`Reserva ${actualizado.codigoReserva} marcada como No-Show`);
      }
      setAccionConfirmar(null);
      await cargar();
    } catch {
      setError(
        accionConfirmar.tipo === "cancelar" ? "No se pudo cancelar la reserva." : "No se pudo marcar como No-Show."
      );
      toast.error(
        accionConfirmar.tipo === "cancelar" ? "No se pudo cancelar la reserva." : "No se pudo marcar como No-Show."
      );
    } finally {
      setProcesandoAccion(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex min-h-[60px] flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line bg-page/80 px-7 py-3 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">Gestión de reservas</span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-[34px] min-w-[180px] items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[13px] text-ink-disabled">
            <span className="font-mono">⌕</span>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Cliente, cancha o código..."
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink-disabled"
            />
          </div>
          <SelectorRangoFechas preset={rangoPreset} rango={rango} onChange={cambiarRango} />
          <Select value={filtroEstado || "todos"} onValueChange={(v) => cambiarFiltroEstado(v === "todos" ? "" : v)}>
            <SelectTrigger
              style={{ height: "34px" }}
              className="rounded-lg border-line-strong bg-surface px-3 text-[13px] text-ink-secondary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
              <SelectItem value="NOSHOW">No-Show</SelectItem>
            </SelectContent>
          </Select>
          <BotonExportar
            url="/reportes/exportar/reservas"
            params={{
              busqueda: busquedaDebounced || undefined,
              ordenarPor: ordenColumna ?? undefined,
              ordenDireccion,
              fechaInicio: rango.desde,
              fechaFin: rango.hasta,
              estado: filtroEstado || undefined,
            }}
            hayDatos={totalCount > 0}
            nombreDato="reservas"
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="text-[15px] font-semibold">Reservas</span>
            <span className="text-[13px] text-ink-faint">{totalCount} reservas</span>
          </div>

          <div className="grid grid-cols-[28px_1.4fr_1.2fr_1.2fr_0.8fr_1fr_0.9fr_230px] items-center gap-3 border-b border-line bg-surface-raised px-5 py-3">
            <span />
            <EncabezadoOrdenable label="Cliente" columna="nombreUsuario" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Cancha" columna="nombreCancha" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Fecha" columna="fecha" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Total" columna="total" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Estado" columna="estadoReserva" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <span className="text-[11px] uppercase tracking-[.06em] text-ink-faint">Pago</span>
            <span className="text-right text-[11px] uppercase tracking-[.06em] text-ink-faint">Acciones</span>
          </div>

          {cargando ? (
            <div className="px-5 py-6 text-sm text-ink-faint">Cargando reservas...</div>
          ) : reservas.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink-faint">No hay reservas que coincidan con los filtros.</div>
          ) : (
            reservas.map((r) => {
              const cancelada = r.estadoReserva === "CANCELADA";
              const noShow = r.estadoReserva === "NOSHOW";
              const cerrada = cancelada || noShow;
              const pasada = esPasada(r);
              const tieneArticulos = r.articulos.length > 0;
              const expandida = expandidas.has(r.id);

              return (
                <Fragment key={r.id}>
                <div
                  className="grid grid-cols-[28px_1.4fr_1.2fr_1.2fr_0.8fr_1fr_0.9fr_230px] items-center gap-3 border-b border-line-subtle px-5 py-3.5 transition-colors hover:bg-surface-sunken"
                >
                  <button
                    type="button"
                    onClick={() => tieneArticulos && toggleExpandida(r.id)}
                    disabled={!tieneArticulos}
                    className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      tieneArticulos ? "text-ink-faint hover:bg-hover-strong hover:text-ink-secondary" : "cursor-default"
                    }`}
                  >
                    {tieneArticulos && (
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandida ? "rotate-180" : ""}`} />
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{r.nombreUsuario ?? "—"}</span>
                    <span className="font-mono text-xs text-ink-faint">{r.codigoReserva}</span>
                  </div>
                  <span className="text-[13px] text-ink-muted">{r.nombreCancha ?? "—"}</span>
                  <div className="flex flex-col">
                    <span className="text-[13px]">{formatoFecha(r.fecha)}</span>
                    <span className="text-xs text-ink-faint">
                      {formatoHora(r.horaEntrada)} – {formatoHora(r.horaSalida)}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-medium">{formatoMoneda(r.total)}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: ESTADO_COLOR[r.estadoReserva] ?? "var(--color-ink-muted)" }}
                  >
                    {formatoEstado(r.estadoReserva)}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: r.estadoPago ? "var(--color-positive)" : "var(--color-ink-faint)" }}
                  >
                    {r.estadoPago ? "Pagado" : "Pendiente"}
                  </span>
                  <div className="flex items-center justify-end gap-1.5">
                    {cerrada ? (
                      <span className="text-xs text-ink-ghost">—</span>
                    ) : r.estadoPago ? (
                      <span className="text-xs text-ink-ghost">Sin más acciones</span>
                    ) : (
                      <>
                        <button
                          onClick={() => marcarPagada(r)}
                          disabled={procesandoPagoId === r.id}
                          className="h-8 rounded-lg border-none bg-brand px-3 text-[13px] font-medium text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
                        >
                          {procesandoPagoId === r.id ? "..." : "Marcar pagada"}
                        </button>
                        {pasada ? (
                          <button
                            onClick={() => setAccionConfirmar({ reserva: r, tipo: "no-show" })}
                            className="h-8 rounded-lg border border-line-strong px-3 text-[13px] font-medium text-ink-secondary hover:border-line-hover hover:bg-hover-strong"
                          >
                            No-Show
                          </button>
                        ) : (
                          <button
                            onClick={() => setAccionConfirmar({ reserva: r, tipo: "cancelar" })}
                            className="h-8 rounded-lg border border-line-strong px-3 text-[13px] font-medium text-ink-secondary hover:border-line-hover hover:bg-hover-strong"
                          >
                            Cancelar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {expandida && tieneArticulos && (
                  <div className="border-b border-line-subtle bg-page px-5 py-4 pl-[52px]">
                    <span className="mb-2 block text-[11px] uppercase tracking-[.06em] text-ink-faint">Artículos</span>
                    <div className="flex flex-col gap-1.5">
                      {r.articulos.map((a, i) => (
                        <div key={i} className="flex justify-between gap-2.5 text-[13px]">
                          <span className="text-ink-secondary">
                            {a.nombreArticulo ?? "Artículo"} × {a.cantidad}
                          </span>
                          <span className="font-mono text-ink-muted">{formatoMoneda(a.precioUnitario * a.cantidad)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </Fragment>
              );
            })
          )}

          <Paginador
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={cambiarPageSize}
          />
        </div>
      </main>

      {accionConfirmar && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
            <h2 className="mb-2 text-base font-semibold">
              {accionConfirmar.tipo === "cancelar" ? "Cancelar reserva" : "Marcar como No-Show"}
            </h2>
            <p className="mb-5 text-sm text-ink-muted">
              {accionConfirmar.tipo === "cancelar" ? (
                <>
                  ¿Confirmas cancelar la reserva de{" "}
                  <strong className="text-ink-secondary">{accionConfirmar.reserva.nombreUsuario}</strong> (
                  {accionConfirmar.reserva.codigoReserva})? Esta acción no se puede deshacer.
                </>
              ) : (
                <>
                  ¿Confirmas que <strong className="text-ink-secondary">{accionConfirmar.reserva.nombreUsuario}</strong>{" "}
                  no se presentó a su reserva ({accionConfirmar.reserva.codigoReserva})?
                </>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAccionConfirmar(null)}
                className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong"
              >
                Volver
              </button>
              <button
                onClick={ejecutarAccionConfirmada}
                disabled={procesandoAccion}
                className="h-9 rounded-lg border-none bg-negative-strong px-4 text-[13px] font-semibold text-white hover:bg-negative-strong-hover disabled:opacity-60"
              >
                {procesandoAccion ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReservasPage;
