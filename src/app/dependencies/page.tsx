"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Link as LinkIcon,
  XCircle,
  Maximize2,
  List,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/" },
  { label: "Integrations", icon: GitPullRequest, path: "/connections" },
  { label: "Technical Debt", icon: AlertTriangle, path: "/tech-debt" },
  { label: "Dependencies", icon: GitBranch, path: "/dependencies" },
  { label: "Commit Analyzer", icon: FileText, path: "/commits" },
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;

type ConnectionKeys = "github" | "jira" | "sonarqube";
type DependencyType = "hidden" | "known" | "suggested";
type DependencyStatus = "pending" | "confirmed" | "dismissed";

type Dependency = {
  id: string;
  source: {
    id: string;
    title: string;
    assignee: string;
    status: string;
  };
  target: {
    id: string;
    title: string;
    assignee: string;
    status: string;
  };
  type: DependencyType;
  status: DependencyStatus;
  confidence: number;
  reasons: string[];
  detectedDate: string;
  sharedFiles: string[];
};

const mockDependencies: Dependency[] = [
  {
    id: "DEP-001",
    source: {
      id: "PROJ-234",
      title: "Implement OAuth2 authentication",
      assignee: "Alice",
      status: "In Progress",
    },
    target: {
      id: "PROJ-267",
      title: "Add user session management",
      assignee: "Bob",
      status: "In Progress",
    },
    type: "hidden",
    status: "pending",
    confidence: 92,
    reasons: [
      "Both tasks modify UserService.ts",
      "Semantic similarity: 87%",
      "Both mention 'authentication' and 'session'",
    ],
    detectedDate: "2 hours ago",
    sharedFiles: ["UserService.ts", "auth.middleware.ts"],
  },
  {
    id: "DEP-002",
    source: {
      id: "PROJ-156",
      title: "Redesign payment flow UI",
      assignee: "Carol",
      status: "In Progress",
    },
    target: {
      id: "PROJ-178",
      title: "Update payment gateway API",
      assignee: "Dave",
      status: "Code Review",
    },
    type: "hidden",
    status: "pending",
    confidence: 85,
    reasons: [
      "Both modify payment-related files",
      "High temporal correlation in commits",
      "Shared component dependencies",
    ],
    detectedDate: "5 hours ago",
    sharedFiles: ["PaymentForm.tsx", "payment.service.ts", "checkout.controller.ts"],
  },
  {
    id: "DEP-003",
    source: {
      id: "PROJ-189",
      title: "Add real-time notifications",
      assignee: "Eve",
      status: "To Do",
    },
    target: {
      id: "PROJ-201",
      title: "Implement WebSocket infrastructure",
      assignee: "Frank",
      status: "In Progress",
    },
    type: "suggested",
    status: "confirmed",
    confidence: 95,
    reasons: [
      "Notification system requires WebSocket",
      "Explicit dependency in requirements",
      "Both tickets linked in comments",
    ],
    detectedDate: "1 day ago",
    sharedFiles: ["websocket.service.ts", "notification.handler.ts"],
  },
  {
    id: "DEP-004",
    source: {
      id: "PROJ-145",
      title: "Optimize database queries",
      assignee: "Grace",
      status: "Done",
    },
    target: {
      id: "PROJ-223",
      title: "Update analytics dashboard",
      assignee: "Henry",
      status: "In Progress",
    },
    type: "known",
    status: "confirmed",
    confidence: 78,
    reasons: [
      "Dashboard relies on optimized queries",
      "Performance improvements impact analytics",
    ],
    detectedDate: "2 days ago",
    sharedFiles: ["analytics.service.ts", "database.util.ts"],
  },
  {
    id: "DEP-005",
    source: {
      id: "PROJ-198",
      title: "Refactor authentication module",
      assignee: "Ivy",
      status: "Code Review",
    },
    target: {
      id: "PROJ-212",
      title: "Add multi-factor authentication",
      assignee: "Jack",
      status: "To Do",
    },
    type: "hidden",
    status: "pending",
    confidence: 88,
    reasons: [
      "MFA requires updated auth module",
      "Semantic similarity: 91%",
      "Both modify AuthService.ts",
    ],
    detectedDate: "3 hours ago",
    sharedFiles: ["AuthService.ts", "mfa.handler.ts"],
  },
];

// Graph node type
type GraphNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "task";
  data: {
    assignee: string;
    status: string;
  };
};

type GraphEdge = {
  source: string;
  target: string;
  type: DependencyType;
  status: DependencyStatus;
  confidence: number;
};

const DependenciesPage = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dependencies, setDependencies] = useState(mockDependencies);
  const [filterType, setFilterType] = useState<"all" | DependencyType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | DependencyStatus>("all");
  const [selectedDep, setSelectedDep] = useState<Dependency | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate graph data
  const generateGraphData = () => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Create unique nodes
    dependencies.forEach((dep) => {
      if (!nodeMap.has(dep.source.id)) {
        nodeMap.set(dep.source.id, {
          id: dep.source.id,
          x: 0,
          y: 0,
          label: dep.source.id,
          type: "task",
          data: {
            assignee: dep.source.assignee,
            status: dep.source.status,
          },
        });
      }
      if (!nodeMap.has(dep.target.id)) {
        nodeMap.set(dep.target.id, {
          id: dep.target.id,
          x: 0,
          y: 0,
          label: dep.target.id,
          type: "task",
          data: {
            assignee: dep.target.assignee,
            status: dep.target.status,
          },
        });
      }

      edges.push({
        source: dep.source.id,
        target: dep.target.id,
        type: dep.type,
        status: dep.status,
        confidence: dep.confidence,
      });
    });

    // Position nodes in a circular layout
    const nodeArray = Array.from(nodeMap.values());
    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    nodeArray.forEach((node, i) => {
      const angle = (i / nodeArray.length) * 2 * Math.PI;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    return { nodes: nodeArray, edges };
  };

  // Draw graph
  useEffect(() => {
    if (viewMode !== "graph" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { nodes, edges } = generateGraphData();

    // Draw edges
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      // Edge color based on type
      let color = "#3b82f6"; // blue for known
      if (edge.type === "hidden") color = "#ef4444"; // red
      if (edge.type === "suggested") color = "#eab308"; // yellow

      // Opacity based on status
      const opacity = edge.status === "dismissed" ? 0.2 : edge.status === "confirmed" ? 1 : 0.6;

      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      ctx.stroke();

      // Draw arrow
      const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
      const arrowSize = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(
        targetNode.x - 20 * Math.cos(angle),
        targetNode.y - 20 * Math.sin(angle)
      );
      ctx.lineTo(
        targetNode.x - 20 * Math.cos(angle) - arrowSize * Math.cos(angle - Math.PI / 6),
        targetNode.y - 20 * Math.sin(angle) - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        targetNode.x - 20 * Math.cos(angle) - arrowSize * Math.cos(angle + Math.PI / 6),
        targetNode.y - 20 * Math.sin(angle) - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw nodes
    nodes.forEach((node) => {
      // Node circle
      ctx.fillStyle = "#18181b"; // zinc-900
      ctx.strokeStyle = "#eab308"; // yellow-500
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Node label
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y - 30);

      // Assignee
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "10px sans-serif";
      ctx.fillText(node.data.assignee, node.x, node.y + 35);
    });
  }, [viewMode, dependencies]);

  const getTypeColor = (type: DependencyType) => {
    if (type === "hidden") return "text-red-500 bg-red-500/10 border-red-500/30";
    if (type === "suggested") return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    return "text-blue-500 bg-blue-500/10 border-blue-500/30";
  };

  const getStatusColor = (status: DependencyStatus) => {
    if (status === "confirmed") return "text-green-500";
    if (status === "dismissed") return "text-gray-500";
    return "text-orange-500";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-500";
    if (confidence >= 75) return "text-yellow-500";
    return "text-orange-500";
  };

  const handleConfirm = (id: string) => {
    setDependencies((prev) =>
      prev.map((dep) =>
        dep.id === id ? { ...dep, status: "confirmed" as DependencyStatus } : dep
      )
    );
  };

  const handleDismiss = (id: string) => {
    setDependencies((prev) =>
      prev.map((dep) =>
        dep.id === id ? { ...dep, status: "dismissed" as DependencyStatus } : dep
      )
    );
  };

  const handleLink = (dep: Dependency) => {
    alert(
      `Linking tickets in Jira:\n\n${dep.source.id} → ${dep.target.id}\n\nThis would create a "blocks" relationship in Jira.`
    );
    handleConfirm(dep.id);
  };

  // Filter logic
  let filteredDeps = dependencies;
  if (filterType !== "all") {
    filteredDeps = filteredDeps.filter((dep) => dep.type === filterType);
  }
  if (filterStatus !== "all") {
    filteredDeps = filteredDeps.filter((dep) => dep.status === filterStatus);
  }

  const stats = {
    total: dependencies.length,
    hidden: dependencies.filter((d) => d.type === "hidden").length,
    pending: dependencies.filter((d) => d.status === "pending").length,
    confirmed: dependencies.filter((d) => d.status === "confirmed").length,
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
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 flex flex-col mt-4">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isSelected = label === "Dependencies";
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-yellow-500">Task Dependencies</h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">{filteredDeps.length} dependencies</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("graph")}
                  className={`px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                    viewMode === "graph"
                      ? "bg-yellow-500 text-black"
                      : "bg-zinc-800 text-gray-400 hover:text-yellow-500"
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  Graph
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                    viewMode === "list"
                      ? "bg-yellow-500 text-black"
                      : "bg-zinc-800 text-gray-400 hover:text-yellow-500"
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-400">Hidden</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{stats.hidden}</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-400">Pending</span>
              </div>
              <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-400">Confirmed</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats.confirmed}</p>
            </div>
          </div>

          {/* Graph View */}
          {viewMode === "graph" && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-500">Dependency Graph</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-400">Hidden</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-400">Suggested</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-400">Known</span>
                  </div>
                </div>
              </div>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full bg-black rounded-lg border border-zinc-700"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Interactive graph showing task dependencies. Arrows indicate "depends on" relationships.
              </p>
            </div>
          )}

          {/* Filters */}
          {viewMode === "list" && (
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="all">All Types</option>
                <option value="hidden">Hidden Only</option>
                <option value="suggested">Suggested Only</option>
                <option value="known">Known Only</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Only</option>
                <option value="confirmed">Confirmed Only</option>
                <option value="dismissed">Dismissed Only</option>
              </select>
            </div>
          )}

          {/* Dependencies List */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {filteredDeps.map((dep) => (
                <div
                  key={dep.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-yellow-500/50 transition"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded border ${getTypeColor(
                          dep.type
                        )}`}
                      >
                        {dep.type.toUpperCase()}
                      </span>
                      <span className={`text-sm font-semibold ${getStatusColor(dep.status)}`}>
                        {dep.status.charAt(0).toUpperCase() + dep.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">Detected {dep.detectedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Confidence:</span>
                      <span className={`text-sm font-bold ${getConfidenceColor(dep.confidence)}`}>
                        {dep.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Dependency Visualization */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Source Task */}
                    <div className="bg-black rounded-lg p-4 border border-zinc-700">
                      <div className="text-xs text-gray-500 mb-1">Source Task</div>
                      <div className="text-sm font-semibold text-yellow-500 mb-1">
                        {dep.source.id}
                      </div>
                      <div className="text-sm text-white mb-2">{dep.source.title}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Assignee: {dep.source.assignee}</span>
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">
                          {dep.source.status}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <GitBranch className="w-6 h-6 text-yellow-500" />
                        <span className="text-xs text-gray-500">depends on</span>
                      </div>
                    </div>

                    {/* Target Task */}
                    <div className="bg-black rounded-lg p-4 border border-zinc-700">
                      <div className="text-xs text-gray-500 mb-1">Target Task</div>
                      <div className="text-sm font-semibold text-yellow-500 mb-1">
                        {dep.target.id}
                      </div>
                      <div className="text-sm text-white mb-2">{dep.target.title}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Assignee: {dep.target.assignee}</span>
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">
                          {dep.target.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Detection Reasons:</div>
                    <div className="space-y-1">
                      {dep.reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span className="text-gray-300">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shared Files */}
                  {dep.sharedFiles.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Shared Files:</div>
                      <div className="flex flex-wrap gap-2">
                        {dep.sharedFiles.map((file) => (
                          <span
                            key={file}
                            className="px-2 py-1 bg-black text-gray-300 text-xs rounded border border-zinc-700 font-mono"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {dep.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleLink(dep)}
                        className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Link in Jira
                      </button>
                      <button
                        onClick={() => handleConfirm(dep.id)}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleDismiss(dep.id)}
                        className="px-4 py-2 bg-zinc-800 text-gray-400 font-semibold rounded-lg hover:bg-zinc-700 transition flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DependenciesPage;