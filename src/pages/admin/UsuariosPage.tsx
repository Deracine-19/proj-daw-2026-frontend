import { useEffect, useState } from "react";
import {
  obtenerUsuarios,
  actualizarUsuario,
  crearUsuario,
  cambiarEstadoUsuario,
} from "@/services/usuarioService";
import type { UsuarioDto } from "@/types/usuario";

const ROL_COLOR: Record<string, string> = {
  Administrador: "#329e26",
  Operador: "#3b82f6",
  Cliente: "#71717a",
};

// TODO: reemplazar por un fetch a /api/roles si tu compañero expone ese endpoint,
// en vez de asumir estos IDs fijos del seed.
const ROLES_DISPONIBLES = [
  { id: 1, nombre: "Cliente" },
  { id: 2, nombre: "Administrador" },
  { id: 3, nombre: "Operador" },
];

function iniciales(nombre: string) {
  return nombre.slice(0, 2).toUpperCase();
}

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [editando, setEditando] = useState<UsuarioDto | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRolId, setFormRolId] = useState(ROLES_DISPONIBLES[0].id);
  const [guardando, setGuardando] = useState(false);

  const [creando, setCreando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [nuevoRolId, setNuevoRolId] = useState(ROLES_DISPONIBLES[0].id);
  const [creandoGuardando, setCreandoGuardando] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    setCargando(true);
    setError("");
    try {
      setUsuarios(await obtenerUsuarios());
    } catch {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setCargando(false);
    }
  }

  function abrirEdicion(u: UsuarioDto) {
    setEditando(u);
    setFormNombre(u.nombre);
    setFormEmail(u.email);
    setFormRolId(u.rolId);
  }

  async function guardarEdicion() {
    if (!editando) return;
    setGuardando(true);
    try {
      const actualizado = await actualizarUsuario(editando.id, {
        nombre: formNombre,
        email: formEmail,
        rolId: formRolId,
      });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === actualizado.id ? actualizado : u)),
      );
      setEditando(null);
    } catch {
      setError("No se pudo guardar el cambio.");
    } finally {
      setGuardando(false);
    }
  }

  async function crear() {
    setCreandoGuardando(true);
    try {
      const nuevo = await crearUsuario({
        nombre: nuevoNombre,
        email: nuevoEmail,
        password: nuevoPassword,
        rolId: nuevoRolId,
      });
      setUsuarios((prev) => [...prev, nuevo]);
      setCreando(false);
      setNuevoNombre("");
      setNuevoEmail("");
      setNuevoPassword("");
      setNuevoRolId(ROLES_DISPONIBLES[0].id);
    } catch {
      setError("No se pudo crear el usuario.");
    } finally {
      setCreandoGuardando(false);
    }
  }

  async function toggleEstado(u: UsuarioDto) {
    // actualización optimista para que el switch responda al instante
    setUsuarios((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, activo: !x.activo } : x)),
    );
    try {
      await cambiarEstadoUsuario(u.id);
    } catch {
      setUsuarios((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, activo: u.activo } : x)),
      ); // revierte si falla
      setError("No se pudo cambiar el estado del usuario.");
    }
  }

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-4 border-b border-[#1f1f22] bg-[#09090b]/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">
          Gestión de usuarios
        </span>
        <div className="flex items-center gap-3">
          <div className="flex h-[34px] min-w-[200px] items-center gap-2 rounded-lg border border-[#27272a] bg-[#0c0c0e] px-3 text-[13px] text-[#52525b]">
            <span className="font-mono">⌕</span>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full bg-transparent text-[#fafafa] outline-none placeholder:text-[#52525b]"
            />
          </div>
          <button
            onClick={() => setCreando(true)}
            className="h-[34px] rounded-lg border-none bg-[#329e26] px-3.5 text-[13px] font-semibold text-[#f0fdf4] hover:bg-[#3aad2c]"
          >
            + Nuevo usuario
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="overflow-hidden rounded-[14px] border border-[#1f1f22] bg-[#0c0c0e]">
          <div className="flex items-center justify-between border-b border-[#1f1f22] px-5 py-4">
            <span className="text-[15px] font-semibold">Usuarios</span>
            <span className="text-[13px] text-[#71717a]">
              {usuariosFiltrados.length} usuarios registrados
            </span>
          </div>

          <div className="grid grid-cols-[2.2fr_1.4fr_1fr_1fr_auto] items-center gap-4 border-b border-[#1f1f22] bg-[#0a0a0c] px-5 py-3">
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">
              Usuario
            </span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">
              Correo
            </span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">
              Rol
            </span>
            <span className="text-[11px] uppercase tracking-[.06em] text-[#71717a]">
              Estado
            </span>
            <span className="text-right text-[11px] uppercase tracking-[.06em] text-[#71717a]">
              Acciones
            </span>
          </div>

          {cargando ? (
            <div className="px-5 py-6 text-sm text-[#71717a]">
              Cargando usuarios...
            </div>
          ) : (
            usuariosFiltrados.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[2.2fr_1.4fr_1fr_1fr_auto] items-center gap-4 border-b border-[#141417] px-5 py-3.5 transition-colors hover:bg-[#0e0e11]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#27272a] text-xs font-semibold text-[#e4e4e7]">
                    {iniciales(u.nombre)}
                  </div>
                  <span className="text-sm font-medium">{u.nombre}</span>
                </div>
                <span className="text-[13px] text-[#a1a1aa]">{u.email}</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: ROL_COLOR[u.rolNombre] ?? "#a1a1aa" }}
                >
                  {u.rolNombre}
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleEstado(u)}
                    className="relative h-[22px] w-[38px] rounded-full border-none transition-colors"
                    style={{ background: u.activo ? "#329e26" : "#27272a" }}
                  >
                    <span
                      className="absolute top-[3px] h-4 w-4 rounded-full bg-[#fafafa] transition-all"
                      style={{ left: u.activo ? "19px" : "3px" }}
                    />
                  </button>
                  <span
                    className="text-xs font-medium"
                    style={{ color: u.activo ? "#7fd970" : "#71717a" }}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => abrirEdicion(u)}
                    className="h-8 rounded-lg border border-[#27272a] bg-transparent px-3 text-[13px] font-medium text-[#e4e4e7] hover:border-[#3f3f46] hover:bg-[#18181b]"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {editando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-[#1f1f22] bg-[#0c0c0e] p-6">
            <h2 className="mb-4 text-base font-semibold">Editar usuario</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#e4e4e7]">
                  Nombre
                </label>
                <input
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none focus:border-[#52525b]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#e4e4e7]">
                  Correo
                </label>
                <input
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none focus:border-[#52525b]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#e4e4e7]">
                  Rol
                </label>
                <select
                  value={formRolId}
                  onChange={(e) => setFormRolId(Number(e.target.value))}
                  className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none focus:border-[#52525b]"
                >
                  {ROLES_DISPONIBLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditando(null)}
                className="h-9 rounded-lg border border-[#27272a] bg-transparent px-4 text-[13px] font-medium text-[#e4e4e7] hover:bg-[#18181b]"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={guardando}
                className="h-9 rounded-lg border-none bg-[#329e26] px-4 text-[13px] font-semibold text-[#f0fdf4] hover:bg-[#3aad2c] disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {creando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-[#1f1f22] bg-[#0c0c0e] p-6">
            <h2 className="mb-4 text-base font-semibold">Nuevo usuario</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#e4e4e7]">
                  Nombre
                </label>
                <input
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none focus:border-[#52525b]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#e4e4e7]">
                  Correo
                </label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none focus:border-[#52525b]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#e4e4e7]">
                  Contraseña temporal
                </label>
                <input
                  type="password"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none focus:border-[#52525b]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#e4e4e7]">
                  Rol
                </label>
                <select
                  value={nuevoRolId}
                  onChange={(e) => setNuevoRolId(Number(e.target.value))}
                  className="h-[42px] rounded-[9px] border border-[#27272a] bg-[#0d0d10] px-3 text-sm text-[#fafafa] outline-none focus:border-[#52525b]"
                >
                  {ROLES_DISPONIBLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setCreando(false)}
                className="h-9 rounded-lg border border-[#27272a] bg-transparent px-4 text-[13px] font-medium text-[#e4e4e7] hover:bg-[#18181b]"
              >
                Cancelar
              </button>
              <button
                onClick={crear}
                disabled={creandoGuardando}
                className="h-9 rounded-lg border-none bg-[#329e26] px-4 text-[13px] font-semibold text-[#f0fdf4] hover:bg-[#3aad2c] disabled:opacity-60"
              >
                {creandoGuardando ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UsuariosPage;
