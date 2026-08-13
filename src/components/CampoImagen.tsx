import { useState } from "react";
import { ImageOff } from "lucide-react";
import { IMAGEN_MAX_BYTES, leerArchivoComoBase64 } from "@/lib/imagen";

function CampoImagen({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [error, setError] = useState("");

  async function manejarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo si se corrige un error
    if (!archivo) return;

    setError("");
    if (!archivo.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    if (archivo.size > IMAGEN_MAX_BYTES) {
      setError("La imagen no puede pesar más de 2 MB.");
      return;
    }

    onChange(await leerArchivoComoBase64(archivo));
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">Imagen</label>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-line-strong bg-panel">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="h-5 w-5 text-ink-disabled" />
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <label className="cursor-pointer rounded-lg border border-line-strong bg-transparent px-3 py-1.5 text-[13px] font-medium text-ink-secondary hover:border-line-hover hover:bg-hover-strong">
            {value ? "Cambiar imagen" : "Subir imagen"}
            <input type="file" accept="image/*" onChange={manejarArchivo} className="hidden" />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[12px] text-ink-faint hover:text-negative"
            >
              Quitar imagen
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-negative">{error}</p>}
    </div>
  );
}

export default CampoImagen;
