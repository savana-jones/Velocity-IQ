"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Bell,
  Menu,
  X,
  Home,
  GitPullRequest,
  AlertTriangle,
  GitBranch,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

/* ----------------------------- Types & Data ----------------------------- */
type RiskTrendDatum = {
  week: string;
  critical: number;
  high: number;
  medium: number;
};

type HighRiskModule = {
  module: string;
  riskScore: number;
  files: number;
  priority: string;
};

const navItems = [
  { label: "Dashboard", icon: Home, path: "/" },
  { label: "Integrations", icon: GitPullRequest, path: "/connections" },
  { label: "Technical Debt", icon: AlertTriangle, path: "/tech-debt" },
  { label: "Dependencies", icon: GitBranch, path: "/dependencies" },
  { label: "Commit Analyzer", icon: FileText, path: "/commits" },
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;

// Mock data for risk trends over time
const riskTrendData: RiskTrendDatum[] = [
  { week: "Week 1", critical: 5, high: 12, medium: 20 },
  { week: "Week 2", critical: 7, high: 15, medium: 18 },
  { week: "Week 3", critical: 4, high: 10, medium: 22 },
  { week: "Week 4", critical: 8, high: 14, medium: 19 },
];

// Mock data for high-risk modules
const highRiskModules: HighRiskModule[] = [
  { module: "Payment Gateway", riskScore: 9.2, files: 8, priority: "P0" },
  { module: "Authentication", riskScore: 8.7, files: 12, priority: "P0" },
  { module: "User Profile", riskScore: 7.5, files: 6, priority: "P1" },
  { module: "Notification Service", riskScore: 6.8, files: 5, priority: "P2" },
  { module: "Admin Dashboard", riskScore: 5.9, files: 10, priority: "P1" },
];

// Recent alerts/activities
const recentAlerts = [
  {
    id: 1,
    type: "critical",
    message: "Payment Gateway module exceeds critical risk threshold",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "warning",
    message: "3 new task dependencies detected in Sprint 24",
    time: "5 hours ago",
  },
  {
    id: 3,
    type: "success",
    message: "Authentication module tech debt reduced by 15%",
    time: "1 day ago",
  },
];

/* --------------------------- Custom UI Pieces --------------------------- */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 border border-yellow-500/70 px-3 py-2 rounded-lg shadow-lg text-sm">
        <p className="text-yellow-500 font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap gap-4 mt-2 justify-center">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-300 capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const ConnectionsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
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
            const isSelected = label === "Dashboard";
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
            <div className="relative">
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 cursor-pointer"
              >
                <Image
                  src="/profile.jpg"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-zinc-800 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 bg-black overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-yellow-500">Risk Overview</h2>
            <button className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition">
              Sync Now
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
            <div className="p-6 bg-zinc-900 rounded-xl shadow hover:shadow-lg transition border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Tech Debt</h3>
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-white">47</p>
              <p className="text-xs text-gray-500 mt-1">+5 from last week</p>
            </div>

            <div className="p-6 bg-zinc-900 rounded-xl shadow hover:shadow-lg transition border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Critical Risk</h3>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-500">8</p>
              <p className="text-xs text-gray-500 mt-1">Needs immediate action</p>
            </div>

            <div className="p-6 bg-zinc-900 rounded-xl shadow hover:shadow-lg transition border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Dependencies</h3>
                <GitBranch className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-white">23</p>
              <p className="text-xs text-gray-500 mt-1">12 hidden, 11 known</p>
            </div>

            <div className="p-6 bg-zinc-900 rounded-xl shadow hover:shadow-lg transition border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Resolved</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-500">134</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Risk Trend Line Chart */}
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <h3 className="text-lg font-medium text-yellow-500 mb-4">
                Risk Trends Over Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="week" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                  <Line
                    type="monotone"
                    dataKey="critical"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="medium"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Risk Modules Bar Chart */}
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <h3 className="text-lg font-medium text-yellow-500 mb-4">
                Top 5 High-Risk Modules
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={highRiskModules} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" domain={[0, 10]} stroke="#888" />
                  <YAxis dataKey="module" type="category" stroke="#888" width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="riskScore" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-lg font-medium text-yellow-500 mb-4">
              Recent Alerts
            </h3>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 bg-black rounded-lg border border-zinc-800 hover:border-yellow-500/50 transition"
                >
                  {alert.type === "critical" && (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  {alert.type === "warning" && (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  {alert.type === "success" && (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-white">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConnectionsPage;