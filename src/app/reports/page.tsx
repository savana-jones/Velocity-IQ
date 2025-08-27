"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  Home,
  GitPullRequest,
  Activity,
  MapPin,
  BarChart2,
  FileText,
  Settings,
  Download,
  Filter,
} from "lucide-react";

/* ----------------------------- Nav Items ----------------------------- */
const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Connections", icon: GitPullRequest, path: "/connections" },
  { label: "Sync Monitor", icon: Activity, path: "/sync-monitor" },
  { label: "Field Mapping", icon: MapPin, path: "/field-mapping" },
  { label: "Analytics", icon: BarChart2, path: "/analytics" },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;

/* ----------------------------- Sample Data ----------------------------- */
const reportsData = [
  { id: 1, name: "Weekly Sync Summary", date: "2025-08-20", status: "Completed" },
  { id: 2, name: "Failed Sync Report", date: "2025-08-21", status: "Error" },
  { id: 3, name: "Connection Health Report", date: "2025-08-22", status: "Completed" },
  { id: 4, name: "Monthly Usage Report", date: "2025-08-23", status: "In Progress" },
];

/* ----------------------------- Reports Page ----------------------------- */
const ReportsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && (
            <h2 className="text-2xl font-bold text-yellow-500">VelocityIQ</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-yellow-500 focus:outline-none"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <nav className="flex-1 flex flex-col mt-4">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isSelected = label === "Reports";
            return (
              <button
                key={label}
                onClick={() => router.push(path)}
                className={`flex items-center gap-3 px-4 py-3 rounded transition
                  ${
                    isSelected
                      ? "bg-yellow-500 text-black"
                      : "hover:bg-zinc-800 hover:text-yellow-500"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isSelected ? "text-black" : "text-yellow-500"
                  }`}
                />
                {sidebarOpen && (
                  <span className={`${isSelected ? "text-black" : ""}`}>{label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
              <Image
                src="/logo.jpg"
                alt="Logo"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <span className="text-xl font-semibold text-yellow-500">VelocityIQ</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6 text-yellow-500 cursor-pointer" />
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 cursor-pointer">
              <Image
                src="/profile.jpg"
                alt="Profile"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 bg-black overflow-auto">
          <h2 className="text-2xl font-semibold text-yellow-500 mb-6">Reports</h2>

          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-zinc-800">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-zinc-900 rounded-xl shadow border border-zinc-800">
            <table className="w-full text-left">
              <thead className="bg-zinc-800 text-yellow-500">
                <tr>
                  <th className="px-6 py-3">Report Name</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {reportsData.map((report) => (
                  <tr key={report.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-6 py-4">{report.name}</td>
                    <td className="px-6 py-4">{report.date}</td>
                    <td
                      className={`px-6 py-4 font-medium ${
                        report.status === "Completed"
                          ? "text-green-400"
                          : report.status === "Error"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {report.status}
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-3 py-1 text-sm bg-yellow-500 text-black rounded hover:bg-yellow-400">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
