import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { login as loginService } from "@/services/authService";
import type { LoginDto, JwtPayload, AuthUser } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  cargando: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
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
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeUser(token);
      if (decoded) setUser(decoded);
      else localStorage.removeItem("token");
    }
    setCargando(false);
  }, []);

  async function login(dto: LoginDto) {
    const { token } = await loginService(dto);
    const decoded = decodeUser(token);
    if (!decoded) throw new Error("Token inválido");
    localStorage.setItem("token", token);
    setUser(decoded);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}