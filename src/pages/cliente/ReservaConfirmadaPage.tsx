import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { obtenerReservaPorId, type ReservaDto } from "@/services/reservaService";

function ReservaConfirmadaPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const reservaDeNavegacion = (location.state as { reserva?: ReservaDto } | null)?.reserva ?? null;
  const [reserva, setReserva] = useState<ReservaDto | null>(reservaDeNavegacion);
  const [cargando, setCargando] = useState(!reservaDeNavegacion);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reservaDeNavegacion || !id) return;
    cargarReserva(Number(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function cargarReserva(reservaId: number) {
    setCargando(true);
    setError("");
    try {
      setReserva(await obtenerReservaPorId(reservaId));
    } catch {
      setError("No se pudo cargar la reserva.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-[440px] flex-col items-center gap-6 px-7 pb-20 pt-16 text-center">
      {cargando ? (
        <p className="text-sm text-ink-faint">Cargando reserva...</p>
      ) : error || !reserva ? (
        <>
          <p className="text-sm text-negative">{error || "No se encontró la reserva."}</p>
          <button
            onClick={() => navigate("/reservas")}
            className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
          >
            Volver a reservar
          </button>
        </>
      ) : (
        <div className="w-full rounded-[14px] border border-line bg-surface p-6">
          <h1 className="mb-2 text-lg font-semibold">¡Reserva confirmada!</h1>
          <p className="mb-4 text-sm text-ink-muted">Presenta este código en la cancha para validar tu pago.</p>
          <div className="mb-5 rounded-[10px] border border-brand bg-positive-bg py-4 font-mono text-2xl font-semibold tracking-[.2em] text-positive">
            {reserva.codigoReserva}
          </div>
          {/* TODO: sumar resumen de la reserva (cancha, fecha, horario, total) — pendiente de definir contenido */}
          <button
            onClick={() => navigate("/reservas")}
            className="h-9 w-full rounded-lg border-none bg-brand text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
          >
            Volver a reservar
          </button>
        </div>
      )}
    </main>
  );
}

export default ReservaConfirmadaPage;
