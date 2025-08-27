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
} from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Connections", icon: GitPullRequest, path: "/connections" },
  { label: "Sync Monitor", icon: Activity, path: "/sync-monitor" },
  { label: "Field Mapping", icon: MapPin, path: "/field-mapping" },
  { label: "Analytics", icon: BarChart2, path: "/analytics" },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const fieldMappings = [
  { id: 1, source: "GitHub Issue Title", destination: "Ticket Subject" },
  { id: 2, source: "GitHub Issue Body", destination: "Ticket Description" },
  { id: 3, source: "Jira Story Points", destination: "Effort Estimate" },
  { id: 4, source: "Zendesk Ticket Status", destination: "Case Status" },
];

const destinationOptions = [
  "Ticket Subject",
  "Ticket Description",
  "Effort Estimate",
  "Case Status",
  "Priority",
  "Assignee",
];

const FieldMappingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mappings, setMappings] = useState(fieldMappings);
  const router = useRouter();

  const handleMappingChange = (id: number, value: string) => {
    setMappings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, destination: value } : m))
    );
  };

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
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        <nav className="flex-1 flex flex-col mt-4">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isSelected = label === "Field Mapping";
            return (
              <button
                key={label}
                onClick={() => router.push(path)}
                className={`flex items-center gap-3 px-4 py-3 rounded transition
                  ${
                    isSelected
                      ? "bg-yellow-500 text-black"
                      : "hover:bg-zinc-800 hover:text-yellow-500"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isSelected ? "text-black" : "text-yellow-500"
                  }`}
                />
                {sidebarOpen && (
                  <span
                    className={`transition-colors ${
                      isSelected ? "text-black" : ""
                    }`}
                  >
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
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
            <span className="text-xl font-semibold text-yellow-500">
              VelocityIQ
            </span>
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

        {/* Field Mapping Table */}
        <main className="flex-1 p-8 bg-black overflow-auto">
          <h2 className="text-2xl font-semibold text-yellow-500 mb-6">
            Field Mapping
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-zinc-800 rounded-lg overflow-hidden">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="text-left px-6 py-3 border-b border-zinc-800 text-yellow-500">
                    Source Field
                  </th>
                  <th className="text-left px-6 py-3 border-b border-zinc-800 text-yellow-500">
                    Destination Field
                  </th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((map) => (
                  <tr key={map.id} className="hover:bg-zinc-800">
                    <td className="px-6 py-4 border-b border-zinc-800">
                      {map.source}
                    </td>
                    <td className="px-6 py-4 border-b border-zinc-800">
                      <select
                        value={map.destination}
                        onChange={(e) =>
                          handleMappingChange(map.id, e.target.value)
                        }
                        className="bg-zinc-900 text-yellow-500 border border-zinc-700 rounded px-3 py-1 focus:outline-none focus:border-yellow-500"
                      >
                        {destinationOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-6 px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition">
            Save Mappings
          </button>
        </main>
      </div>
    </div>
  );
};

export default FieldMappingPage;
