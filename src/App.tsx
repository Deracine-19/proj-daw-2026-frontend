import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Login from "@/pages/Login";
import AdminLayout from "./components/layout/AdminLayout";
import CanchasPage from "./pages/admin/CanchasPage";
import UsuariosPage from "./pages/admin/UsuariosPage";
import ArticulosPage from "./pages/admin/ArticulosPage";
import DashboardPage from "./pages/admin/DashboardPage";

import ProtectedRoute from "@/components/ProtectedRoute";
import NoAutorizado from "@/pages/NoAutorizado";
import { Navigate } from "react-router-dom";
import ClienteLayout from "@/components/layout/ClienteLayout";
import ReservarPage from "@/pages/cliente/ReservarPage";
import ReservaConfirmadaPage from "@/pages/cliente/ReservaConfirmadaPage";
import MisReservasPage from "@/pages/cliente/MisReservasPage";
import ReservasPage from "@/pages/admin/ReservasPage";
import EnConstruccion from "@/components/EnConstruccion";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

function AdminIndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.rol === "Operador" ? "/admin/reservas" : "/admin/dashboard" } replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/no-autorizado" element={<NoAutorizado />} />

            <Route
              element={
                <ProtectedRoute allowedRoles={["Administrador", "Operador"]} />
              }
            >
              <Route element={<AdminLayout />}>
                <Route index path="/admin" element={<AdminIndexRedirect />} />
                <Route path="/admin/reservas" element={<ReservasPage />} />
                <Route path="/admin/dashboard" element={<DashboardPage />}/>

                <Route
                  element={<ProtectedRoute allowedRoles={["Administrador"]} />}
                >
                  <Route path="/admin/canchas" element={<CanchasPage />} />
                  <Route path="/admin/usuarios" element={<UsuariosPage />} />
                  <Route path="/admin/articulos" element={<ArticulosPage />} />
                  <Route
                    path="/admin/configuracion"
                    element={<EnConstruccion titulo="Configuración" />}
                  />
                </Route>
              </Route>
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["Cliente"]} />}>
              <Route element={<ClienteLayout />}>
                <Route path="/reservas" element={<ReservarPage />} />
                <Route path="/reservas/confirmacion/:id" element={<ReservaConfirmadaPage />} />
                <Route path="/mis-reservas" element={<MisReservasPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
