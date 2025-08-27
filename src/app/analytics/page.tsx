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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/* ----------------------------- Types & Data ----------------------------- */
type SyncDatum = { day: string; Success: number; Failed: number };

type TooltipItem = {
  color?: string;
  name?: string | number;
  value?: number | string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
};

type LegendEntry = {
  color?: string;
  value?: string | number;
};

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Connections", icon: GitPullRequest, path: "/connections" },
  { label: "Sync Monitor", icon: Activity, path: "/sync-monitor" },
  { label: "Field Mapping", icon: MapPin, path: "/field-mapping" },
  { label: "Analytics", icon: BarChart2, path: "/analytics" },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;

const syncData: SyncDatum[] = [
  { day: "Mon", Success: 40, Failed: 5 },
  { day: "Tue", Success: 55, Failed: 8 },
  { day: "Wed", Success: 60, Failed: 3 },
  { day: "Thu", Success: 50, Failed: 6 },
  { day: "Fri", Success: 70, Failed: 2 },
];

/* --------------------------- Custom UI Pieces --------------------------- */
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 border border-yellow-500/70 px-3 py-2 rounded-lg shadow-lg text-sm">
        <p className="text-yellow-500 font-semibold">{label}</p>
        {payload.map((entry: TooltipItem, index: number) => (
          <p key={index} style={{ color: entry.color || "#e5e7eb" }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: { payload?: LegendEntry[] }) => {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap gap-4 mt-2">
      {payload.map((entry: LegendEntry, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color || "#999" }}
          />
          <span className="text-sm text-gray-300">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

/* --------------------------------- Page -------------------------------- */
const AnalyticsPage = () => {
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
            const isSelected = label === "Analytics";
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
          <h2 className="text-2xl font-semibold text-yellow-500 mb-6">Analytics</h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-zinc-900 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-lg font-medium text-yellow-500">Connections</h3>
              <p className="text-3xl font-bold mt-2">12</p>
            </div>
            <div className="p-6 bg-zinc-900 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-lg font-medium text-yellow-500">Total Syncs</h3>
              <p className="text-3xl font-bold mt-2">275</p>
            </div>
            <div className="p-6 bg-zinc-900 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-lg font-medium text-yellow-500">Errors</h3>
              <p className="text-3xl font-bold mt-2 text-red-500">15</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Line Chart */}
            <div className="bg-zinc-900 p-6 rounded-xl">
              <h3 className="text-lg font-medium text-yellow-500 mb-4">Sync Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={syncData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                  <Line type="monotone" dataKey="Success" stroke="#08ff6fff" strokeWidth={2} />
                  <Line type="monotone" dataKey="Failed" stroke="#FF4D4D" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-zinc-900 p-6 rounded-xl">
              <h3 className="text-lg font-medium text-yellow-500 mb-4">
                Sync Success vs Failures
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={syncData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                  <Bar dataKey="Success" fill="#08ff6fff" />
                  <Bar dataKey="Failed" fill="#FF4D4D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
