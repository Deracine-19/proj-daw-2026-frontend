import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { descargarCsv } from "@/lib/exportar";

interface BotonExportarProps {
  url: string;
  params?: Record<string, unknown>;
  nombreDato: string;
  etiqueta?: string;
}

function BotonExportar({ url, params = {}, nombreDato, etiqueta = "Exportar" }: BotonExportarProps) {
  const [exportando, setExportando] = useState(false);

  async function exportar() {
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
    <button
      onClick={exportar}
      disabled={exportando}
      className="flex h-[34px] items-center gap-1.5 rounded-lg border-none bg-brand px-3.5 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
    >
      <Download className="h-3.5 w-3.5" />
      {exportando ? "Exportando..." : etiqueta}
    </button>
  );
}

export default BotonExportar;
