import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, cargando } = useAuth();

  if (cargando) {
    return <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-[#a1a1aa]">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user!.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;