import { useEffect, useState } from "react";
import {
  obtenerUsuarios,
  actualizarUsuario,
  crearUsuario,
  cambiarEstadoUsuario,
} from "@/services/usuarioService";
import type { UsuarioDto } from "@/types/usuario";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Paginador from "@/components/Paginador";
import BotonExportar from "@/components/BotonExportar";
import Avatar from "@/components/Avatar";
import CampoImagen from "@/components/CampoImagen";

const ROL_COLOR: Record<string, string> = {
  Administrador: "var(--color-brand)",
  Operador: "var(--color-role-operador)",
  Cliente: "var(--color-ink-faint)",
};

const ROLES_DISPONIBLES = [
  { id: 1, nombre: "Cliente" },
  { id: 2, nombre: "Administrador" },
  { id: 3, nombre: "Operador" },
];

type ColumnaOrdenable = "nombre" | "email" | "rolNombre" | "activo";

function iniciales(nombre: string) {
  return nombre.slice(0, 2).toUpperCase();
}

function EncabezadoOrdenable({
  label,
  columna,
  ordenColumna,
  ordenDireccion,
  onClick,
}: {
  label: string;
  columna: ColumnaOrdenable;
  ordenColumna: ColumnaOrdenable | null;
  ordenDireccion: "asc" | "desc";
  onClick: (columna: ColumnaOrdenable) => void;
}) {
  const activa = ordenColumna === columna;
  return (
    <button
      onClick={() => onClick(columna)}
      className="flex items-center gap-1 text-[11px] uppercase tracking-[.06em] text-ink-faint hover:text-ink-muted"
    >
      {label}
      <span className={activa ? "text-ink-secondary" : "text-ink-ghost"}>
        {activa ? (ordenDireccion === "asc" ? "▲" : "▼") : "▲"}
      </span>
    </button>
  );
}

function UsuariosPage() {
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [ordenColumna, setOrdenColumna] = useState<ColumnaOrdenable | null>(null);
  const [ordenDireccion, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [editando, setEditando] = useState<UsuarioDto | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRolId, setFormRolId] = useState(ROLES_DISPONIBLES[0].id);
  const [formImagenBase64, setFormImagenBase64] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [creando, setCreando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [nuevoRolId, setNuevoRolId] = useState(ROLES_DISPONIBLES[0].id);
  const [creandoGuardando, setCreandoGuardando] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  useEffect(() => {
    cargarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, busquedaDebounced, filtroRol, filtroEstado, ordenColumna, ordenDireccion]);

  async function cargarUsuarios() {
    setCargando(true);
    setError("");
    try {
      const resultado = await obtenerUsuarios({
        page,
        pageSize,
        busqueda: busquedaDebounced || undefined,
        ordenarPor: ordenColumna ?? undefined,
        ordenDireccion,
        rol: filtroRol || undefined,
        activo: filtroEstado ? filtroEstado === "activo" : undefined,
      });
      setUsuarios(resultado.items);
      setTotalCount(resultado.totalCount);
      setTotalPages(resultado.totalPages);
    } catch {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setCargando(false);
    }
  }

  function cambiarOrden(columna: ColumnaOrdenable) {
    if (ordenColumna === columna) {
      setOrdenDireccion((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setOrdenColumna(columna);
      setOrdenDireccion("asc");
    }
    setPage(1);
  }

  function cambiarFiltroRol(v: string) {
    setFiltroRol(v);
    setPage(1);
  }

  function cambiarFiltroEstado(v: string) {
    setFiltroEstado(v);
    setPage(1);
  }

  function cambiarPageSize(nuevo: number) {
    setPageSize(nuevo);
    setPage(1);
  }

  function abrirEdicion(u: UsuarioDto) {
    setEditando(u);
    setFormNombre(u.nombre);
    setFormEmail(u.email);
    setFormRolId(u.rolId);
    setFormImagenBase64(u.imagenBase64);
  }

  async function guardarEdicion() {
    if (!editando) return;
    setGuardando(true);
    try {
      await actualizarUsuario(editando.id, {
        nombre: formNombre,
        email: formEmail,
        rolId: formRolId,
        imagenBase64: formImagenBase64,
      });
      setEditando(null);
      await cargarUsuarios();
    } catch {
      setError("No se pudo guardar el cambio.");
    } finally {
      setGuardando(false);
    }
  }

  async function crear() {
    setCreandoGuardando(true);
    try {
      await crearUsuario({
        nombre: nuevoNombre,
        email: nuevoEmail,
        password: nuevoPassword,
        rolId: nuevoRolId,
      });
      setCreando(false);
      setNuevoNombre("");
      setNuevoEmail("");
      setNuevoPassword("");
      setNuevoRolId(ROLES_DISPONIBLES[0].id);
      await cargarUsuarios();
    } catch {
      setError("No se pudo crear el usuario.");
    } finally {
      setCreandoGuardando(false);
    }
  }

  async function toggleEstado(u: UsuarioDto) {
    const nuevoEstado = !u.activo;
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, activo: nuevoEstado } : x)));
    try {
      await cambiarEstadoUsuario(u.id);
      toast.success(nuevoEstado ? `${u.nombre} fue activado` : `${u.nombre} fue desactivado`);
    } catch {
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, activo: u.activo } : x)));
      setError("No se pudo cambiar el estado del usuario.");
      toast.error("No se pudo cambiar el estado del usuario.");
    }
  }

  const editandoEsUsuarioActual = editando ? user?.id === String(editando.id) : false;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-4 border-b border-line bg-page/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">Gestión de usuarios</span>
        <div className="flex items-center gap-3">
          <div className="flex h-[34px] min-w-[200px] items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[13px] text-ink-disabled">
            <span className="font-mono">⌕</span>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink-disabled"
            />
          </div>
          <Select value={filtroRol || "todos"} onValueChange={(v) => cambiarFiltroRol(v === "todos" ? "" : v)}>
            <SelectTrigger
              style={{ height: "34px" }}
              className="rounded-lg border-line-strong bg-surface px-3 text-[13px] text-ink-secondary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los roles</SelectItem>
              {ROLES_DISPONIBLES.map((r) => (
                <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroEstado || "todos"} onValueChange={(v) => cambiarFiltroEstado(v === "todos" ? "" : v)}>
            <SelectTrigger
              style={{ height: "34px" }}
              className="rounded-lg border-line-strong bg-surface px-3 text-[13px] text-ink-secondary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
          <BotonExportar
            url="/reportes/exportar/usuarios"
            params={{
              busqueda: busquedaDebounced || undefined,
              ordenarPor: ordenColumna ?? undefined,
              ordenDireccion,
              rol: filtroRol || undefined,
              activo: filtroEstado ? filtroEstado === "activo" : undefined,
            }}
            nombreDato="usuarios"
            hayDatos={totalCount > 0}
          />
          <button
            onClick={() => setCreando(true)}
            className="h-[34px] rounded-lg border-none bg-brand px-3.5 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
          >
            + Nuevo usuario
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="text-[15px] font-semibold">Usuarios</span>
            <span className="text-[13px] text-ink-faint">{totalCount} usuarios registrados</span>
          </div>

          <div className="grid grid-cols-[2.2fr_1.4fr_1fr_1fr_auto] items-center gap-4 border-b border-line bg-surface-raised px-5 py-3">
            <EncabezadoOrdenable label="Usuario" columna="nombre" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Correo" columna="email" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Rol" columna="rolNombre" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Estado" columna="activo" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <span className="text-right text-[11px] uppercase tracking-[.06em] text-ink-faint">Acciones</span>
          </div>

          {cargando ? (
            <div className="px-5 py-6 text-sm text-ink-faint">Cargando usuarios...</div>
          ) : usuarios.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink-faint">No hay usuarios que coincidan con los filtros.</div>
          ) : (
            usuarios.map((u) => {
              const esUsuarioActual = user?.id === String(u.id);

              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[2.2fr_1.4fr_1fr_1fr_auto] items-center gap-4 border-b border-line-subtle px-5 py-3.5 transition-colors hover:bg-surface-sunken"
                >
                  <div className="flex items-center gap-3">
                    <Avatar imagenBase64={u.imagenBase64} iniciales={iniciales(u.nombre)} className="h-9 w-9 text-xs" />
                    <span className="text-sm font-medium">
                      {u.nombre}
                      {esUsuarioActual && <span className="ml-1.5 text-xs text-ink-disabled">(tú)</span>}
                    </span>
                  </div>
                  <span className="text-[13px] text-ink-muted">{u.email}</span>
                  <span className="text-xs font-medium" style={{ color: ROL_COLOR[u.rolNombre] ?? "var(--color-ink-muted)" }}>
                    {u.rolNombre}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => !esUsuarioActual && toggleEstado(u)}
                      disabled={esUsuarioActual}
                      title={esUsuarioActual ? "No puedes desactivar tu propia cuenta" : undefined}
                      className={`relative h-[22px] w-[38px] rounded-full border-none transition-colors ${
                        esUsuarioActual ? "cursor-not-allowed opacity-50" : ""
                      }`}
                      style={{ background: u.activo ? "var(--color-brand)" : "var(--color-line-strong)" }}
                    >
                      <span
                        className="absolute top-[3px] h-4 w-4 rounded-full bg-surface transition-all"
                        style={{ left: u.activo ? "19px" : "3px" }}
                      />
                    </button>
                    <span
                      className="text-xs font-medium"
                      style={{ color: u.activo ? "var(--color-positive)" : "var(--color-ink-faint)" }}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => abrirEdicion(u)}
                      className="h-8 rounded-lg border border-line-strong bg-transparent px-3 text-[13px] font-medium text-ink-secondary hover:border-line-hover hover:bg-hover-strong"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })
          )}

          <Paginador
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={cambiarPageSize}
          />
        </div>
      </main>

      {editando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold">Editar usuario</h2>
            <div className="flex flex-col gap-4">
              <CampoImagen value={formImagenBase64} onChange={setFormImagenBase64} />
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-ink-secondary">Nombre</label>
                <input
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-ink-secondary">Correo</label>
                <input
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-[13px] font-medium ${editandoEsUsuarioActual ? "text-ink-disabled" : "text-ink-secondary"}`}>
                  Rol {editandoEsUsuarioActual && "(no puedes cambiar el tuyo)"}
                </label>
                {editandoEsUsuarioActual ? (
                  <div className="h-[42px] rounded-[9px] border border-line bg-surface-raised px-3 text-sm leading-[42px] text-ink-faint">
                    {editando?.rolNombre}
                  </div>
                ) : (
                  <Select value={String(formRolId)} onValueChange={(v) => setFormRolId(Number(v))}>
                    <SelectTrigger
                      style={{ height: "42px" }}
                      className="w-full rounded-[9px] border-line-strong bg-panel px-3 text-sm text-ink"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES_DISPONIBLES.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditando(null)} className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong">
                Cancelar
              </button>
              <button onClick={guardarEdicion} disabled={guardando} className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60">
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {creando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold">Nuevo usuario</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-ink-secondary">Nombre</label>
                <input
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-ink-secondary">Correo</label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-ink-secondary">Contraseña temporal</label>
                <input
                  type="password"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  className="h-[42px] rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-ink-secondary">Rol</label>
                <Select value={String(nuevoRolId)} onValueChange={(v) => setNuevoRolId(Number(v))}>
                  <SelectTrigger
                    style={{ height: "42px" }}
                    className="w-full rounded-[9px] border-line-strong bg-panel px-3 text-sm text-ink"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES_DISPONIBLES.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCreando(false)} className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong">
                Cancelar
              </button>
              <button onClick={crear} disabled={creandoGuardando} className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60">
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
