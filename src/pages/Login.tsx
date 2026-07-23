// src/pages/Login.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { register as registerService } from "@/services/authService";

type Tab = "login" | "register";

function Login() {
  const [tab, setTab] = useState<Tab>("login");
  const [showPw, setShowPw] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const isReg = tab === "register";

  function redirigirSegunRol(rol: string) {
    if (rol === "Administrador" || rol === "Operador") navigate("/admin/canchas");
    else navigate("/reservas");
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
    } catch {
      setError(isReg ? "No se pudo crear la cuenta." : "Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  }

  // en cuanto el contexto confirme el usuario logueado, redirige según su rol
  if (user) {
    redirigirSegunRol(user.rol);
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#09090b] p-8 font-sans">
      <div className="absolute left-1/2 top-0 h-px w-[640px] max-w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-[#3f3f46] to-transparent" />

      <div className="flex w-full max-w-[360px] flex-col gap-6">
        <div className="flex flex-col items-center gap-[18px]">
          <div className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-[#27272a] bg-[repeating-linear-gradient(135deg,#141417_0_6px,#0e0e11_6px_12px)]">
            <span className="font-mono text-[8px] text-[#52525b]">LOGO</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="m-0 text-center text-2xl font-semibold tracking-[-0.02em] text-[#fafafa]">
              {isReg ? "Crea tu cuenta" : "Bienvenido de vuelta"}
            </h1>
            <p className="m-0 text-center text-sm text-[#a1a1aa]">
              {isReg ? "Reserva tu cancha de fútbol" : "Inicia sesión para reservar tu cancha"}
            </p>
          </div>
        </div>

        <div className="flex gap-[3px] rounded-[9px] border border-[#1f1f22] bg-[#141417] p-[3px]">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`h-[34px] flex-1 rounded-[7px] text-[13px] font-medium transition-all ${
              !isReg ? "bg-[#329e26] text-[#f0fdf4]" : "bg-transparent text-[#a1a1aa]"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`h-[34px] flex-1 rounded-[7px] text-[13px] font-medium transition-all ${
              isReg ? "bg-[#329e26] text-[#f0fdf4]" : "bg-transparent text-[#a1a1aa]"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isReg && (
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#e4e4e7]">Nombre completo</label>
              <input
                type="text"
                placeholder="Jon Snow"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none placeholder:text-[#52525b] focus:border-[#52525b]"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#e4e4e7]">Correo electrónico</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none placeholder:text-[#52525b] focus:border-[#52525b]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#e4e4e7]">Contraseña</label>
            <div className="relative flex items-center">
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-[42px] w-full rounded-[9px] border border-[#27272a] bg-[#0d0d10] py-0 pl-3 pr-[60px] text-sm text-[#fafafa] outline-none placeholder:text-[#52525b] focus:border-[#52525b]"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 h-7 px-2 text-xs text-[#a1a1aa]"
              >
                {showPw ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {!isReg && (
              <a href="#" className="self-end text-[13px] text-[#a1a1aa] no-underline hover:text-[#fafafa]">
                ¿Olvidaste tu contraseña?
              </a>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-0.5 h-[42px] rounded-[9px] border-none bg-[#329e26] text-sm font-semibold text-[#f0fdf4] transition-colors hover:bg-[#3aad2c] disabled:opacity-60"
          >
            {cargando ? "Procesando..." : isReg ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>

        <p className="m-0 text-center text-xs leading-relaxed text-[#52525b]">
          Al continuar aceptas nuestros Términos y Política de privacidad.
        </p>
      </div>
    </div>
  );
}

export default Login;