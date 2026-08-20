import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { descargarCsv } from "@/lib/exportar";

interface BotonExportarProps {
  url: string;
  params?: Record<string, unknown>;
  nombreDato: string;
  etiqueta?: string;
  // Si no hay resultados que exportar (con los filtros actuales), el clic muestra un modal
  // en vez de generar un CSV vacío.
  hayDatos: boolean;
}

function BotonExportar({ url, params = {}, nombreDato, etiqueta = "Exportar", hayDatos }: BotonExportarProps) {
  const [exportando, setExportando] = useState(false);
  const [sinDatos, setSinDatos] = useState(false);

  async function exportar() {
    if (!hayDatos) {
      setSinDatos(true);
      return;
    }

    setExportando(true);
    try {
      await descargarCsv(url, params, nombreDato);
    } catch {
      toast.error("No se pudo generar el reporte. Intenta de nuevo.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <>
      <button
        onClick={exportar}
        disabled={exportando}
        className="flex h-[34px] items-center gap-1.5 rounded-lg border-none bg-brand px-3.5 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
      >
        <Download className="h-3.5 w-3.5" />
        {exportando ? "Exportando..." : etiqueta}
      </button>

      {sinDatos && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
            <h2 className="mb-2 text-base font-semibold">No hay datos para exportar</h2>
            <p className="mb-5 text-sm text-ink-muted">
              No se encontraron resultados con los filtros actuales — no hay nada que incluir en el CSV.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setSinDatos(false)}
                className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BotonExportar;
