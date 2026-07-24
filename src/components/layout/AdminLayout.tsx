import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full bg-page font-sans text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;