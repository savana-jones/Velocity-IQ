"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Bell,
  User,
  Menu,
  X,
  Home,
  Settings,
  Activity,
  GitPullRequest,
  BarChart2,
  FileText,
  MapPin,
} from "lucide-react";

const platformsList = [
  {
    key: "github",
    name: "GitHub",
    logo: "/github-logo.svg",
    description: "Connect your GitHub account to sync repositories and issues.",
  },
  {
    key: "jira",
    name: "Jira",
    logo: "/jira-logo.png",
    description: "Connect your Jira account to sync issues and sprints.",
  },
  {
    key: "zendesk",
    name: "Zendesk",
    logo: "/zendesk-logo.png",
    description: "Connect your Zendesk account to sync tickets and customers.",
  },
  {
    key: "salesforce",
    name: "Salesforce",
    logo: "/salesforce-logo.png",
    description: "Connect Salesforce to sync CRM data and leads.",
  },
];

type ConnectionKeys = "github" | "jira" | "zendesk" | "salesforce";

const navItems = [
  { label: "Home", icon: Home },
  { label: "Connections", icon: GitPullRequest },
  { label: "Sync Monitor", icon: Activity },
  { label: "Field Mapping", icon: MapPin },
  { label: "Analytics", icon: BarChart2 },
  { label: "Reports", icon: FileText },
  { label: "Settings", icon: Settings },
];

const ConnectionsPage = () => {
  const [connections, setConnections] = useState<
    Record<ConnectionKeys, boolean>
  >({
    github: false,
    jira: false,
    zendesk: false,
    salesforce: false,
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleConnection = (platform: ConnectionKeys) => {
    setConnections((prev) => ({ ...prev, [platform]: !prev[platform] }));
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
          {navItems.map(({ label, icon: Icon }) => {
            const isSelected = label === "Connections";
            return (
              <button
                key={label}
                className={`flex items-center gap-3 px-4 py-3 rounded transition
          ${
            isSelected
              ? "bg-yellow-500 text-black"
              : "hover:bg-zinc-800 hover:text-yellow-500"
          }
        `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors
            ${isSelected ? "text-black" : "text-yellow-500"}
          `}
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

        {/* Cards */}
        <main className="flex-1 p-8 bg-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platformsList.map((platform) => {
              const key = platform.key as ConnectionKeys;
              return (
                <div
                  key={platform.key}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Image
                        src={platform.logo}
                        alt={`${platform.name} Logo`}
                        width={40}
                        height={40}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-yellow-500">
                      {platform.name}
                    </h3>
                  </div>
                  <p className="text-gray-300 mb-6">{platform.description}</p>
                  <button
                    onClick={() =>
                      setConnections((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                    className={`px-4 py-2 rounded font-semibold transition ${
                      connections[key]
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-yellow-500 text-black hover:bg-yellow-600"
                    }`}
                  >
                    {connections[key] ? "Connected" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConnectionsPage;
