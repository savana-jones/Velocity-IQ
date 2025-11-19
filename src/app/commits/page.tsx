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
  AlertTriangle,
  GitBranch,
  FileText,
  Settings,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Copy,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/" },
  { label: "Integrations", icon: GitPullRequest, path: "/connections" },
  { label: "Technical Debt", icon: AlertTriangle, path: "/tech-debt" },
  { label: "Dependencies", icon: GitBranch, path: "/dependencies" },
  { label: "Commit Analyzer", icon: FileText, path: "/commits" },
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;

type CommitQuality = "good" | "poor" | "average";

type Commit = {
  id: string;
  hash: string;
  author: string;
  message: string;
  timestamp: string;
  repository: string;
  filesChanged: number;
  quality: CommitQuality;
  qualityScore: number;
  issues: string[];
  suggestion?: string;
  branch: string;
};

const mockCommits: Commit[] = [
  {
    id: "C-001",
    hash: "a3f2b1c",
    author: "Alice Johnson",
    message: "fixed bug",
    timestamp: "2 hours ago",
    repository: "frontend-app",
    filesChanged: 3,
    quality: "poor",
    qualityScore: 3.2,
    issues: [
      "Too vague - what bug was fixed?",
      "No ticket reference",
      "Missing context about what changed",
    ],
    suggestion: "fix(auth): resolve login timeout issue for OAuth users\n\nFixed a bug where OAuth login would timeout after 30s due to incorrect session handling.\n\nCloses PROJ-234",
    branch: "feature/auth-fix",
  },
  {
    id: "C-002",
    hash: "d4e5f6a",
    author: "Bob Smith",
    message: "updates",
    timestamp: "3 hours ago",
    repository: "backend-api",
    filesChanged: 8,
    quality: "poor",
    qualityScore: 2.8,
    issues: [
      "Extremely vague",
      "Large changeset (8 files) needs better explanation",
      "No scope or type specified",
    ],
    suggestion: "refactor(payment): restructure payment gateway integration\n\nReorganized payment service architecture:\n- Split PaymentService into separate handlers\n- Added retry logic for failed transactions\n- Improved error handling and logging\n\nAffects: PaymentService, TransactionHandler, PaymentGateway\nRefs PROJ-456",
    branch: "refactor/payment-service",
  },
  {
    id: "C-003",
    hash: "b7c8d9e",
    author: "Carol Davis",
    message: "feat(dashboard): add real-time user analytics with WebSocket support\n\nImplemented real-time analytics dashboard that updates live user metrics using WebSocket connections. Added filtering by date range and user segments.\n\nCloses PROJ-189",
    timestamp: "5 hours ago",
    repository: "analytics-dashboard",
    filesChanged: 5,
    quality: "good",
    qualityScore: 9.1,
    issues: [],
    branch: "feature/realtime-analytics",
  },
  {
    id: "C-004",
    hash: "e1f2g3h",
    author: "Dave Wilson",
    message: "fix stuff",
    timestamp: "1 day ago",
    repository: "frontend-app",
    filesChanged: 2,
    quality: "poor",
    qualityScore: 2.5,
    issues: [
      "Too vague - what was fixed?",
      "Informal language ('stuff')",
      "No technical details",
    ],
    suggestion: "fix(ui): correct alignment issues in payment form\n\nFixed CSS flexbox alignment in PaymentForm component that caused buttons to overlap on mobile devices.\n\nCloses PROJ-567",
    branch: "bugfix/form-alignment",
  },
  {
    id: "C-005",
    hash: "i4j5k6l",
    author: "Eve Brown",
    message: "chore: update dependencies and fix security vulnerabilities\n\nUpdated lodash, axios, and react-router to latest versions. Resolved 3 high-severity security issues identified by npm audit.\n\nSecurity fixes:\n- CVE-2023-1234 in lodash\n- CVE-2023-5678 in axios\n\nRefs PROJ-890",
    timestamp: "1 day ago",
    repository: "frontend-app",
    filesChanged: 2,
    quality: "good",
    qualityScore: 8.7,
    issues: [],
    branch: "chore/dependency-updates",
  },
  {
    id: "C-006",
    hash: "m7n8o9p",
    author: "Frank Miller",
    message: "WIP",
    timestamp: "2 days ago",
    repository: "backend-api",
    filesChanged: 4,
    quality: "poor",
    qualityScore: 1.8,
    issues: [
      "Work in progress commits should not be pushed to main branches",
      "No description of what's being worked on",
      "Consider using feature branches",
    ],
    suggestion: "feat(notifications): implement email notification service (WIP)\n\nAdding email notification system:\n- Set up SMTP configuration\n- Created email templates for user events\n- TODO: Add queue management for bulk emails\n\nRefs PROJ-345",
    branch: "feature/notifications",
  },
  {
    id: "C-007",
    hash: "q1r2s3t",
    author: "Grace Lee",
    message: "Added new feature",
    timestamp: "2 days ago",
    repository: "mobile-app",
    filesChanged: 6,
    quality: "average",
    qualityScore: 5.5,
    issues: [
      "Lacks specificity - what feature?",
      "Should use conventional commit format",
      "Missing ticket reference",
    ],
    suggestion: "feat(profile): add profile photo upload and cropping\n\nImplemented profile photo management:\n- File upload with drag-and-drop support\n- Image cropping with aspect ratio lock\n- Automatic thumbnail generation\n- Integration with cloud storage\n\nCloses PROJ-678",
    branch: "feature/profile-photo",
  },
];

const CommitAnalyzerPage = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterQuality, setFilterQuality] = useState<"all" | CommitQuality>("all");
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCommits);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCommits(newExpanded);
  };

  const copyToClipboard = (text: string, hash: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getQualityColor = (quality: CommitQuality) => {
    if (quality === "good") return "text-green-500 bg-green-500/10 border-green-500/30";
    if (quality === "poor") return "text-red-500 bg-red-500/10 border-red-500/30";
    return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
  };

  const getQualityIcon = (quality: CommitQuality) => {
    if (quality === "good") return <ThumbsUp className="w-4 h-4" />;
    if (quality === "poor") return <ThumbsDown className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  // Filter logic
  let filteredCommits = mockCommits;
  if (filterQuality !== "all") {
    filteredCommits = filteredCommits.filter((c) => c.quality === filterQuality);
  }

  const stats = {
    total: mockCommits.length,
    good: mockCommits.filter((c) => c.quality === "good").length,
    poor: mockCommits.filter((c) => c.quality === "poor").length,
    average: mockCommits.filter((c) => c.quality === "average").length,
    avgScore: (
      mockCommits.reduce((sum, c) => sum + c.qualityScore, 0) / mockCommits.length
    ).toFixed(1),
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
            const isSelected = label === "Commit Analyzer";
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
            <h2 className="text-2xl font-semibold text-yellow-500">Commit Analyzer</h2>
            <div className="text-sm text-gray-400">{filteredCommits.length} commits</div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-xs text-gray-400 mb-1">Total Commits</div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-xs text-gray-400 mb-1">Good Quality</div>
              <p className="text-2xl font-bold text-green-500">{stats.good}</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-xs text-gray-400 mb-1">Average Quality</div>
              <p className="text-2xl font-bold text-yellow-500">{stats.average}</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-xs text-gray-400 mb-1">Poor Quality</div>
              <p className="text-2xl font-bold text-red-500">{stats.poor}</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-xs text-gray-400 mb-1">Avg Score</div>
              <p className={`text-2xl font-bold ${getScoreColor(Number(stats.avgScore))}`}>
                {stats.avgScore}/10
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-4 mb-6">
            <select
              value={filterQuality}
              onChange={(e) => setFilterQuality(e.target.value as any)}
              className="bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All Quality Levels</option>
              <option value="good">Good Only</option>
              <option value="average">Average Only</option>
              <option value="poor">Poor Only</option>
            </select>
          </div>

          {/* Commits List */}
          <div className="space-y-4">
            {filteredCommits.map((commit) => {
              const isExpanded = expandedCommits.has(commit.id);
              return (
                <div
                  key={commit.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-yellow-500/50 transition"
                >
                  {/* Header */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => toggleExpand(commit.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded border flex items-center gap-1 ${getQualityColor(
                            commit.quality
                          )}`}
                        >
                          {getQualityIcon(commit.quality)}
                          {commit.quality.toUpperCase()}
                        </span>
                        <span className={`text-lg font-bold ${getScoreColor(commit.qualityScore)}`}>
                          {commit.qualityScore}/10
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{commit.timestamp}</div>
                        <div className="text-xs text-gray-400 font-mono">{commit.hash}</div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="text-sm text-gray-400 mb-1">
                        {commit.author} • {commit.repository} • {commit.branch}
                      </div>
                      <div className="text-white font-mono text-sm bg-black px-3 py-2 rounded border border-zinc-700">
                        {commit.message}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {commit.filesChanged} files changed
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-zinc-800 pt-4">
                      {/* Issues */}
                      {commit.issues.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Issues Detected
                          </h4>
                          <div className="space-y-2">
                            {commit.issues.map((issue, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-sm bg-red-500/5 border border-red-500/20 rounded p-2"
                              >
                                <span className="text-red-500 mt-0.5">•</span>
                                <span className="text-gray-300">{issue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Good commit message */}
                      {commit.quality === "good" && (
                        <div className="bg-green-500/5 border border-green-500/20 rounded p-3 mb-4">
                          <div className="flex items-center gap-2 text-green-500 text-sm font-semibold mb-1">
                            <CheckCircle className="w-4 h-4" />
                            Well-Structured Commit
                          </div>
                          <div className="text-xs text-gray-400">
                            This commit follows conventional commit format with clear scope, detailed description, and ticket reference.
                          </div>
                        </div>
                      )}

                      {/* Suggestion */}
                      {commit.suggestion && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Suggested Improvement
                          </h4>
                          <div className="relative">
                            <pre className="text-sm bg-black text-green-400 p-3 rounded border border-zinc-700 overflow-x-auto font-mono whitespace-pre-wrap">
                              {commit.suggestion}
                            </pre>
                            <button
                              onClick={() => copyToClipboard(commit.suggestion!, commit.hash)}
                              className="absolute top-2 right-2 p-2 bg-zinc-800 rounded hover:bg-zinc-700 transition"
                              title="Copy to clipboard"
                            >
                              {copiedHash === commit.hash ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Best Practices Tip */}
                      {commit.quality === "poor" && (
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded p-3">
                          <div className="text-xs text-gray-300">
                            <strong className="text-yellow-500">💡 Best Practice:</strong> Use conventional commits format:
                            <code className="text-yellow-500 ml-1">type(scope): description</code>
                            <br />
                            Types: feat, fix, docs, style, refactor, test, chore
                          </div>
                        </div>
                      )}
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

export default CommitAnalyzerPage;