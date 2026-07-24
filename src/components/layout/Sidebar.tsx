import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "../ThemeToggle";

const NAV_GROUPS = [
  {
    label: "General",
    items: [
      { to: "/admin/canchas", label: "Canchas", roles: ["Administrador"] },
      {
        to: "/admin/reservas",
        label: "Reservas",
        roles: ["Administrador", "Operador"],
      },
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const gruposVisibles = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(user?.rol ?? "")),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className="sticky top-0 flex h-screen w-[236px] flex-shrink-0 flex-col border-r border-line bg-surface-raised">
      <div className="flex items-center gap-2.5 px-5 pb-[18px] pt-5">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-line-strong bg-[repeating-linear-gradient(135deg,var(--color-hover)_0_5px,var(--color-surface-sunken)_5px_10px)]">
          <span className="font-mono text-[7px] text-ink-disabled">LOGO</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-[-0.01em]">TURF</span>
          <span className="font-mono text-[11px] text-ink-disabled">ADMIN</span>
        </div>
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

      <div className="mt-auto flex items-center gap-2.5 border-t border-line px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-line-strong text-xs font-semibold text-ink-secondary">
          {iniciales(user?.email)}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-[13px] font-medium">
            {user?.email}
          </span>
          <span className="truncate text-[11px] text-ink-disabled">
            {user?.rol}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="text-[11px] text-ink-disabled hover:text-ink-secondary"
          >
            Salir
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
