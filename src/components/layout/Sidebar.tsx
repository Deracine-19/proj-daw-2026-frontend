import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV_GROUPS = [
  {
    label: "General",
    items: [
      { to: "/admin/canchas", label: "Canchas" },
      { to: "/admin/reservas", label: "Reservas" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { to: "/admin/articulos", label: "Artículos" },
      { to: "/admin/usuarios", label: "Usuarios" },
      { to: "/admin/configuracion", label: "Configuración" },
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

  return (
    <aside className="sticky top-0 flex h-screen w-[236px] flex-shrink-0 flex-col border-r border-[#1f1f22] bg-[#0a0a0c]">
      <div className="flex items-center gap-2.5 px-5 pb-[18px] pt-5">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[#27272a] bg-[repeating-linear-gradient(135deg,#141417_0_5px,#0e0e11_5px_10px)]">
          <span className="font-mono text-[7px] text-[#52525b]">LOGO</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-[-0.01em]">TURF</span>
          <span className="font-mono text-[11px] text-[#52525b]">ADMIN</span>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-1.5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <span className="block px-2.5 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[.1em] text-[#52525b]">
              {group.label}
            </span>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm no-underline transition-colors ${
                    isActive
                      ? "bg-[#141417] font-medium text-[#fafafa] shadow-[inset_2px_0_0_#329e26]"
                      : "text-[#a1a1aa] hover:bg-[#141417] hover:text-[#e4e4e7]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="h-[5px] w-[5px] rounded-full"
                      style={{ background: isActive ? "#329e26" : "currentColor", opacity: isActive ? 1 : 0.5 }}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-[#1f1f22] px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#27272a] text-xs font-semibold text-[#e4e4e7]">
          {iniciales(user?.email)}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-[13px] font-medium">{user?.email}</span>
          <span className="truncate text-[11px] text-[#52525b]">{user?.rol}</span>
        </div>
        <button onClick={handleLogout} className="ml-auto text-[11px] text-[#52525b] hover:text-[#e4e4e7]">
          Salir
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;