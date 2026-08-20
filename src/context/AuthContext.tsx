import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { login as loginService } from "@/services/authService";
import { obtenerMiPerfil } from "@/services/usuarioService";
import type { LoginDto, JwtPayload, AuthUser } from "@/types/auth";
import type { UsuarioDto } from "@/types/usuario";

interface AuthContextType {
  user: AuthUser | null;
  perfil: UsuarioDto | null;
  isAuthenticated: boolean;
  cargando: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
  actualizarFotoPerfil: (imagenBase64: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeUser(token: string): AuthUser | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp * 1000 < Date.now()) return null; // token vencido
    return { id: payload.nameid, email: payload.email, rol: payload.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [perfil, setPerfil] = useState<UsuarioDto | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeUser(token);
      if (decoded) {
        setUser(decoded);
        cargarPerfil(decoded.rol);
      } else {
        localStorage.removeItem("token");
      }
    }
    setCargando(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El JWT solo trae email/rol (ver CLAUDE.md) — nombre y foto se cargan aparte. De paso,
  // como esto sí consulta el rol real en la base de datos (a diferencia del rol del token,
  // que queda congelado desde el login), aprovechamos para detectar si un Administrador le
  // cambió el rol a este usuario mientras tenía la sesión abierta: el token seguiría siendo
  // válido pero con permisos desactualizados, tanto acá como en el backend (que también
  // autoriza por el claim del token, no por la tabla Usuario) — así que forzamos cierre de
  // sesión en vez de dejarlo operar con un rol que ya no es el suyo.
  async function cargarPerfil(rolDelToken: string) {
    try {
      const perfilActual = await obtenerMiPerfil();
      if (perfilActual.rolNombre !== rolDelToken) {
        logout();
        toast.error("Tu rol de usuario cambió. Por favor, vuelve a iniciar sesión.");
        return;
      }
      setPerfil(perfilActual);
    } catch {
      // silencioso a propósito — si falla, los avatares simplemente caen a iniciales
    }
  }

  async function login(dto: LoginDto) {
    const { token } = await loginService(dto);
    const decoded = decodeUser(token);
    if (!decoded) throw new Error("Token inválido");
    localStorage.setItem("token", token);
    setUser(decoded);
    await cargarPerfil(decoded.rol);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setPerfil(null);
  }

  // Actualización optimista tras guardar una foto nueva — evita un round-trip extra al backend.
  function actualizarFotoPerfil(imagenBase64: string | null) {
    setPerfil((p) => (p ? { ...p, imagenBase64 } : p));
  }

  return (
    <AuthContext.Provider
      value={{ user, perfil, isAuthenticated: !!user, login, logout, cargando, actualizarFotoPerfil }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}