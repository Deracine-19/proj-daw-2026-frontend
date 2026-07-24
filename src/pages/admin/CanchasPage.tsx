import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  obtenerCanchas,
  crearCancha,
  actualizarCancha,
  cambiarEstadoCancha,
} from "@/services/canchaService";
import type { CanchaDto } from "@/types/cancha";

function formatoMoneda(n: number) {
  return "L " + n.toLocaleString("en-US");
}

const FORM_VACIO = { nombre: "", descripcion: "", precioHora: 0, cantidadJugadores: 0 };

type ColumnaOrdenable = "nombre" | "cantidadJugadores" | "precioHora" | "estado";

function compararValores(a: CanchaDto, b: CanchaDto, columna: ColumnaOrdenable): number {
  switch (columna) {
    case "nombre":
      return a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
    case "estado":
      return Number(a.estado) - Number(b.estado);
    case "cantidadJugadores":
      return a.cantidadJugadores - b.cantidadJugadores;
    case "precioHora":
      return a.precioHora - b.precioHora;
  }
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

function CanchasPage() {
  const [canchas, setCanchas] = useState<CanchaDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [ordenColumna, setOrdenColumna] = useState<ColumnaOrdenable | null>(null);
  const [ordenDireccion, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  const [editando, setEditando] = useState<CanchaDto | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [creando, setCreando] = useState(false);
  const [formNueva, setFormNueva] = useState(FORM_VACIO);
  const [creandoGuardando, setCreandoGuardando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      setCanchas(await obtenerCanchas());
    } catch {
      setError("No se pudo cargar la lista de canchas.");
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

  function abrirEdicion(c: CanchaDto) {
    setEditando(c);
    setForm({
      nombre: c.nombre,
      descripcion: c.descripcion,
      precioHora: c.precioHora,
      cantidadJugadores: c.cantidadJugadores,
    });
  }

  async function guardarEdicion() {
    if (!editando) return;
    setGuardando(true);
    try {
      const actualizado = await actualizarCancha(editando.id, { ...form, estado: editando.estado });
      setCanchas((prev) => prev.map((c) => (c.id === actualizado.id ? actualizado : c)));
      setEditando(null);
    } catch {
      setError("No se pudo guardar el cambio.");
    } finally {
      setGuardando(false);
    }
  }

  async function crear() {
    setCreandoGuardando(true);
    try {
      const nueva = await crearCancha({ ...formNueva, estado: true });
      setCanchas((prev) => [...prev, nueva]);
      setCreando(false);
      setFormNueva(FORM_VACIO);
    } catch {
      setError("No se pudo crear la cancha.");
    } finally {
      setCreandoGuardando(false);
    }
  }

  async function toggleEstado(c: CanchaDto) {
    try {
      const actualizado = await cambiarEstadoCancha(c.id);
      setCanchas((prev) => prev.map((x) => (x.id === actualizado.id ? actualizado : x)));
      toast.success(
        actualizado.estado ? `Cancha ${actualizado.nombre} habilitada` : `Cancha ${actualizado.nombre} deshabilitada`
      );
    } catch {
      setError("No se pudo cambiar el estado de la cancha.");
      toast.error(`No se pudo cambiar el estado de ${c.nombre}.`);
    }
  }

  const canchasOrdenadas = ordenColumna
    ? [...canchas].sort((a, b) => {
        const resultado = compararValores(a, b, ordenColumna);
        return ordenDireccion === "asc" ? resultado : -resultado;
      })
    : canchas;

  const activasCount = canchas.filter((c) => c.estado).length;
  const stats = [
    { label: "Canchas activas", value: `${activasCount} / ${canchas.length}`, delta: "En operación" },
    { label: "Reservas hoy", value: "—", delta: "Pendiente de conectar" },
    { label: "Ingresos hoy", value: "—", delta: "Pendiente de conectar" },
    { label: "Ocupación", value: "—", delta: "Pendiente de conectar" },
  ];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-4 border-b border-line bg-page/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">Gestión de canchas</span>
        <button
          onClick={() => setCreando(true)}
          className="h-[34px] rounded-lg border-none bg-brand px-3.5 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
        >
          + Nueva cancha
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-surface p-[18px]">
              <span className="text-xs uppercase tracking-[.06em] text-ink-faint">{s.label}</span>
              <span className="text-[26px] font-semibold tracking-[-0.02em]">{s.value}</span>
              <span className="text-xs font-medium text-ink-faint">{s.delta}</span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="text-[15px] font-semibold">Canchas</span>
            <span className="text-[13px] text-ink-faint">{canchasOrdenadas.length} canchas registradas</span>
          </div>

          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-line bg-surface-raised px-5 py-3">
            <EncabezadoOrdenable label="Cancha" columna="nombre" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Jugadores" columna="cantidadJugadores" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Precio/h" columna="precioHora" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Estado" columna="estado" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <span className="text-[11px] uppercase tracking-[.06em] text-ink-faint"></span>
            <span className="text-right text-[11px] uppercase tracking-[.06em] text-ink-faint">Acciones</span>
          </div>

          {cargando ? (
            <div className="px-5 py-6 text-sm text-ink-faint">Cargando canchas...</div>
          ) : (
            canchasOrdenadas.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-line-subtle px-5 py-3.5 transition-colors hover:bg-surface-sunken"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{c.nombre}</span>
                  <span className="text-xs text-ink-faint">{c.descripcion}</span>
                </div>
                <span className="text-[13px] text-ink-muted">{c.cantidadJugadores}</span>
                <span className="font-mono text-sm font-medium">{formatoMoneda(c.precioHora)}</span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleEstado(c)}
                    className="relative h-[22px] w-[38px] rounded-full border-none transition-colors"
                    style={{ background: c.estado ? "var(--color-brand)" : "var(--color-line-strong)" }}
                  >
                    <span
                      className="absolute top-[3px] h-4 w-4 rounded-full bg-ink transition-all"
                      style={{ left: c.estado ? "19px" : "3px" }}
                    />
                  </button>
                  <span
                    className="text-xs font-medium"
                    style={{ color: c.estado ? "var(--color-positive)" : "var(--color-ink-faint)" }}
                  >
                    {c.estado ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <span />
                <div className="flex justify-end">
                  <button
                    onClick={() => abrirEdicion(c)}
                    className="h-8 rounded-lg border border-line-strong bg-transparent px-3 text-[13px] font-medium text-ink-secondary hover:border-line-hover hover:bg-hover-strong"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {editando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold">Editar cancha</h2>
            <div className="flex flex-col gap-4">
              <Campo label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
              <Campo label="Descripción" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} />
              <CampoNumero label="Precio por hora" value={form.precioHora} onChange={(v) => setForm({ ...form, precioHora: v })} sinContador />
              <CampoNumero label="Cantidad de jugadores" value={form.cantidadJugadores} onChange={(v) => setForm({ ...form, cantidadJugadores: v })} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditando(null)} className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong">
                Cancelar
              </button>
              <button onClick={guardarEdicion} disabled={guardando} className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60">
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {creando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold">Nueva cancha</h2>
            <div className="flex flex-col gap-4">
              <Campo label="Nombre" value={formNueva.nombre} onChange={(v) => setFormNueva({ ...formNueva, nombre: v })} />
              <Campo label="Descripción" value={formNueva.descripcion} onChange={(v) => setFormNueva({ ...formNueva, descripcion: v })} />
              <CampoNumero label="Precio por hora" value={formNueva.precioHora} onChange={(v) => setFormNueva({ ...formNueva, precioHora: v })} sinContador />
              <CampoNumero label="Cantidad de jugadores" value={formNueva.cantidadJugadores} onChange={(v) => setFormNueva({ ...formNueva, cantidadJugadores: v })} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCreando(false)} className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong">
                Cancelar
              </button>
              <button onClick={crear} disabled={creandoGuardando} className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60">
                {creandoGuardando ? "Creando..." : "Crear cancha"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[42px] rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
      />
    </div>
  );
}

function CampoNumero({ label, value, onChange, sinContador = false }: { label: string; value: number; onChange: (v: number) => void; sinContador?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-[42px] rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled ${
          sinContador ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" : ""
        }`}
      />
    </div>
  );
}

export default CanchasPage;