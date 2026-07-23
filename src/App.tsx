import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Login from "@/pages/Login";
import AdminLayout from "./components/layout/AdminLayout";
import CanchasPage from "./pages/admin/CanchasPage";
import UsuariosPage from "./pages/admin/UsuariosPage";

import ProtectedRoute from "@/components/ProtectedRoute";
import NoAutorizado from "@/pages/NoAutorizado";
import { Navigate } from "react-router-dom";
import ClienteLayout from "@/components/layout/ClienteLayout";
import ReservarPage from "@/pages/cliente/ReservarPage";
import ReservasPage from "@/pages/admin/ReservasPage";
import EnConstruccion from "@/components/EnConstruccion";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={["Administrador", "Operador"]} />
            }
          >
            <Route element={<AdminLayout />}>
              <Route
                index
                path="/admin"
                element={<Navigate to="/admin/canchas" replace />}
              />
              <Route path="/admin/canchas" element={<CanchasPage />} />
              <Route path="/admin/usuarios" element={<UsuariosPage />} />
              <Route path="/admin/reservas" element={<ReservasPage />} />
              <Route path="/admin/articulos" element={<EnConstruccion titulo="Artículos" />} />
              <Route path="/admin/configuracion" element={<EnConstruccion titulo="Configuración" />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["Cliente"]} />}>
            <Route element={<ClienteLayout />}>
              <Route path="/reservas" element={<ReservarPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
