import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { obtenerDashboard } from "@/services/dashboardService";
import type {
  DashboardDto,
  DashboardReserva,
} from "@/types/dashboard";

function formatoMoneda(valor: number): string {
  return `L ${valor.toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatoFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);

  return new Date(anio, mes - 1, dia).toLocaleDateString(
    "es-HN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatoHora(hora: string): string {
  return hora.slice(0, 5);
}

function formatoEstado(estado: string) {
  switch (estado) {
    case "CONFIRMADA":
      return "Confirmada";

    case "CANCELADA":
      return "Cancelada";

    case "NOSHOW":
      return "No confirmó";

    default:
      return estado;
  }
}

function colorEstado(estado: string): string {
  switch (estado) {
    case "CONFIRMADA":
      return "var(--color-positive)";

    case "CANCELADA":
      return "var(--color-ink-faint)";

    case "NOSHOW":
      return "var(--color-negative)";

    default:
      return "var(--color-ink-muted)";
  }
}

function DashboardPage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<DashboardDto | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    setCargando(true);
    setError("");

    try {
      const respuesta = await obtenerDashboard();
      setDashboard(respuesta);
    } catch {
      setError(
        "No se pudieron cargar los datos del panel de control."

      );
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <>
        <header className="flex h-[60px] items-center border-b border-line px-7">
          <span className="text-base font-semibold">
            Panel de control
          </span>
        </header>

        <main className="p-7 text-sm text-ink-faint">
          Cargando panel de control...
        </main>
      </>
    );
  }

  if (!dashboard) {
    return (
      <>
        <header className="flex h-[60px] items-center border-b border-line px-7">
          <span className="text-base font-semibold">
            Panel de control
          </span>
        </header>

        <main className="p-7">
          <p className="text-sm text-negative">
            {error || "No se pudieron cargar los datos."}
          </p>
        </main>
      </>
    );
  }

  const tarjetas = [
    {
      titulo: "Reservas hoy",
      valor: dashboard.reservasHoy.toString(),
      descripcion: "Programadas para hoy",
    },
    {
      titulo: "Ingresos hoy",
      valor: formatoMoneda(dashboard.ingresosHoy),
      descripcion: "Reservas pagadas",
    },
    {
      titulo: "Usuarios activos",
      valor: dashboard.usuariosActivos.toString(),
      descripcion: "Cuentas habilitadas",
    },
    {
      titulo: "Canchas activas",
      valor: dashboard.canchasActivas.toString(),
      descripcion: "Disponibles",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between border-b border-line bg-page/80 px-7 backdrop-blur-md">
        <div>
          <span className="text-base font-semibold tracking-[-0.01em]">
            Panel de control
          </span>
        </div>

        <button
          onClick={cargarDashboard}
          className="h-[34px] rounded-lg border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong"
        >
          Actualizar
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        {error && (
          <p className="text-sm text-negative">{error}</p>
        )}

        {/* TARJETAS PRINCIPALES */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tarjetas.map((tarjeta) => (
            <div
              key={tarjeta.titulo}
              className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-surface p-[18px]"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-ink-faint">
                {tarjeta.titulo}
              </span>

              <span className="text-[27px] font-semibold tracking-[-0.03em]">
                {tarjeta.valor}
              </span>

              <span className="text-xs text-ink-faint">
                {tarjeta.descripcion}
              </span>
            </div>
          ))}
        </section>

        {/* INFORMACIÓN SECUNDARIA */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TarjetaSecundaria
            titulo="Pendientes de pago"
            valor={dashboard.reservasPendientesPago.toString()}
            descripcion="Reservas confirmadas"
          />

          <TarjetaSecundaria
            titulo="Clientes que no confirmaron"
            valor={dashboard.noShowsMes.toString()}
            descripcion="Durante este mes"
          />

          <TarjetaSecundaria
            titulo="Cancha más reservada"
            valor={dashboard.canchaMasReservada}
            descripcion="Según reservas registradas"
          />
        </section>

        {/* RESERVAS RECIENTES */}
        <section className="overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold">
                Reservas recientes
              </h2>

              <p className="mt-0.5 text-xs text-ink-faint">
                Últimas reservas registradas
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/reservas")}
              className="rounded-lg border border-line-strong px-3 py-2 text-[12px] font-medium text-ink-secondary hover:bg-hover-strong"
            >
              Ver todas
            </button>
          </div>

          <div className="grid grid-cols-[1fr_1.4fr_1.2fr_1fr_1fr_1fr] gap-4 border-b border-line bg-surface-raised px-5 py-3">
            <Encabezado texto="Código" />
            <Encabezado texto="Cliente" />
            <Encabezado texto="Cancha" />
            <Encabezado texto="Fecha" />
            <Encabezado texto="Total" />
            <Encabezado texto="Estado" />
          </div>

          {dashboard.reservasRecientes.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-ink-faint">
              No existen reservas registradas.
            </div>
          ) : (
            dashboard.reservasRecientes.map(
              (reserva: DashboardReserva) => (
                <div
                  key={reserva.id}
                  className="grid grid-cols-[1fr_1.4fr_1.2fr_1fr_1fr_1fr] items-center gap-4 border-b border-line-subtle px-5 py-3.5 last:border-b-0 hover:bg-surface-sunken"
                >
                  <span className="font-mono text-xs text-ink-muted">
                    {reserva.codigoReserva}
                  </span>

                  <span className="truncate text-sm">
                    {reserva.cliente}
                  </span>

                  <span className="truncate text-sm text-ink-secondary">
                    {reserva.cancha}
                  </span>

                  <div className="flex flex-col">
                    <span className="text-sm">
                      {formatoFecha(reserva.fecha)}
                    </span>

                    <span className="text-xs text-ink-faint">
                      {formatoHora(reserva.horaEntrada)}
                    </span>
                  </div>

                  <span className="font-mono text-sm">
                    {formatoMoneda(reserva.total)}
                  </span>

                  <div className="flex flex-col">
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: colorEstado(
                          reserva.estadoReserva
                        ),
                      }}
                    >
                      {formatoEstado(
                        reserva.estadoReserva
                      )}
                    </span>

                    <span className="text-[11px] text-ink-faint">
                      {reserva.estadoPago
                        ? "Pagada"
                        : "Pendiente"}
                    </span>
                  </div>
                </div>
              )
            )
          )}
        </section>
      </main>
    </>
  );
}

function Encabezado({ texto }: { texto: string }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-ink-faint">
      {texto}
    </span>
  );
}

function TarjetaSecundaria({
  titulo,
  valor,
  descripcion,
}: {
  titulo: string;
  valor: string;
  descripcion: string;
}) {
  return (
    <div className="rounded-[14px] border border-line bg-surface p-[18px]">
      <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-ink-faint">
        {titulo}
      </span>

      <p className="mt-3 truncate text-xl font-semibold">
        {valor}
      </p>

      <p className="mt-1 text-xs text-ink-faint">
        {descripcion}
      </p>
    </div>
  );
}

export default DashboardPage;