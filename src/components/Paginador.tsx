import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TAMANOS_PAGINA = [10, 20, 50, 100];
const TAMANO_PAGINA_MAXIMO = 200;

interface PaginadorProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function Paginador({ page, pageSize, totalCount, totalPages, onPageChange, onPageSizeChange }: PaginadorProps) {
  // No basta con derivar esto de `pageSize`: al elegir "Personalizado" el tamaño de página
  // todavía no cambió (el usuario ni ha escrito un número), así que sin este estado propio
  // el <select> volvía a caer en un tamaño de la lista y el input nunca aparecía.
  const [modoPersonalizado, setModoPersonalizado] = useState(!TAMANOS_PAGINA.includes(pageSize));
  const mostrarInputPersonalizado = modoPersonalizado || !TAMANOS_PAGINA.includes(pageSize);
  const desde = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, totalCount);

  function manejarCambioTamano(v: string) {
    if (v === "custom") {
      setModoPersonalizado(true);
    } else {
      setModoPersonalizado(false);
      onPageSizeChange(Number(v));
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
      <div className="flex items-center gap-2.5 text-[13px] text-ink-faint">
        <span>
          Mostrando {desde}–{hasta} de {totalCount}
        </span>
        <span className="text-ink-ghost">·</span>
        <span>Filas por página</span>
        <Select
          value={mostrarInputPersonalizado ? "custom" : String(pageSize)}
          onValueChange={manejarCambioTamano}
        >
          <SelectTrigger
            style={{ height: "30px" }}
            className="w-auto rounded-md border-line-strong bg-surface px-2.5 text-[13px] text-ink-secondary"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAMANOS_PAGINA.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
        {mostrarInputPersonalizado && (
          <input
            type="number"
            min={1}
            max={TAMANO_PAGINA_MAXIMO}
            value={pageSize}
            autoFocus
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v > 0) onPageSizeChange(Math.min(v, TAMANO_PAGINA_MAXIMO));
            }}
            className="h-[30px] w-16 rounded-md border border-line-strong bg-panel px-2 text-[13px] text-ink outline-none focus:border-ink-disabled"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong text-ink-secondary hover:border-line-hover hover:bg-hover-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[13px] text-ink-secondary">
          Página {totalPages === 0 ? 0 : page} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong text-ink-secondary hover:border-line-hover hover:bg-hover-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Paginador;
