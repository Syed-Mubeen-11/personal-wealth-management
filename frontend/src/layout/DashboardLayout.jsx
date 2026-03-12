import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex bg-slate-950 min-h-screen">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-8">
          {children}
        </div>
      </div>

    </div>
  );
}

export default DashboardLayout;