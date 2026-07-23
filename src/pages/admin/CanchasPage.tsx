import { useEffect, useState } from "react";

interface CanchaRow {
  id: number;
  nombre: string;
  tipo: string;
  precioPorHora: number;
  activa: boolean;
  reservasHoy: number;
}

const CANCHAS_MOCK: CanchaRow[] = [
  { id: 1, nombre: "Cancha 1", tipo: "Fútbol 7 · Sintético", precioPorHora: 800, activa: true, reservasHoy: 8 },
  { id: 2, nombre: "Cancha 2", tipo: "Fútbol 7 · Sintético", precioPorHora: 800, activa: true, reservasHoy: 6 },
  { id: 3, nombre: "Cancha 3", tipo: "Fútbol 5 · Techada", precioPorHora: 1000, activa: false, reservasHoy: 0 },
];

function formatoMoneda(n: number) {
  return "L " + n.toLocaleString("en-US");
}

function CanchasPage() {
  const [canchas, setCanchas] = useState<CanchaRow[]>([]);

  useEffect(() => {
    // TODO: reemplazar por obtenerCanchas() del backend cuando esté listo
    setCanchas(CANCHAS_MOCK);
  }, []);

  function toggleActiva(id: number) {
    setCanchas((prev) => prev.map((c) => (c.id === id ? { ...c, activa: !c.activa } : c)));
    // TODO: llamar a CambiarEstado cuando exista el endpoint
  }

  const activasCount = canchas.filter((c) => c.activa).length;
  const stats = [
    { label: "Canchas activas", value: `${activasCount} / ${canchas.length}`, delta: "En operación", color: "#71717a" },
    { label: "Reservas hoy", value: "14", delta: "+3 vs. ayer", color: "#7fd970" },
    { label: "Ingresos hoy", value: "L 11,200", delta: "+8% vs. ayer", color: "#7fd970" },
    { label: "Ocupación", value: "72%", delta: "Franja pico 18–21h", color: "#71717a" },
  ];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-4 border-b border-[#1f1f22] bg-[#09090b]/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">Gestión de canchas</span>
        <div className="flex items-center gap-3">
          <div className="flex h-[34px] min-w-[200px] items-center gap-2 rounded-lg border border-[#27272a] bg-[#0c0c0e] px-3 text-[13px] text-[#52525b]">
            <span className="font-mono">⌕</span>Buscar cancha...
          </div>
          <button className="h-[34px] rounded-lg border-none bg-[#329e26] px-3.5 text-[13px] font-semibold text-[#f0fdf4] hover:bg-[#3aad2c]">
            + Nueva cancha
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
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

          <div className="grid grid-cols-[2.2fr_1.4fr_1fr_1.1fr_1fr_auto] items-center gap-4 border-b border-[#1f1f22] bg-[#0a0a0c] px-5 py-3">
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">Cancha</span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">Tipo</span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">Precio/h</span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">Estado</span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">Reservas hoy</span>
            <span className="text-right text-[11px] uppercase tracking-[.06em] text-[#71717a]">Acciones</span>
          </div>

          {canchas.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[2.2fr_1.4fr_1fr_1.1fr_1fr_auto] items-center gap-4 border-b border-[#141417] px-5 py-3.5 transition-colors hover:bg-[#0e0e11]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[9px] border border-[#27272a] bg-[repeating-linear-gradient(135deg,#141417_0_6px,#0e0e11_6px_12px)]">
                  <span className="font-mono text-[6px] text-[#52525b]">FOTO</span>
                </div>
                <span className="text-sm font-medium">{c.nombre}</span>
              </div>
              <span className="text-[13px] text-[#a1a1aa]">{c.tipo}</span>
              <span className="font-mono text-sm font-medium">{formatoMoneda(c.precioPorHora)}</span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => toggleActiva(c.id)}
                  className="relative h-[22px] w-[38px] rounded-full border-none transition-colors"
                  style={{ background: c.activa ? "#329e26" : "#27272a" }}
                >
                  <span
                    className="absolute top-[3px] h-4 w-4 rounded-full bg-[#fafafa] transition-all"
                    style={{ left: c.activa ? "19px" : "3px" }}
                  />
                </button>
                <span className="text-xs font-medium" style={{ color: c.activa ? "#7fd970" : "#71717a" }}>
                  {c.activa ? "Activa" : "Inactiva"}
                </span>
              </div>
              <span className="text-sm font-medium">{c.reservasHoy}</span>
              <div className="flex items-center justify-end gap-1.5">
                <button className="h-8 rounded-lg border border-[#27272a] bg-transparent px-3 text-[13px] font-medium text-[#e4e4e7] hover:border-[#3f3f46] hover:bg-[#18181b]">
                  Editar
                </button>
                <button className="h-8 w-8 rounded-lg border border-[#27272a] bg-transparent text-[15px] text-[#71717a] hover:bg-[#18181b] hover:text-[#e4e4e7]">
                  ⋯
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default CanchasPage;