import { Link } from "react-router-dom";

function NoAutorizado() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#09090b] text-[#fafafa]">
      <p className="text-lg font-semibold">No tienes permiso para ver esta página</p>
      <Link to="/login" className="text-sm text-[#a1a1aa] hover:text-[#fafafa]">Volver al inicio</Link>
    </div>
  );
}

export default NoAutorizado;