import { useEffect, useState } from "react";
import {
  obtenerReservas,
  cancelarReserva as apiCancelarReserva,
  marcarComoPagada as apiMarcarComoPagada,
  marcarComoNoShow as apiMarcarComoNoShow,
} from "@/services/reservaService";
import type { ReservaDto } from "@/services/reservaService";
import { toast } from "sonner";

const ESTADO_COLOR: Record<string, string> = {
  CONFIRMADA: "#7fd970",
  CANCELADA: "#71717a",
  NOSHOW: "#f87171",
};

function formatoEstado(estado: string): string {
  if (estado === "NOSHOW") return "No-Show";
  return estado.charAt(0) + estado.slice(1).toLowerCase();
}

type ColumnaOrdenable =
  | "nombreUsuario"
  | "nombreCancha"
  | "fecha"
  | "total"
  | "estadoReserva";

function compararValores(
  a: ReservaDto,
  b: ReservaDto,
  columna: ColumnaOrdenable,
): number {
  switch (columna) {
    case "nombreUsuario":
      return (a.nombreUsuario ?? "").localeCompare(
        b.nombreUsuario ?? "",
        "es",
        { sensitivity: "base" },
      );
    case "nombreCancha":
      return (a.nombreCancha ?? "").localeCompare(b.nombreCancha ?? "", "es", {
        sensitivity: "base",
      });
    case "fecha":
      return a.fecha.localeCompare(b.fecha);
    case "total":
      return a.total - b.total;
    case "estadoReserva":
      return a.estadoReserva.localeCompare(b.estadoReserva, "es", {
        sensitivity: "base",
      });
  }
}

function formatoFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
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
      className="flex items-center gap-1 text-[11px] uppercase tracking-[.06em] text-[#71717a] hover:text-[#a1a1aa]"
    >
      {label}
      <span className={activa ? "text-[#e4e4e7]" : "text-[#3f3f46]"}>
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
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const [ordenColumna, setOrdenColumna] = useState<ColumnaOrdenable | null>(
    null,
  );
  const [ordenDireccion, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  const [accionConfirmar, setAccionConfirmar] =
    useState<AccionConfirmar | null>(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [procesandoPagoId, setProcesandoPagoId] = useState<number | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      setReservas(await obtenerReservas());
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
  }

  async function marcarPagada(r: ReservaDto) {
    setProcesandoPagoId(r.id);
    setError("");
    try {
      const actualizado = await apiMarcarComoPagada(r.id);
      setReservas((prev) =>
        prev.map((x) => (x.id === actualizado.id ? actualizado : x)),
      );
      toast.success(
        `Reserva ${actualizado.codigoReserva ?? "cliente"} marcada como pagada`,
      );
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
        setReservas((prev) =>
          prev.map((r) =>
            r.id === accionConfirmar.reserva.id
              ? { ...r, estadoReserva: "CANCELADA" }
              : r,
          ),
        );
        toast.success(
          `Reserva ${accionConfirmar.reserva.codigoReserva ?? "cliente"} cancelada`,
        );
      } else {
        const actualizado = await apiMarcarComoNoShow(
          accionConfirmar.reserva.id,
        );
        setReservas((prev) =>
          prev.map((r) => (r.id === actualizado.id ? actualizado : r)),
        );
        toast.success(
          `Reserva ${actualizado.codigoReserva ?? "cliente"} marcada como No-Show`,
        );
      }
      setAccionConfirmar(null);
    } catch {
      setError(
        accionConfirmar.tipo === "cancelar"
          ? "No se pudo cancelar la reserva."
          : "No se pudo marcar como No-Show.",
      );
      toast.error(
        accionConfirmar.tipo === "cancelar"
          ? "No se pudo cancelar la reserva."
          : "No se pudo marcar como No-Show.",
      );
    } finally {
      setProcesandoAccion(false);
    }
  }

  const reservasFiltradas = reservas.filter((r) => {
    const coincideBusqueda =
      (r.nombreUsuario ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (r.nombreCancha ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
      r.codigoReserva.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = !filtroEstado || r.estadoReserva === filtroEstado;
    const coincideFecha = !filtroFecha || r.fecha === filtroFecha;
    return coincideBusqueda && coincideEstado && coincideFecha;
  });

  const reservasOrdenadas = ordenColumna
    ? [...reservasFiltradas].sort((a, b) => {
        const resultado = compararValores(a, b, ordenColumna);
        return ordenDireccion === "asc" ? resultado : -resultado;
      })
    : reservasFiltradas;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-4 border-b border-[#1f1f22] bg-[#09090b]/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">
          Gestión de reservas
        </span>
        <div className="flex items-center gap-3">
          <div className="flex h-[34px] min-w-[180px] items-center gap-2 rounded-lg border border-[#27272a] bg-[#0c0c0e] px-3 text-[13px] text-[#52525b]">
            <span className="font-mono">⌕</span>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Cliente, cancha o código..."
              className="w-full bg-transparent text-[#fafafa] outline-none placeholder:text-[#52525b]"
            />
          </div>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="h-[34px] rounded-lg border border-[#27272a] bg-[#0c0c0e] px-3 text-[13px] text-[#e4e4e7] outline-none"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="h-[34px] rounded-lg border border-[#27272a] bg-[#0c0c0e] px-3 text-[13px] text-[#e4e4e7] outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="NOSHOW">No-Show</option>
          </select>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="overflow-hidden rounded-[14px] border border-[#1f1f22] bg-[#0c0c0e]">
          <div className="flex items-center justify-between border-b border-[#1f1f22] px-5 py-4">
            <span className="text-[15px] font-semibold">Reservas</span>
            <span className="text-[13px] text-[#71717a]">
              {reservasOrdenadas.length} reservas
            </span>
          </div>

          <div className="grid grid-cols-[1.4fr_1.2fr_1.2fr_0.8fr_1fr_0.9fr_230px] items-center gap-3 border-b border-[#1f1f22] bg-[#0a0a0c] px-5 py-3">
            <EncabezadoOrdenable
              label="Cliente"
              columna="nombreUsuario"
              ordenColumna={ordenColumna}
              ordenDireccion={ordenDireccion}
              onClick={cambiarOrden}
            />
            <EncabezadoOrdenable
              label="Cancha"
              columna="nombreCancha"
              ordenColumna={ordenColumna}
              ordenDireccion={ordenDireccion}
              onClick={cambiarOrden}
            />
            <EncabezadoOrdenable
              label="Fecha"
              columna="fecha"
              ordenColumna={ordenColumna}
              ordenDireccion={ordenDireccion}
              onClick={cambiarOrden}
            />
            <EncabezadoOrdenable
              label="Total"
              columna="total"
              ordenColumna={ordenColumna}
              ordenDireccion={ordenDireccion}
              onClick={cambiarOrden}
            />
            <EncabezadoOrdenable
              label="Estado"
              columna="estadoReserva"
              ordenColumna={ordenColumna}
              ordenDireccion={ordenDireccion}
              onClick={cambiarOrden}
            />
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">
              Pago
            </span>
            <span className="text-right text-[11px] uppercase tracking-[.06em] text-[#71717a]">
              Acciones
            </span>
          </div>

          {cargando ? (
            <div className="px-5 py-6 text-sm text-[#71717a]">
              Cargando reservas...
            </div>
          ) : reservasOrdenadas.length === 0 ? (
            <div className="px-5 py-6 text-sm text-[#71717a]">
              No hay reservas que coincidan con los filtros.
            </div>
          ) : (
            reservasOrdenadas.map((r) => {
              const cancelada = r.estadoReserva === "CANCELADA";
              const noShow = r.estadoReserva === "NOSHOW";
              const cerrada = cancelada || noShow;
              const pasada = esPasada(r);

              return (
                <div
                  key={r.id}
                  className="grid grid-cols-[1.4fr_1.2fr_1.2fr_0.8fr_1fr_0.9fr_230px] items-center gap-3 border-b border-[#141417] px-5 py-3.5 transition-colors hover:bg-[#0e0e11]"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {r.nombreUsuario ?? "—"}
                    </span>
                    <span className="font-mono text-xs text-[#71717a]">
                      {r.codigoReserva}
                    </span>
                  </div>
                  <span className="text-[13px] text-[#a1a1aa]">
                    {r.nombreCancha ?? "—"}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[13px]">{formatoFecha(r.fecha)}</span>
                    <span className="text-xs text-[#71717a]">
                      {formatoHora(r.horaEntrada)} – {formatoHora(r.horaSalida)}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-medium">
                    {formatoMoneda(r.total)}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: ESTADO_COLOR[r.estadoReserva] ?? "#a1a1aa",
                    }}
                  >
                    {formatoEstado(r.estadoReserva)}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: r.estadoPago ? "#7fd970" : "#71717a" }}
                  >
                    {r.estadoPago ? "Pagado" : "Pendiente"}
                  </span>
                  <div className="flex items-center justify-end gap-1.5">
                    {cerrada ? (
                      <span className="text-xs text-[#3f3f46]">—</span>
                    ) : r.estadoPago ? (
                      <span className="text-xs text-[#3f3f46]">
                        Sin más acciones
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => marcarPagada(r)}
                          disabled={procesandoPagoId === r.id}
                          className="h-8 rounded-lg border-none bg-[#329e26] px-3 text-[13px] font-medium text-[#f0fdf4] hover:bg-[#3aad2c] disabled:opacity-60"
                        >
                          {procesandoPagoId === r.id ? "..." : "Marcar pagada"}
                        </button>
                        {pasada ? (
                          <button
                            onClick={() =>
                              setAccionConfirmar({
                                reserva: r,
                                tipo: "no-show",
                              })
                            }
                            className="h-8 rounded-lg border border-[#27272a] px-3 text-[13px] font-medium text-[#e4e4e7] hover:border-[#3f3f46] hover:bg-[#18181b]"
                          >
                            No-Show
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setAccionConfirmar({
                                reserva: r,
                                tipo: "cancelar",
                              })
                            }
                            className="h-8 rounded-lg border border-[#27272a] px-3 text-[13px] font-medium text-[#e4e4e7] hover:border-[#3f3f46] hover:bg-[#18181b]"
                          >
                            Cancelar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {accionConfirmar && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-[#1f1f22] bg-[#0c0c0e] p-6">
            <h2 className="mb-2 text-base font-semibold">
              {accionConfirmar.tipo === "cancelar"
                ? "Cancelar reserva"
                : "Marcar como No-Show"}
            </h2>
            <p className="mb-5 text-sm text-[#a1a1aa]">
              {accionConfirmar.tipo === "cancelar" ? (
                <>
                  ¿Confirmas cancelar la reserva de{" "}
                  <strong className="text-[#e4e4e7]">
                    {accionConfirmar.reserva.nombreUsuario}
                  </strong>{" "}
                  ({accionConfirmar.reserva.codigoReserva})? Esta acción no se
                  puede deshacer.
                </>
              ) : (
                <>
                  ¿Confirmas que{" "}
                  <strong className="text-[#e4e4e7]">
                    {accionConfirmar.reserva.nombreUsuario}
                  </strong>{" "}
                  no se presentó a su reserva (
                  {accionConfirmar.reserva.codigoReserva})?
                </>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAccionConfirmar(null)}
                className="h-9 rounded-lg border border-[#27272a] bg-transparent px-4 text-[13px] font-medium text-[#e4e4e7] hover:bg-[#18181b]"
              >
                Volver
              </button>
              <button
                onClick={ejecutarAccionConfirmada}
                disabled={procesandoAccion}
                className="h-9 rounded-lg border-none bg-red-600 px-4 text-[13px] font-semibold text-white hover:bg-red-500 disabled:opacity-60"
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
