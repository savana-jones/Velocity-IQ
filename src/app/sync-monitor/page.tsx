"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, User, Menu, X, Home, GitPullRequest, Activity, MapPin, BarChart2, FileText, Settings } from "lucide-react";

const syncJobsList = [
  { id: 1, platform: "GitHub", logo: "/github-logo.svg", jobName: "Sync Repositories", status: "success", lastRun: "2025-08-26 10:32 AM" },
  { id: 2, platform: "Jira", logo: "/jira-logo.png", jobName: "Sync Issues", status: "pending", lastRun: "2025-08-26 09:15 AM" },
  { id: 3, platform: "Zendesk", logo: "/zendesk-logo.png", jobName: "Sync Tickets", status: "failed", lastRun: "2025-08-25 08:45 PM" },
  { id: 4, platform: "Salesforce", logo: "/salesforce-logo.png", jobName: "Sync Leads", status: "success", lastRun: "2025-08-26 11:00 AM" },
];

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Connections", icon: GitPullRequest, path: "/connections" },
  { label: "Sync Monitor", icon: Activity, path: "/sync-monitor" },
  { label: "Field Mapping", icon: MapPin, path: "/field-mapping" },
  { label: "Analytics", icon: BarChart2, path: "/analytics" },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const SyncMonitorPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-600 text-black";
      case "failed": return "bg-red-600 text-black";
      case "pending": return "bg-yellow-500 text-black";
      default: return "bg-gray-600 text-black";
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300`}>
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && <h2 className="text-2xl font-bold text-yellow-500">VelocityIQ</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-yellow-500 focus:outline-none">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <nav className="flex-1 flex flex-col mt-4">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isSelected = label === "Sync Monitor";
            return (
              <button
                key={label}
                onClick={() => router.push(path)}
                className={`flex items-center gap-3 px-4 py-3 rounded transition
                  ${isSelected ? "bg-yellow-500 text-black" : "hover:bg-zinc-800 hover:text-yellow-500"}
                `}
              >
                <Icon className={`w-5 h-5 transition-colors ${isSelected ? "text-black" : "text-yellow-500"}`} />
                {sidebarOpen && <span className={`transition-colors ${isSelected ? "text-black" : ""}`}>{label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
              <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="object-cover" />
            </div>
            <span className="text-xl font-semibold text-yellow-500">VelocityIQ</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6 text-yellow-500 cursor-pointer" />
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 cursor-pointer">
              <Image src="/profile.jpg" alt="Profile" width={40} height={40} className="object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 bg-black overflow-auto">
          <h2 className="text-2xl font-semibold text-yellow-500 mb-6">Recent Sync Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {syncJobsList.map((job) => (
              <div key={job.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Image src={job.logo} alt={`${job.platform} Logo`} width={40} height={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-500">{job.jobName}</h3>
                </div>
                <p className="text-gray-300 mb-4">{job.platform}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded font-semibold ${getStatusColor(job.status)}`}>{job.status.toUpperCase()}</span>
                  <span className="text-gray-400 text-sm">{job.lastRun}</span>
                </div>
                <button className="mt-4 px-4 py-2 rounded bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition">View Details</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SyncMonitorPage;
