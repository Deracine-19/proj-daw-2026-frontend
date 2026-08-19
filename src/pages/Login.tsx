import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  register as registerService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from "@/services/authService";
import { isAxiosError } from "axios";
import { useConfiguracion } from "@/context/ConfiguracionContext";
import logo from "@/assets/logo.svg";

type Tab = "login" | "register";
type PasoOlvide = "solicitar" | "restablecer" | "listo";

function mensajeErrorAuth(err: unknown, fallback: string): string {
  if (isAxiosError(err) && typeof err.response?.data?.mensaje === "string") {
    return err.response.data.mensaje;
  }
  return fallback;
}

function Login() {
  const [tab, setTab] = useState<Tab>("login");
  const [showPw, setShowPw] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const [mostrarOlvide, setMostrarOlvide] = useState(false);
  const [pasoOlvide, setPasoOlvide] = useState<PasoOlvide>("solicitar");
  const [emailOlvide, setEmailOlvide] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mensajeOlvide, setMensajeOlvide] = useState("");
  const [errorOlvide, setErrorOlvide] = useState("");
  const [cargandoOlvide, setCargandoOlvide] = useState(false);

  const { login, user } = useAuth();
  const { nombreNegocio } = useConfiguracion();
  const navigate = useNavigate();
  const isReg = tab === "register";

  function redirigirSegunRol(rol: string) {
    if (rol === "Administrador") navigate("/admin/canchas");
    else if (rol === "Operador") navigate("/admin/reservas");
    else navigate("/reservas");
  }

  function abrirOlvide() {
    setMostrarOlvide(true);
    setPasoOlvide("solicitar");
    setEmailOlvide(email);
    setTempPassword("");
    setNuevaPassword("");
    setMensajeOlvide("");
    setErrorOlvide("");
  }

  async function solicitarClaveTemporal(e: FormEvent) {
    e.preventDefault();
    setCargandoOlvide(true);
    setErrorOlvide("");
    try {
      await forgotPasswordService({ email: emailOlvide });
      setMensajeOlvide("Si el correo existe en nuestro sistema, te enviamos una clave temporal. Ingrésala abajo junto con tu nueva contraseña.");
      setPasoOlvide("restablecer");
    } catch (err) {
      setErrorOlvide(mensajeErrorAuth(err, "No se pudo procesar la solicitud. Intenta de nuevo."));
    } finally {
      setCargandoOlvide(false);
    }
  }

  async function restablecerPassword(e: FormEvent) {
    e.preventDefault();
    setCargandoOlvide(true);
    setErrorOlvide("");
    try {
      await resetPasswordService({ email: emailOlvide, tempPassword, newPassword: nuevaPassword });
      setEmail(emailOlvide);
      setPassword("");
      setPasoOlvide("listo");
    } catch (err) {
      setErrorOlvide(mensajeErrorAuth(err, "No se pudo restablecer la contraseña. Verifica la clave temporal."));
    } finally {
      setCargandoOlvide(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      if (isReg) {
        await registerService({ nombre, email, password });
      }
      await login({ email, password });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        setError(err.response.data?.mensaje ?? "Tu cuenta está desactivada.");
      } else {
        setError(isReg ? "No se pudo crear la cuenta." : "Correo o contraseña incorrectos.");
      }
    } finally {
      setCargando(false);
    }
  }

  if (user) {
    redirigirSegunRol(user.rol);
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-page p-8 font-sans">
      <div className="absolute left-1/2 top-0 h-px w-[640px] max-w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-line-hover to-transparent" />

      <div className="flex w-full max-w-[360px] flex-col gap-6">
        <div className="flex flex-col items-center gap-[18px]">
          <img src={logo} alt={nombreNegocio} className="h-11 w-auto" />
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="m-0 text-center text-2xl font-semibold tracking-[-0.02em] text-ink">
              {isReg ? "Crea tu cuenta" : "Bienvenido de vuelta"}
            </h1>
            <p className="m-0 text-center text-sm text-ink-muted">
              {isReg ? "Reserva tu cancha de fútbol" : "Inicia sesión para reservar tu cancha"}
            </p>
          </div>
        </div>

        <div className="flex gap-[3px] rounded-[9px] border border-line bg-hover p-[3px]">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`h-[34px] flex-1 rounded-[7px] text-[13px] font-medium transition-all ${
              !isReg ? "bg-brand text-brand-foreground" : "bg-transparent text-ink-muted"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`h-[34px] flex-1 rounded-[7px] text-[13px] font-medium transition-all ${
              isReg ? "bg-brand text-brand-foreground" : "bg-transparent text-ink-muted"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isReg && (
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-ink-secondary">Nombre completo</label>
              <input
                type="text"
                placeholder="Jon Snow"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="h-[42px] rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none placeholder:text-ink-disabled focus:border-ink-disabled"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-ink-secondary">Correo electrónico</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[42px] rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none placeholder:text-ink-disabled focus:border-ink-disabled"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-ink-secondary">Contraseña</label>
            <div className="relative flex items-center">
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-[42px] w-full rounded-[9px] border border-line-strong bg-panel py-0 pl-3 pr-[60px] text-sm text-ink outline-none placeholder:text-ink-disabled focus:border-ink-disabled"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 h-7 px-2 text-xs text-ink-muted"
              >
                {showPw ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {!isReg && (
              <button
                type="button"
                onClick={abrirOlvide}
                className="self-end text-[13px] text-ink-muted no-underline hover:text-ink"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-0.5 h-[42px] rounded-[9px] border-none bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            {cargando ? "Procesando..." : isReg ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>

        <p className="m-0 text-center text-xs leading-relaxed text-ink-disabled">
          Al continuar aceptas nuestros Términos y Política de privacidad.
        </p>
      </div>

      {mostrarOlvide && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
            {pasoOlvide === "listo" ? (
              <>
                <h2 className="mb-2 text-base font-semibold">¡Contraseña actualizada!</h2>
                <p className="mb-5 text-sm text-ink-muted">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                <button
                  onClick={() => setMostrarOlvide(false)}
                  className="h-9 w-full rounded-lg border-none bg-brand text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
                >
                  Iniciar sesión
                </button>
              </>
            ) : pasoOlvide === "restablecer" ? (
              <form onSubmit={restablecerPassword} className="flex flex-col gap-4">
                <div>
                  <h2 className="mb-1 text-base font-semibold">Restablecer contraseña</h2>
                  <p className="text-sm text-ink-muted">{mensajeOlvide}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-ink-secondary">Clave temporal</label>
                  <input
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    required
                    placeholder="La que te llegó por correo"
                    className="h-10.5 rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-ink-secondary">Nueva contraseña</label>
                  <input
                    type="password"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="h-10.5 rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
                  />
                </div>
                {errorOlvide && <p className="text-sm text-negative">{errorOlvide}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPasoOlvide("solicitar")}
                    disabled={cargandoOlvide}
                    className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong disabled:opacity-60"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={cargandoOlvide}
                    className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
                  >
                    {cargandoOlvide ? "Guardando..." : "Restablecer"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={solicitarClaveTemporal} className="flex flex-col gap-4">
                <div>
                  <h2 className="mb-1 text-base font-semibold">¿Olvidaste tu contraseña?</h2>
                  <p className="text-sm text-ink-muted">Te enviaremos una clave temporal a tu correo.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-ink-secondary">Correo electrónico</label>
                  <input
                    type="email"
                    value={emailOlvide}
                    onChange={(e) => setEmailOlvide(e.target.value)}
                    required
                    className="h-10.5 rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
                  />
                </div>
                {errorOlvide && <p className="text-sm text-negative">{errorOlvide}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarOlvide(false)}
                    disabled={cargandoOlvide}
                    className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={cargandoOlvide}
                    className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
                  >
                    {cargandoOlvide ? "Enviando..." : "Enviar clave temporal"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorOlvide("");
                    setPasoOlvide("restablecer");
                  }}
                  className="text-center text-[13px] text-ink-muted hover:text-ink"
                >
                  Ya tengo una clave temporal
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;