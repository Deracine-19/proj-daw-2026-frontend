import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { ImageOff } from "lucide-react";
import {
  obtenerArticulosPaginados,
  crearArticulo,
  actualizarArticulo,
  cambiarEstadoArticulo,
} from "@/services/articuloService";
import type { ArticuloDto } from "@/types/articulo";
import Paginador from "@/components/Paginador";
import CampoImagen from "@/components/CampoImagen";
import BotonExportar from "@/components/BotonExportar";

function mensajeError(err: unknown, fallback: string): string {
  if (isAxiosError(err) && typeof err.response?.data?.mensaje === "string") {
    return err.response.data.mensaje;
  }
  return fallback;
}

function formatoMoneda(n: number) {
  return "L " + n.toLocaleString("en-US");
}

const FORM_VACIO: { nombre: string; descripcion: string; precio: number; imagenBase64: string | null } = {
  nombre: "",
  descripcion: "",
  precio: 0,
  imagenBase64: null,
};

type ColumnaOrdenable = "nombre" | "precio" | "estado";

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

function ArticulosPage() {
  const [articulos, setArticulos] = useState<ArticuloDto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [ordenColumna, setOrdenColumna] = useState<ColumnaOrdenable | null>(null);
  const [ordenDireccion, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [editando, setEditando] = useState<ArticuloDto | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [formError, setFormError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [creando, setCreando] = useState(false);
  const [formNueva, setFormNueva] = useState(FORM_VACIO);
  const [formNuevaError, setFormNuevaError] = useState("");
  const [creandoGuardando, setCreandoGuardando] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, busquedaDebounced, ordenColumna, ordenDireccion]);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const resultado = await obtenerArticulosPaginados({
        page,
        pageSize,
        busqueda: busquedaDebounced || undefined,
        ordenarPor: ordenColumna ?? undefined,
        ordenDireccion,
      });
      setArticulos(resultado.items);
      setTotalCount(resultado.totalCount);
      setTotalPages(resultado.totalPages);
    } catch {
      setError("No se pudo cargar la lista de artículos.");
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

  function cambiarPageSize(nuevo: number) {
    setPageSize(nuevo);
    setPage(1);
  }

  function abrirEdicion(a: ArticuloDto) {
    setEditando(a);
    setFormError("");
    setForm({ nombre: a.nombre, descripcion: a.descripcion, precio: a.precio, imagenBase64: a.imagenBase64 });
  }

  async function guardarEdicion() {
    if (!editando) return;
    setGuardando(true);
    setFormError("");
    try {
      await actualizarArticulo(editando.id, { ...form, estado: editando.estado });
      setEditando(null);
      await cargar();
    } catch (err) {
      setFormError(mensajeError(err, "No se pudo guardar el cambio."));
    } finally {
      setGuardando(false);
    }
  }

  async function crear() {
    setCreandoGuardando(true);
    setFormNuevaError("");
    try {
      await crearArticulo(formNueva);
      setCreando(false);
      setFormNueva(FORM_VACIO);
      await cargar();
    } catch (err) {
      setFormNuevaError(mensajeError(err, "No se pudo crear el artículo."));
    } finally {
      setCreandoGuardando(false);
    }
  }

  async function toggleEstado(a: ArticuloDto) {
    try {
      const actualizado = await cambiarEstadoArticulo(a.id);
      setArticulos((prev) => prev.map((x) => (x.id === actualizado.id ? actualizado : x)));
      toast.success(
        actualizado.estado ? `${actualizado.nombre} habilitado` : `${actualizado.nombre} deshabilitado`
      );
    } catch {
      setError("No se pudo cambiar el estado del artículo.");
      toast.error(`No se pudo cambiar el estado de ${a.nombre}.`);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-4 border-b border-line bg-page/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">Gestión de artículos</span>
        <div className="flex items-center gap-3">
          <div className="flex h-[34px] min-w-[200px] items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-[13px] text-ink-disabled">
            <span className="font-mono">⌕</span>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar artículo..."
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink-disabled"
            />
          </div>
          <BotonExportar
            url="/reportes/exportar/articulos"
            params={{
              busqueda: busquedaDebounced || undefined,
              ordenarPor: ordenColumna ?? undefined,
              ordenDireccion,
            }}
            nombreDato="articulos"
          />
          <button
            onClick={() => {
              setFormNuevaError("");
              setCreando(true);
            }}
            className="h-[34px] rounded-lg border-none bg-brand px-3.5 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
          >
            + Nuevo artículo
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        {error && <p className="text-sm text-negative">{error}</p>}

        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="text-[15px] font-semibold">Artículos</span>
            <span className="text-[13px] text-ink-faint">{totalCount} artículos registrados</span>
          </div>

          <div className="grid grid-cols-[44px_2.3fr_1fr_1fr_auto] items-center gap-4 border-b border-line bg-surface-raised px-5 py-3">
            <span />
            <EncabezadoOrdenable label="Artículo" columna="nombre" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Precio" columna="precio" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <EncabezadoOrdenable label="Estado" columna="estado" ordenColumna={ordenColumna} ordenDireccion={ordenDireccion} onClick={cambiarOrden} />
            <span className="text-right text-[11px] uppercase tracking-[.06em] text-ink-faint">Acciones</span>
          </div>

          {cargando ? (
            <div className="px-5 py-6 text-sm text-ink-faint">Cargando artículos...</div>
          ) : articulos.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink-faint">No hay artículos que coincidan con la búsqueda.</div>
          ) : (
            articulos.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-[44px_2.3fr_1fr_1fr_auto] items-center gap-4 border-b border-line-subtle px-5 py-3.5 transition-colors hover:bg-surface-sunken"
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[8px] border border-line-strong bg-panel">
                  {a.imagenBase64 ? (
                    <img src={a.imagenBase64} alt={a.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff className="h-4 w-4 text-ink-disabled" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{a.nombre}</span>
                  <span className="text-xs text-ink-faint">{a.descripcion}</span>
                </div>
                <span className="font-mono text-sm font-medium">{formatoMoneda(a.precio)}</span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleEstado(a)}
                    className="relative h-[22px] w-[38px] rounded-full border-none transition-colors"
                    style={{ background: a.estado ? "var(--color-brand)" : "var(--color-line-strong)" }}
                  >
                    <span
                      className="absolute top-[3px] h-4 w-4 rounded-full bg-surface transition-all"
                      style={{ left: a.estado ? "19px" : "3px" }}
                    />
                  </button>
                  <span
                    className="text-xs font-medium"
                    style={{ color: a.estado ? "var(--color-positive)" : "var(--color-ink-faint)" }}
                  >
                    {a.estado ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => abrirEdicion(a)}
                    className="h-8 rounded-lg border border-line-strong bg-transparent px-3 text-[13px] font-medium text-ink-secondary hover:border-line-hover hover:bg-hover-strong"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
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
            <h2 className="mb-4 text-base font-semibold">Editar artículo</h2>
            <div className="flex flex-col gap-4">
              <CampoImagen value={form.imagenBase64} onChange={(v) => setForm({ ...form, imagenBase64: v })} />
              <Campo label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
              <Campo label="Descripción" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} />
              <CampoNumero label="Precio" value={form.precio} onChange={(v) => setForm({ ...form, precio: v })} />
            </div>
            {formError && <p className="mt-4 text-sm text-negative">{formError}</p>}
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
            <h2 className="mb-4 text-base font-semibold">Nuevo artículo</h2>
            <div className="flex flex-col gap-4">
              <CampoImagen value={formNueva.imagenBase64} onChange={(v) => setFormNueva({ ...formNueva, imagenBase64: v })} />
              <Campo label="Nombre" value={formNueva.nombre} onChange={(v) => setFormNueva({ ...formNueva, nombre: v })} />
              <Campo label="Descripción" value={formNueva.descripcion} onChange={(v) => setFormNueva({ ...formNueva, descripcion: v })} />
              <CampoNumero label="Precio" value={formNueva.precio} onChange={(v) => setFormNueva({ ...formNueva, precio: v })} />
            </div>
            {formNuevaError && <p className="mt-4 text-sm text-negative">{formNuevaError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCreando(false)} className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong">
                Cancelar
              </button>
              <button onClick={crear} disabled={creandoGuardando} className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60">
                {creandoGuardando ? "Creando..." : "Crear artículo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10.5 rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
      />
    </div>
  );
}

function CampoNumero({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10.5 rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

export default ArticulosPage;
