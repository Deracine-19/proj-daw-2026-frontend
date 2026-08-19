import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "../ThemeToggle";
import Avatar from "../Avatar";
import { useConfiguracion } from "@/context/ConfiguracionContext";
import logo from "@/assets/logo.svg";

const NAV_GROUPS = [
  {
    label: "General",
    items: [
      { to: "/admin/dashboard", label: "Panel de control", roles: ["Administrador"] },
      { to: "/admin/canchas", label: "Canchas", roles: ["Administrador"] },
      { to: "/admin/reservas", label: "Reservas", roles: ["Administrador", "Operador"] },
    ],
  },
  {
    label: "Gestión",
    items: [
      { to: "/admin/usuarios", label: "Usuarios", roles: ["Administrador"] },
      { to: "/admin/articulos", label: "Artículos", roles: ["Administrador"] },
      {
        to: "/admin/configuracion",
        label: "Configuración",
        roles: ["Administrador"],
      },
    ],
  },
];

function iniciales(email?: string) {
  if (!email) return "??";
  return email.slice(0, 2).toUpperCase();
}

function Sidebar() {
  const { user, perfil, logout } = useAuth();
  const { nombreNegocio } = useConfiguracion();
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

  const gruposVisibles = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(user?.rol ?? "")),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className="sticky top-0 flex h-screen w-[236px] flex-shrink-0 flex-col border-r border-line bg-surface-raised">
      <div className="flex items-center justify-between gap-2.5 px-5 pb-[18px] pt-5">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt={nombreNegocio} className="h-[30px] w-auto" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[-0.01em]">{nombreNegocio}</span>
            <span className="font-mono text-[11px] text-ink-disabled">
              {user?.rol === "Operador" ? "OPERADOR" : "ADMIN"}
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-1.5">
        {gruposVisibles.map((group) => (
          <div key={group.label}>
            <span className="block px-2.5 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[.1em] text-ink-disabled">
              {group.label}
            </span>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm no-underline transition-colors ${
                    isActive
                      ? "bg-hover font-medium text-ink shadow-[inset_2px_0_0_var(--color-brand)]"
                      : "text-ink-muted hover:bg-hover hover:text-ink-secondary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="h-[5px] w-[5px] rounded-full"
                      style={{
                        background: isActive
                          ? "var(--color-brand)"
                          : "currentColor",
                        opacity: isActive ? 1 : 0.5,
                      }}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="relative mt-auto flex items-center gap-2.5 border-t border-line px-4 py-4" ref={menuRef}>
        <button onClick={() => setMenuAbierto((v) => !v)} className="rounded-full hover:opacity-80">
          <Avatar imagenBase64={perfil?.imagenBase64} iniciales={iniciales(user?.email)} className="h-8 w-8 text-xs" />
        </button>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-[13px] font-medium">
            {user?.email}
          </span>
          <span className="truncate text-[11px] text-ink-disabled">
            {user?.rol}
          </span>
        </div>

        {menuAbierto && (
          <div className="absolute bottom-full left-4 mb-2 w-52 overflow-hidden rounded-[10px] border border-line bg-surface shadow-lg">
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
    </aside>
  );
}

export default Sidebar;
