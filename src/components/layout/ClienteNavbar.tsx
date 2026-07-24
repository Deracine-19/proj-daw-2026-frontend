import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { PROYECTO_NOMBRE } from "@/config/app";
import logo from "@/assets/logo.svg";

function iniciales(email?: string) {
  if (!email) return "??";
  return email.slice(0, 2).toUpperCase();
}

function ClienteNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  function handleLogout() {
    setMenuAbierto(false);
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-line bg-page/80 px-7 backdrop-blur-md">
      <div className="flex items-center gap-7">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt={PROYECTO_NOMBRE} className="h-[30px] w-auto" />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">
            {PROYECTO_NOMBRE}
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
        <button className="flex h-[34px] items-center gap-[7px] rounded-lg border border-line-strong bg-transparent px-3 text-[13px] text-ink-secondary hover:border-line-hover hover:bg-hover-strong">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />2 reservas
          activas
        </button>

        <ThemeToggle />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-line-strong text-[13px] font-semibold text-ink-secondary hover:bg-line-hover"
          >
            {iniciales(user?.email)}
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
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] text-ink-secondary hover:bg-hover-strong"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default ClienteNavbar;
