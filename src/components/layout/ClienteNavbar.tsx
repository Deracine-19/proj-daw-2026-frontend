import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
    <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-[#1f1f22] bg-[#09090b]/80 px-7 backdrop-blur-md">
      <div className="flex items-center gap-7">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[#27272a] bg-[repeating-linear-gradient(135deg,#141417_0_5px,#0e0e11_5px_10px)]">
            <span className="font-mono text-[7px] text-[#52525b]">LOGO</span>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">PROYECTO DAW</span>
        </div>
        <nav className="flex items-center gap-[22px]">
          <NavLink
            to="/reservas"
            className={({ isActive }) =>
              `text-sm no-underline ${isActive ? "font-medium text-[#fafafa]" : "text-[#a1a1aa] hover:text-[#fafafa]"}`
            }
          >
            Reservar
          </NavLink>
          <NavLink
            to="/mis-reservas"
            className={({ isActive }) =>
              `text-sm no-underline ${isActive ? "font-medium text-[#fafafa]" : "text-[#a1a1aa] hover:text-[#fafafa]"}`
            }
          >
            Mis reservas
          </NavLink>
          <span className="cursor-not-allowed text-sm text-[#52525b]">Canchas</span>
        </nav>
      </div>

      <div className="flex items-center gap-3.5">
        <button className="flex h-[34px] items-center gap-[7px] rounded-lg border border-[#27272a] bg-transparent px-3 text-[13px] text-[#e4e4e7] hover:border-[#3f3f46] hover:bg-[#18181b]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#329e26]" />
          2 reservas activas
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#27272a] text-[13px] font-semibold text-[#e4e4e7] hover:bg-[#3f3f46]"
          >
            {iniciales(user?.email)}
          </button>

          {menuAbierto && (
            <div className="absolute right-0 top-[42px] w-56 overflow-hidden rounded-[10px] border border-[#1f1f22] bg-[#0c0c0e] shadow-lg">
              <div className="border-b border-[#1f1f22] px-3.5 py-2.5">
                <p className="truncate text-[13px] font-medium text-[#e4e4e7]">{user?.email}</p>
                <p className="text-[11px] text-[#71717a]">{user?.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3.5 py-2.5 text-left text-[13px] text-[#e4e4e7] hover:bg-[#18181b]"
              >
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