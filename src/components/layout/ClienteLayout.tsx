import { Outlet } from "react-router-dom";
import ClienteNavbar from "./ClienteNavbar";

function ClienteLayout() {
  return (
    <div className="relative min-h-screen w-full bg-page font-sans text-ink">
      <ClienteNavbar />
      <Outlet />
    </div>
  );
}

export default ClienteLayout;