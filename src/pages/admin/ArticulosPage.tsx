import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import {
  obtenerArticulos,
  crearArticulo,
  actualizarArticulo,
  cambiarEstadoArticulo,
} from "@/services/articuloService";

import type { ArticuloDto } from "@/types/articulo";

const FORM_VACIO = {
  nombre: "",
  descripcion: "",
  precio: 0,
};

function mensajeError(
  error: unknown,
  mensajePredeterminado: string
): string {
  if (
    isAxiosError(error) &&
    typeof error.response?.data?.mensaje === "string"
  ) {
    return error.response.data.mensaje;
  }

  return mensajePredeterminado;
}

function formatoMoneda(valor: number): string {
  return `L ${valor.toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function validarFormulario(formulario: typeof FORM_VACIO): string {
  if (!formulario.nombre.trim()) {
    return "El nombre del artículo es obligatorio.";
  }

  if (formulario.nombre.trim().length > 100) {
    return "El nombre no puede superar los 100 caracteres.";
  }

  if (formulario.descripcion.trim().length > 500) {
    return "La descripción no puede superar los 500 caracteres.";
  }

  if (formulario.precio <= 0) {
    return "El precio debe ser mayor que cero.";
  }

  return "";
}

function ArticulosPage() {
  const [articulos, setArticulos] = useState<ArticuloDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [creando, setCreando] = useState(false);
  const [formNuevo, setFormNuevo] = useState(FORM_VACIO);
  const [errorNuevo, setErrorNuevo] = useState("");
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

  const [editando, setEditando] =
    useState<ArticuloDto | null>(null);

  const [formEditar, setFormEditar] = useState(FORM_VACIO);
  const [errorEditar, setErrorEditar] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] =
    useState(false);

  useEffect(() => {
    cargarArticulos();
  }, []);

  async function cargarArticulos() {
    setCargando(true);
    setError("");

    try {
      const respuesta = await obtenerArticulos();
      setArticulos(respuesta);
    } catch {
      setError("No se pudo cargar la lista de artículos.");
    } finally {
      setCargando(false);
    }
  }

  function abrirFormularioNuevo() {
    setFormNuevo(FORM_VACIO);
    setErrorNuevo("");
    setCreando(true);
  }

  function cerrarFormularioNuevo() {
    if (guardandoNuevo) {
      return;
    }

    setCreando(false);
    setErrorNuevo("");
  }

  async function guardarArticuloNuevo() {
    const mensajeValidacion = validarFormulario(formNuevo);

    if (mensajeValidacion) {
      setErrorNuevo(mensajeValidacion);
      return;
    }

    setGuardandoNuevo(true);
    setErrorNuevo("");

    try {
      const articuloCreado = await crearArticulo({
        nombre: formNuevo.nombre.trim(),
        descripcion: formNuevo.descripcion.trim(),
        precio: formNuevo.precio,
        estado: true,
      });

      setArticulos((anteriores) => [
        ...anteriores,
        articuloCreado,
      ]);

      setCreando(false);
      setFormNuevo(FORM_VACIO);

      toast.success(
        `Artículo ${articuloCreado.nombre} creado correctamente.`
      );
    } catch (error) {
      setErrorNuevo(
        mensajeError(
          error,
          "No se pudo crear el artículo."
        )
      );
    } finally {
      setGuardandoNuevo(false);
    }
  }

  function abrirFormularioEditar(articulo: ArticuloDto) {
    setEditando(articulo);
    setErrorEditar("");

    setFormEditar({
      nombre: articulo.nombre,
      descripcion: articulo.descripcion,
      precio: articulo.precio,
    });
  }

  function cerrarFormularioEditar() {
    if (guardandoEdicion) {
      return;
    }

    setEditando(null);
    setErrorEditar("");
  }

  async function guardarArticuloEditado() {
    if (!editando) {
      return;
    }

    const mensajeValidacion = validarFormulario(formEditar);

    if (mensajeValidacion) {
      setErrorEditar(mensajeValidacion);
      return;
    }

    setGuardandoEdicion(true);
    setErrorEditar("");

    try {
      const articuloActualizado =
        await actualizarArticulo(editando.id, {
          nombre: formEditar.nombre.trim(),
          descripcion: formEditar.descripcion.trim(),
          precio: formEditar.precio,
          estado: editando.estado,
        });

      setArticulos((anteriores) =>
        anteriores.map((articulo) =>
          articulo.id === articuloActualizado.id
            ? articuloActualizado
            : articulo
        )
      );

      setEditando(null);

      toast.success(
        `Artículo ${articuloActualizado.nombre} actualizado.`
      );
    } catch (error) {
      setErrorEditar(
        mensajeError(
          error,
          "No se pudo actualizar el artículo."
        )
      );
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function alternarEstado(articulo: ArticuloDto) {
    try {
      const articuloActualizado =
        await cambiarEstadoArticulo(articulo.id);

      setArticulos((anteriores) =>
        anteriores.map((item) =>
          item.id === articuloActualizado.id
            ? articuloActualizado
            : item
        )
      );

      toast.success(
        articuloActualizado.estado
          ? `Artículo ${articuloActualizado.nombre} habilitado.`
          : `Artículo ${articuloActualizado.nombre} deshabilitado.`
      );
    } catch (error) {
      toast.error(
        mensajeError(
          error,
          "No se pudo cambiar el estado del artículo."
        )
      );
    }
  }

  const articulosOrdenados = [...articulos].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", {
      sensitivity: "base",
    })
  );

  const cantidadActivos = articulos.filter(
    (articulo) => articulo.estado
  ).length;

  const cantidadInactivos =
    articulos.length - cantidadActivos;

  const precioPromedio =
    articulos.length > 0
      ? articulos.reduce(
          (total, articulo) => total + articulo.precio,
          0
        ) / articulos.length
      : 0;

  const estadisticas = [
    {
      titulo: "Total de artículos",
      valor: articulos.length.toString(),
      descripcion: "Registrados",
    },
    {
      titulo: "Artículos activos",
      valor: cantidadActivos.toString(),
      descripcion: "Disponibles",
    },
    {
      titulo: "Artículos inactivos",
      valor: cantidadInactivos.toString(),
      descripcion: "No disponibles",
    },
    {
      titulo: "Precio promedio",
      valor: formatoMoneda(precioPromedio),
      descripcion: "Por artículo",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between gap-4 border-b border-line bg-page/80 px-7 backdrop-blur-md">
        <span className="text-base font-semibold tracking-[-0.01em]">
          Gestión de artículos
        </span>

        <button
          onClick={abrirFormularioNuevo}
          className="h-[34px] rounded-lg border-none bg-brand px-3.5 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover"
        >
          + Nuevo artículo
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-7">
        {error && (
          <p className="text-sm text-negative">{error}</p>
        )}

        <div className="grid grid-cols-4 gap-4">
          {estadisticas.map((estadistica) => (
            <div
              key={estadistica.titulo}
              className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-surface p-[18px]"
            >
              <span className="text-xs uppercase tracking-[.06em] text-ink-faint">
                {estadistica.titulo}
              </span>

              <span className="text-[26px] font-semibold tracking-[-0.02em]">
                {estadistica.valor}
              </span>

              <span className="text-xs font-medium text-ink-faint">
                {estadistica.descripcion}
              </span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="text-[15px] font-semibold">
              Artículos
            </span>

            <span className="text-[13px] text-ink-faint">
              {articulos.length} artículos registrados
            </span>
          </div>

          <div className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 border-b border-line bg-surface-raised px-5 py-3">
            <span className="text-[11px] uppercase tracking-[.06em] text-ink-faint">
              Artículo
            </span>

            <span className="text-[11px] uppercase tracking-[.06em] text-ink-faint">
              Precio
            </span>

            <span className="text-[11px] uppercase tracking-[.06em] text-ink-faint">
              Estado
            </span>

            <span className="text-right text-[11px] uppercase tracking-[.06em] text-ink-faint">
              Acciones
            </span>
          </div>

          {cargando ? (
            <div className="px-5 py-6 text-sm text-ink-faint">
              Cargando artículos...
            </div>
          ) : articulosOrdenados.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-ink-faint">
              No hay artículos registrados.
            </div>
          ) : (
            articulosOrdenados.map((articulo) => (
              <div
                key={articulo.id}
                className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 border-b border-line-subtle px-5 py-3.5 transition-colors hover:bg-surface-sunken"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {articulo.nombre}
                  </span>

                  <span className="text-xs text-ink-faint">
                    {articulo.descripcion ||
                      "Sin descripción"}
                  </span>
                </div>

                <span className="font-mono text-sm font-medium">
                  {formatoMoneda(articulo.precio)}
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => alternarEstado(articulo)}
                    className="relative h-[22px] w-[38px] rounded-full border-none transition-colors"
                    style={{
                      background: articulo.estado
                        ? "var(--color-brand)"
                        : "var(--color-line-strong)",
                    }}
                    aria-label={
                      articulo.estado
                        ? "Desactivar artículo"
                        : "Activar artículo"
                    }
                  >
                    <span
                      className="absolute top-[3px] h-4 w-4 rounded-full bg-surface transition-all"
                      style={{
                        left: articulo.estado
                          ? "19px"
                          : "3px",
                      }}
                    />
                  </button>

                  <span
                    className="text-xs font-medium"
                    style={{
                      color: articulo.estado
                        ? "var(--color-positive)"
                        : "var(--color-ink-faint)",
                    }}
                  >
                    {articulo.estado
                      ? "Activo"
                      : "Inactivo"}
                  </span>
                </div>

                <button
                  onClick={() =>
                    abrirFormularioEditar(articulo)
                  }
                  className="h-8 rounded-lg border border-line-strong bg-transparent px-3 text-[13px] font-medium text-ink-secondary hover:border-line-hover hover:bg-hover-strong"
                >
                  Editar
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {creando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-[14px] border border-line bg-surface p-6">
            <h2 className="mb-5 text-base font-semibold">
              Nuevo artículo
            </h2>

            <div className="flex flex-col gap-4">
              <CampoTexto
                label="Nombre"
                value={formNuevo.nombre}
                maxLength={100}
                onChange={(valor) =>
                  setFormNuevo({
                    ...formNuevo,
                    nombre: valor,
                  })
                }
              />

              <CampoDescripcion
                label="Descripción"
                value={formNuevo.descripcion}
                maxLength={500}
                onChange={(valor) =>
                  setFormNuevo({
                    ...formNuevo,
                    descripcion: valor,
                  })
                }
              />

              <CampoPrecio
                label="Precio"
                value={formNuevo.precio}
                onChange={(valor) =>
                  setFormNuevo({
                    ...formNuevo,
                    precio: valor,
                  })
                }
              />
            </div>

            {errorNuevo && (
              <p className="mt-4 text-sm text-negative">
                {errorNuevo}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={cerrarFormularioNuevo}
                disabled={guardandoNuevo}
                className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                onClick={guardarArticuloNuevo}
                disabled={guardandoNuevo}
                className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
              >
                {guardandoNuevo
                  ? "Guardando..."
                  : "Crear artículo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-[14px] border border-line bg-surface p-6">
            <h2 className="mb-5 text-base font-semibold">
              Editar artículo
            </h2>

            <div className="flex flex-col gap-4">
              <CampoTexto
                label="Nombre"
                value={formEditar.nombre}
                maxLength={100}
                onChange={(valor) =>
                  setFormEditar({
                    ...formEditar,
                    nombre: valor,
                  })
                }
              />

              <CampoDescripcion
                label="Descripción"
                value={formEditar.descripcion}
                maxLength={500}
                onChange={(valor) =>
                  setFormEditar({
                    ...formEditar,
                    descripcion: valor,
                  })
                }
              />

              <CampoPrecio
                label="Precio"
                value={formEditar.precio}
                onChange={(valor) =>
                  setFormEditar({
                    ...formEditar,
                    precio: valor,
                  })
                }
              />
            </div>

            {errorEditar && (
              <p className="mt-4 text-sm text-negative">
                {errorEditar}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={cerrarFormularioEditar}
                disabled={guardandoEdicion}
                className="h-9 rounded-lg border border-line-strong bg-transparent px-4 text-[13px] font-medium text-ink-secondary hover:bg-hover-strong disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                onClick={guardarArticuloEditado}
                disabled={guardandoEdicion}
                className="h-9 rounded-lg border-none bg-brand px-4 text-[13px] font-semibold text-brand-foreground hover:bg-brand-hover disabled:opacity-60"
              >
                {guardandoEdicion
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CampoTexto({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">
        {label}
      </label>

      <input
        value={value}
        maxLength={maxLength}
        onChange={(evento) =>
          onChange(evento.target.value)
        }
        className="h-10.5 rounded-[9px] border border-line-strong bg-panel px-3 text-sm text-ink outline-none focus:border-ink-disabled"
      />
    </div>
  );
}

function CampoDescripcion({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">
        {label}
      </label>

      <textarea
        value={value}
        maxLength={maxLength}
        rows={4}
        onChange={(evento) =>
          onChange(evento.target.value)
        }
        className="resize-none rounded-[9px] border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-disabled"
      />

      <span className="text-right text-[11px] text-ink-faint">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

function CampoPrecio({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (valor: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink-secondary">
        {label}
      </label>

      <div className="flex overflow-hidden rounded-[9px] border border-line-strong bg-panel focus-within:border-ink-disabled">
        <span className="flex items-center border-r border-line-strong px-3 text-sm text-ink-muted">
          L
        </span>

        <input
          type="number"
          min="0.01"
          step="0.01"
          value={value}
          onChange={(evento) =>
            onChange(Number(evento.target.value))
          }
          className="h-10.5 flex-1 bg-transparent px-3 text-sm text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
}

export default ArticulosPage;