import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, ImageUp } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import Avatar from "@/components/Avatar";
import CampoImagen from "@/components/CampoImagen";
import { useConfiguracion } from "@/context/ConfiguracionContext";
import { actualizarMiFoto } from "@/services/usuarioService";
import logo from "@/assets/logo.svg";
import { obtenerMisReservas, type ReservaDto } from "@/services/reservaService";

function iniciales(email?: string) {
  if (!email) return "??";
  return email.slice(0, 2).toUpperCase();
}

function esPasada(r: ReservaDto): boolean {
  const [anio, mes, dia] = r.fecha.split("-").map(Number);
  const [h, m] = r.horaEntrada.split(":").map(Number);
  return new Date(anio, mes - 1, dia, h, m).getTime() < Date.now();
}

function mensajeError(err: unknown, fallback: string): string {
  if (isAxiosError(err) && typeof err.response?.data?.mensaje === "string") {
    return err.response.data.mensaje;
  }
  return fallback;
}

function ClienteNavbar() {
  const { user, perfil, logout, actualizarFotoPerfil } = useAuth();
  const { nombreNegocio } = useConfiguracion();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [reservasActivas, setReservasActivas] = useState(0);

  const [cambiandoFoto, setCambiandoFoto] = useState(false);
  const [fotoForm, setFotoForm] = useState<string | null>(null);
  const [errorFoto, setErrorFoto] = useState("");
  const [guardandoFoto, setGuardandoFoto] = useState(false);

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  useEffect(() => {
    cargarReservasActivas();
  }, []);

  async function cargarReservasActivas() {
    try {
      const reservas = await obtenerMisReservas();
      setReservasActivas(reservas.filter((r) => r.estadoReserva === "CONFIRMADA" && !esPasada(r)).length);
    } catch {
      // El badge es informativo — si falla, simplemente no se actualiza.
    }
  }

  function handleLogout() {
    setMenuAbierto(false);
    logout();
    navigate("/login");
  }

  function abrirCambiarFoto() {
    setMenuAbierto(false);
    setErrorFoto("");
    setFotoForm(perfil?.imagenBase64 ?? null);
    setCambiandoFoto(true);
  }

  async function guardarFoto() {
    setGuardandoFoto(true);
    setErrorFoto("");
    try {
      const actualizado = await actualizarMiFoto(fotoForm);
      actualizarFotoPerfil(actualizado.imagenBase64);
      setCambiandoFoto(false);
      toast.success("Foto de perfil actualizada.");
    } catch (err) {
      setErrorFoto(mensajeError(err, "No se pudo actualizar la foto."));
    } finally {
      setGuardandoFoto(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-line bg-page/80 px-7 backdrop-blur-md">
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt={nombreNegocio} className="h-[30px] w-auto" />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">
              {nombreNegocio}
            </span>
          </div>
          <nav className="flex items-center gap-[22px]">
            <NavLink
              to="/reservas"
              className={({ isActive }) =>
                `text-sm no-underline ${isActive ? "font-medium text-ink" : "text-ink-muted hover:text-ink"}`
              }
            >
              Reservar
            </NavLink>
            <NavLink
              to="/mis-reservas"
              className={({ isActive }) =>
                `text-sm no-underline ${isActive ? "font-medium text-ink" : "text-ink-muted hover:text-ink"}`
              }
            >
              Mis reservas
            </NavLink>
            <span className="cursor-not-allowed text-sm text-ink-disabled">
              Canchas
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate("/mis-reservas")}
            className="flex h-[34px] items-center gap-[7px] rounded-lg border border-line-strong bg-transparent px-3 text-[13px] text-ink-secondary hover:border-line-hover hover:bg-hover-strong"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {reservasActivas} {reservasActivas === 1 ? "reserva activa" : "reservas activas"}
          </button>

          <ThemeToggle />

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuAbierto((v) => !v)} className="rounded-full hover:opacity-80">
              <Avatar imagenBase64={perfil?.imagenBase64} iniciales={iniciales(user?.email)} className="h-[34px] w-[34px] text-[13px]" />
            </button>

            {menuAbierto && (
              <div className="absolute right-0 top-[42px] w-56 overflow-hidden rounded-[10px] border border-line bg-surface shadow-lg">
                <div className="border-b border-line px-3.5 py-2.5">
                  <p className="truncate text-[13px] font-medium text-ink-secondary">
                    {user?.email}
                  </p>
                  <p className="text-[11px] text-ink-faint">{user?.rol}</p>
                </div>
                <button
                  onClick={abrirCambiarFoto}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] text-ink-secondary hover:bg-hover-strong"
                >
                  <ImageUp className="h-4 w-4" />
                  Cambiar foto
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 border-t border-line px-3.5 py-2.5 text-left text-[13px] text-ink-secondary hover:bg-hover-strong"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {cambiandoFoto && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold">Cambiar foto de perfil</h2>
            <CampoImagen value={fotoForm} onChange={setFotoForm} />
            {errorFoto && <p className="mt-4 text-sm text-negative">{errorFoto}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setCambiandoFoto(false)}
                disabled={guardandoFoto}
                className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={guardarFoto}
                disabled={guardandoFoto}
                className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
              >
                {guardandoFoto ? "Guardando..." : "Guardar foto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClienteNavbar;
