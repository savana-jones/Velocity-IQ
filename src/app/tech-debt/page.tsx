"use client";
import { useState,useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {  signOut } from "next-auth/react";
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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Integrations", icon: GitPullRequest, path: "/connections" },
  { label: "Technical Debt", icon: AlertTriangle, path: "/tech-debt" },
  { label: "Dependencies", icon: GitBranch, path: "/dependencies" },
  { label: "Commit Analyzer", icon: FileText, path: "/commits" },
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;

type TechDebtItem = {
  id: string;
  module: string;
  riskScore: number;
  codeQuality: number;
  changeFrequency: number;
  businessPriority: string;
  bugCount: number;
  filesAffected: string[];
  jiraTicket?: string;
  lastUpdated: string;
  complexity: number;
  duplication: number;
};



const TechnicalDebtPage = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"risk" | "bugs" | "updated">("risk");

  const [techDebtItems, setTechDebtItems] = useState<TechDebtItem[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadTechDebt();
}, []);

const loadTechDebt = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/tech-debt');
    const data = await response.json();

    if (data.success) {
      setTechDebtItems(data.items);
    } else {
      setError(data.error || 'Failed to load technical debt');
    }
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return "text-red-500";
    if (score >= 6) return "text-orange-500";
    return "text-yellow-500";
  };

  const getRiskBg = (score: number) => {
    if (score >= 8) return "bg-red-500/10 border-red-500/30";
    if (score >= 6) return "bg-orange-500/10 border-orange-500/30";
    return "bg-yellow-500/10 border-yellow-500/30";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "P0") return "text-red-500 bg-red-500/10 border-red-500/30";
    if (priority === "P1") return "text-orange-500 bg-orange-500/10 border-orange-500/30";
    return "text-blue-500 bg-blue-500/10 border-blue-500/30";
  };

  // Filter and sort
  let filteredDebt = techDebtItems;
  if (filterPriority !== "all") {
    filteredDebt = filteredDebt.filter((item) => item.businessPriority === filterPriority);
  }
  filteredDebt = [...filteredDebt].sort((a, b) => {
    if (sortBy === "risk") return b.riskScore - a.riskScore;
    if (sortBy === "bugs") return b.bugCount - a.bugCount;
    return 0; // For "updated", keep original order
  });

  const createJiraTicket = (item: TechDebtItem) => {
    alert(`Creating Jira ticket for ${item.module}...\n\nTitle: Fix Technical Debt in ${item.module}\nRisk Score: ${item.riskScore}/10\nPriority: ${item.businessPriority}`);
  };
  if (loading) return <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="text-yellow-500">Loading Technical Debt...</div>
      </div>;
  if (error) return <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="text-yellow-500">Error: {error}</div></div>;

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
            const isSelected = label === "Technical Debt";
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
            <h2 className="text-2xl font-semibold text-yellow-500">Technical Debt</h2>
            <div className="text-sm text-gray-400">
              {filteredDebt.length} items found
            </div>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="all">All Priorities</option>
                <option value="P0">P0 Only</option>
                <option value="P1">P1 Only</option>
                <option value="P2">P2 Only</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="risk">Risk Score</option>
                <option value="bugs">Bug Count</option>
                <option value="updated">Last Updated</option>
              </select>
            </div>
          </div>

          {/* Technical Debt List */}
          <div className="space-y-4">
            {filteredDebt.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-zinc-900 border rounded-xl overflow-hidden transition ${getRiskBg(
                    item.riskScore
                  )}`}
                >
                  {/* Header */}
                  <div
                    className="p-5 cursor-pointer hover:bg-zinc-800/50 transition"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {item.module}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(
                              item.businessPriority
                            )}`}
                          >
                            {item.businessPriority}
                          </span>
                          {item.jiraTicket && (
                            <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-500 rounded border border-blue-500/30">
                              {item.jiraTicket}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-gray-400">Risk Score: </span>
                            <span className={`font-bold ${getRiskColor(item.riskScore)}`}>
                              {item.riskScore}/10
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Bugs: </span>
                            <span className="text-red-400 font-semibold">{item.bugCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Files: </span>
                            <span className="text-white">{item.filesAffected.length}</span>
                          </div>
                          <div className="text-gray-500 text-xs">
                            Updated {item.lastUpdated}
                          </div>
                        </div>
                      </div>
                      <button className="text-yellow-500 hover:text-yellow-400 transition">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-zinc-800">
                      <div className="grid grid-cols-2 gap-6 mt-4 mb-4">
                        {/* Metrics */}
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-500 mb-3">
                            Metrics
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Code Quality:</span>
                              <span className="text-white">{item.codeQuality}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Change Frequency:</span>
                              <span className="text-white">{item.changeFrequency}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Complexity:</span>
                              <span className="text-white">{item.complexity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Code Duplication:</span>
                              <span className="text-white">{item.duplication}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Files Affected */}
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-500 mb-3">
                            Files Affected
                          </h4>
                          <div className="space-y-1">
                            {item.filesAffected.map((file) => (
                              <div
                                key={file}
                                className="text-xs bg-black px-2 py-1 rounded border border-zinc-700 text-gray-300 font-mono"
                              >
                                {file}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-4">
                        {!item.jiraTicket && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              createJiraTicket(item);
                            }}
                            className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
                          >
                            Create Jira Ticket
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        {item.jiraTicket && (
                          <button
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                          >
                            View in Jira
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button className="px-4 py-2 bg-zinc-800 text-yellow-500 font-semibold rounded-lg hover:bg-zinc-700 transition">
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TechnicalDebtPage;