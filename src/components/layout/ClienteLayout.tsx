import { Outlet } from "react-router-dom";
import ClienteNavbar from "./ClienteNavbar";

function ClienteLayout() {
  return (
    <div className="relative min-h-screen w-full bg-[#09090b] font-sans text-[#fafafa]">
      <ClienteNavbar />
      <Outlet />
    </div>
  );
}

export default ClienteLayout;