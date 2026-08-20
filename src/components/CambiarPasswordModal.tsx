import { useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { resetPassword } from "@/services/authService";

// El backend reutiliza el mismo endpoint que "olvidé mi contraseña" (valida "tempPassword"
// contra el hash actual antes de aceptar la nueva) — funciona igual de bien para un cambio
// voluntario estando logueado, pero su mensaje de error habla de una clave "temporal", que
// acá es simplemente la contraseña actual. Se reescribe para que tenga sentido en este contexto.
function mensajeError(err: unknown, fallback: string): string {
  if (isAxiosError(err) && typeof err.response?.data?.mensaje === "string") {
    const mensaje = err.response.data.mensaje as string;
    if (mensaje === "La contraseña temporal ingresada es incorrecta.") {
      return "La contraseña actual ingresada es incorrecta.";
    }
    return mensaje;
  }
  return fallback;
}

interface CambiarPasswordModalProps {
  email?: string;
  onClose: () => void;
}

function CambiarPasswordModal({ email, onClose }: CambiarPasswordModalProps) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!email) return;
    setError("");

    if (nueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (nueva !== confirmar) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setGuardando(true);
    try {
      await resetPassword({ email, tempPassword: actual, newPassword: nueva });
      toast.success("Contraseña actualizada.");
      onClose();
    } catch (err) {
      setError(mensajeError(err, "No se pudo actualizar la contraseña."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
        <h2 className="mb-4 text-base font-semibold">Cambiar contraseña</h2>
        <div className="flex flex-col gap-4">
          <Campo label="Contraseña actual" value={actual} onChange={setActual} />
          <Campo label="Contraseña nueva" value={nueva} onChange={setNueva} placeholder="Mínimo 6 caracteres" />
          <Campo label="Confirmar contraseña nueva" value={confirmar} onChange={setConfirmar} />
        </div>
        {error && <p className="mt-4 text-sm text-negative">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={guardando}
            className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minLength={6}
        className="h-10.5 rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none placeholder:text-ink-disabled focus:border-ink-disabled"
      />
    </div>
  );
}

export default CambiarPasswordModal;
