import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CircleCheck, Mail } from "lucide-react";
import { obtenerReservaPorId, type ReservaDto } from "@/services/reservaService";
import { useAuth } from "@/context/AuthContext";

function formatoFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${dia} ${meses[mes - 1]} ${anio}`;
}

function formatoHora(hora: string): string {
  return hora.slice(0, 5);
}

function formatoMoneda(n: number): string {
  return "L " + n.toLocaleString("en-US");
}

function ReservaConfirmadaPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

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
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-positive-bg">
            <CircleCheck className="h-6 w-6 text-positive" />
          </div>
          <h1 className="mb-2 text-lg font-semibold">¡Reserva confirmada!</h1>
          <p className="mb-4 text-sm text-ink-muted">Presenta este código en la cancha para validar tu pago.</p>
          <div className="mb-4 rounded-[10px] border border-brand bg-positive-bg py-4 font-mono text-2xl font-semibold tracking-[.2em] text-positive">
            {reserva.codigoReserva}
          </div>
          <p className="mb-5 flex items-center justify-center gap-1.5 text-[13px] text-ink-muted">
            <Mail className="h-3.5 w-3.5 text-ink-faint" />
            Te enviamos los detalles de tu reserva a {user?.email ?? "tu correo"}
          </p>

          <div className="mb-5 flex flex-col gap-2.5 rounded-[10px] border border-line bg-page p-3.5 text-left">
            <Fila label="Cancha" valor={reserva.nombreCancha ?? "—"} />
            <Fila label="Fecha" valor={formatoFecha(reserva.fecha)} />
            <Fila label="Horario" valor={`${formatoHora(reserva.horaEntrada)} – ${formatoHora(reserva.horaSalida)}`} />
            {reserva.articulos.length > 0 && (
              <Fila
                label="Artículos"
                valor={reserva.articulos.map((a) => `${a.nombreArticulo ?? "Artículo"} x${a.cantidad}`).join(", ")}
              />
            )}
            <div className="my-0.5 h-px bg-line" />
            <div className="flex justify-between gap-2.5">
              <span className="text-[13px] text-ink-faint">Total</span>
              <span className="text-[15px] font-semibold">{formatoMoneda(reserva.total)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/mis-reservas")}
            className="h-9 w-full rounded-lg border-none bg-brand text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
          >
            Ver mis reservas
          </button>
        </div>
      )}
    </main>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between gap-2.5">
      <span className="text-[13px] text-ink-faint">{label}</span>
      <span className="text-right text-[13px] font-medium">{valor}</span>
    </div>
  );
}

export default ReservaConfirmadaPage;
