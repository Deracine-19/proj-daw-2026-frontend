import { useEffect, useState } from "react";
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

function CanchasPage() {
  const [canchas, setCanchas] = useState<CanchaDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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
    } catch {
      setError("No se pudo cambiar el estado de la cancha.");
    }
  }

  const activasCount = canchas.filter((c) => c.estado).length;
  const stats = [
    { label: "Canchas activas", value: `${activasCount} / ${canchas.length}`, delta: "En operación", color: "#71717a" },
    { label: "Reservas hoy", value: "—", delta: "Pendiente de conectar", color: "#71717a" },
    { label: "Ingresos hoy", value: "—", delta: "Pendiente de conectar", color: "#71717a" },
    { label: "Ocupación", value: "—", delta: "Pendiente de conectar", color: "#71717a" },
  ];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-4 border-b border-[#1f1f22] bg-[#09090b]/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">Gestión de canchas</span>
        <button
          onClick={() => setCreando(true)}
          className="h-[34px] rounded-lg border-none bg-[#329e26] px-3.5 text-[13px] font-semibold text-[#f0fdf4] hover:bg-[#3aad2c]"
        >
          + Nueva cancha
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-2.5 rounded-[14px] border border-[#1f1f22] bg-[#0c0c0e] p-[18px]">
              <span className="text-xs uppercase tracking-[.06em] text-[#71717a]">{s.label}</span>
              <span className="text-[26px] font-semibold tracking-[-0.02em]">{s.value}</span>
              <span className="text-xs font-medium" style={{ color: s.color }}>{s.delta}</span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[#1f1f22] bg-[#0c0c0e]">
          <div className="flex items-center justify-between border-b border-[#1f1f22] px-5 py-4">
            <span className="text-[15px] font-semibold">Canchas</span>
            <span className="text-[13px] text-[#71717a]">{canchas.length} canchas registradas</span>
          </div>

          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-[#1f1f22] bg-[#0a0a0c] px-5 py-3">
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">Cancha</span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">Jugadores</span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">Precio/h</span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">Estado</span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]"></span>
            <span className="text-right text-[11px] uppercase tracking-[.06em] text-[#71717a]">Acciones</span>
          </div>

          {cargando ? (
            <div className="px-5 py-6 text-sm text-[#71717a]">Cargando canchas...</div>
          ) : (
            canchas.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-[#141417] px-5 py-3.5 transition-colors hover:bg-[#0e0e11]"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{c.nombre}</span>
                  <span className="text-xs text-[#71717a]">{c.descripcion}</span>
                </div>
                <span className="text-[13px] text-[#a1a1aa]">{c.cantidadJugadores}</span>
                <span className="font-mono text-sm font-medium">{formatoMoneda(c.precioHora)}</span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleEstado(c)}
                    className="relative h-[22px] w-[38px] rounded-full border-none transition-colors"
                    style={{ background: c.estado ? "#329e26" : "#27272a" }}
                  >
                    <span
                      className="absolute top-[3px] h-4 w-4 rounded-full bg-[#fafafa] transition-all"
                      style={{ left: c.estado ? "19px" : "3px" }}
                    />
                  </button>
                  <span className="text-xs font-medium" style={{ color: c.estado ? "#7fd970" : "#71717a" }}>
                    {c.estado ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <span />
                <div className="flex justify-end">
                  <button
                    onClick={() => abrirEdicion(c)}
                    className="h-8 rounded-lg border border-[#27272a] bg-transparent px-3 text-[13px] font-medium text-[#e4e4e7] hover:border-[#3f3f46] hover:bg-[#18181b]"
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
          <div className="w-full max-w-sm rounded-[14px] border border-[#1f1f22] bg-[#0c0c0e] p-6">
            <h2 className="mb-4 text-base font-semibold">Editar cancha</h2>
            <div className="flex flex-col gap-4">
              <Campo label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
              <Campo label="Descripción" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} />
              <CampoNumero label="Precio por hora" value={form.precioHora} onChange={(v) => setForm({ ...form, precioHora: v })} />
              <CampoNumero label="Cantidad de jugadores" value={form.cantidadJugadores} onChange={(v) => setForm({ ...form, cantidadJugadores: v })} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditando(null)} className="h-9 rounded-lg border border-[#27272a] bg-transparent px-4 text-[13px] font-medium text-[#e4e4e7] hover:bg-[#18181b]">
                Cancelar
              </button>
              <button onClick={guardarEdicion} disabled={guardando} className="h-9 rounded-lg border-none bg-[#329e26] px-4 text-[13px] font-semibold text-[#f0fdf4] hover:bg-[#3aad2c] disabled:opacity-60">
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {creando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-[#1f1f22] bg-[#0c0c0e] p-6">
            <h2 className="mb-4 text-base font-semibold">Nueva cancha</h2>
            <div className="flex flex-col gap-4">
              <Campo label="Nombre" value={formNueva.nombre} onChange={(v) => setFormNueva({ ...formNueva, nombre: v })} />
              <Campo label="Descripción" value={formNueva.descripcion} onChange={(v) => setFormNueva({ ...formNueva, descripcion: v })} />
              <CampoNumero label="Precio por hora" value={formNueva.precioHora} onChange={(v) => setFormNueva({ ...formNueva, precioHora: v })} />
              <CampoNumero label="Cantidad de jugadores" value={formNueva.cantidadJugadores} onChange={(v) => setFormNueva({ ...formNueva, cantidadJugadores: v })} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCreando(false)} className="h-9 rounded-lg border border-[#27272a] bg-transparent px-4 text-[13px] font-medium text-[#e4e4e7] hover:bg-[#18181b]">
                Cancelar
              </button>
              <button onClick={crear} disabled={creandoGuardando} className="h-9 rounded-lg border-none bg-[#329e26] px-4 text-[13px] font-semibold text-[#f0fdf4] hover:bg-[#3aad2c] disabled:opacity-60">
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
      <label className="text-[13px] font-medium text-[#e4e4e7]">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none focus:border-[#52525b]"
      />
    </div>
  );
}

function CampoNumero({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-[#e4e4e7]">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none focus:border-[#52525b]"
      />
    </div>
  );
}

export default CanchasPage;