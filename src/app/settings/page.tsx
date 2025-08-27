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
  Moon,
  Sun,
  Trash2,
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

/* ----------------------------- Settings Page ----------------------------- */
const SettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
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
            const isSelected = label === "Settings";
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
          <h2 className="text-2xl font-semibold text-yellow-500 mb-6">Settings</h2>

          {/* Profile Settings */}
          <section className="mb-8 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-yellow-500 mb-4">Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                className="p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-yellow-500"
              />
              <input
                type="email"
                placeholder="Email"
                className="p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-yellow-500"
              />
              <input
                type="password"
                placeholder="New Password"
                className="p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-yellow-500"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <button className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400">
              Save Changes
            </button>
          </section>

          {/* Preferences */}
          <section className="mb-8 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-yellow-500 mb-4">Preferences</h3>
            <div className="flex items-center justify-between mb-4">
              <span>Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 px-3 py-1 border border-yellow-500 rounded-lg hover:bg-zinc-800"
              >
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                {darkMode ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <button
                onClick={() => setNotifications(!notifications)}
                className="flex items-center gap-2 px-3 py-1 border border-yellow-500 rounded-lg hover:bg-zinc-800"
              >
                {notifications ? "On" : "Off"}
              </button>
            </div>
          </section>

          {/* System Settings */}
          <section className="mb-8 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-yellow-500 mb-4">System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-yellow-500">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Deutsch</option>
                <option>Français</option>
              </select>
              <select className="p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-yellow-500">
                <option>UTC</option>
                <option>GMT</option>
                <option>EST</option>
                <option>PST</option>
              </select>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-red-800">
            <h3 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
