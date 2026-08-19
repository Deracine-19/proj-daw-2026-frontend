interface AvatarProps {
  imagenBase64?: string | null;
  iniciales: string;
  className?: string;
}

// Presentacional puro (sin interactividad) — Sidebar/ClienteNavbar lo envuelven en su propio
// <button> para el menú de usuario; UsuariosPage lo usa directo en cada fila de la tabla.
function Avatar({ imagenBase64, iniciales, className = "h-9 w-9 text-xs" }: AvatarProps) {
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-line-strong font-semibold text-ink-secondary ${className}`}
    >
      {imagenBase64 ? <img src={imagenBase64} alt="" className="h-full w-full object-cover" /> : <span>{iniciales}</span>}
    </div>
  );
}

export default Avatar;
