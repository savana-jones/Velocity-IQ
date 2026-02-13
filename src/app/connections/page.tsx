"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
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
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Integrations", icon: GitPullRequest, path: "/connections" },
  { label: "Technical Debt", icon: AlertTriangle, path: "/tech-debt" },
  { label: "Dependencies", icon: GitBranch, path: "/dependencies" },
  { label: "Commit Analyzer", icon: FileText, path: "/commits" },
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;

type ConnectionKeys = "github" | "jira" | "sonarqube";

type Integration = {
  key: ConnectionKeys;
  name: string;
  logo: string;
  description: string;
  features: string[];
};

const integrationsList: Integration[] = [
  {
    key: "github",
    name: "GitHub",
    logo: "/github-logo.svg",
    description: "Connect your GitHub repositories to analyze commit history, code changes, and bug patterns.",
    features: ["Commit analysis", "PR tracking", "File change history", "Bug pattern detection"],
  },
  {
    key: "jira",
    name: "Jira",
    logo: "/jira-logo.svg",
    description: "Sync Jira issues to map technical debt to business priorities and detect task dependencies.",
    features: ["Issue tracking", "Sprint data", "Business priority mapping", "Dependency detection"],
  },
  {
    key: "sonarqube",
    name: "SonarQube",
    logo: "/sonarqube-logo.png",
    description: "Import code quality metrics to calculate technical debt risk scores.",
    features: ["Code complexity", "Code smells", "Security vulnerabilities", "Technical debt ratio"],
  },
];

type ConnectionStatus = {
  connected: boolean;
  lastSync?: string;
  syncStatus?: "success" | "failed" | "pending";
  repoCount?: number;
  projectCount?: number;
  issueCount?: number;
  username?: string;
};

const IntegrationsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  
  const [connections, setConnections] = useState<Record<ConnectionKeys, ConnectionStatus>>({
    github: {
      connected: false,
    },
    jira: {
      connected: false,
    },
    sonarqube: {
      connected: false,
    },
  });

  // Auto-connect GitHub if user logged in with GitHub
  useEffect(() => {
    if (session && (session as any).provider === 'github') {
      testGitHubConnection(true);
    }
  }, [session]);

  // GitHub connection test
  const testGitHubConnection = async (silent = false) => {
    if (!session) {
      signIn("github", {
        scope: "read:user user:email repo"
      });
      return;
    }

    // Show loading state
    setConnections((prev) => ({
      ...prev,
      github: {
        connected: false,
        lastSync: "Connecting...",
        syncStatus: "pending",
      },
    }));

    try {
      const response = await fetch('/api/github/test');
      const data = await response.json();
      
      if (data.success) {
        if (!silent) {
          alert(
            `GitHub connected successfully!` 
          );
        }
        setConnections((prev) => ({
          ...prev,
          github: {
            connected: true,
            lastSync: "Just now",
            syncStatus: "success",
            repoCount: data.repoCount,
            username: data.username,
          },
        }));
      } else {
        if (!silent) {
          alert('Connection failed:\n\n' + (data.error || 'Unknown error'));
        }
        setConnections((prev) => ({
          ...prev,
          github: {
            connected: false,
          },
        }));
      }
    } catch (error: any) {
      if (!silent) {
        alert('Connection failed:\n\n' + error.message);
      }
      setConnections((prev) => ({
        ...prev,
        github: {
          connected: false,
        },
      }));
    }
  };

  // Jira connection test
  const testJiraConnection = async () => {
    setConnections((prev) => ({
      ...prev,
      jira: {
        connected: false,
        lastSync: "Connecting...",
        syncStatus: "pending",
      },
    }));

    try {
      const response = await fetch('/api/jira/test');
      const data = await response.json();
      
      if (data.success) {
        alert(
          `Jira connected successfully!\n\n` +
          `User: ${data.user.displayName}\n`
        );
        setConnections((prev) => ({
          ...prev,
          jira: {
            connected: true,
            lastSync: "Just now",
            syncStatus: "success",
            projectCount: data.projectCount,
            issueCount: data.issueCount,
            username: data.user.displayName,
          },
        }));
      } else {
        alert('Connection failed:\n\n' + (data.error || 'Unknown error'));
        setConnections((prev) => ({
          ...prev,
          jira: {
            connected: false,
          },
        }));
      }
    } catch (error: any) {
      alert('Connection failed:\n\n' + error.message);
      setConnections((prev) => ({
        ...prev,
        jira: {
          connected: false,
        },
      }));
    }
  };

  // SonarQube connection test
  const testSonarQubeConnection = async () => {
    setConnections((prev) => ({
      ...prev,
      sonarqube: {
        connected: false,
        lastSync: "Connecting...",
        syncStatus: "pending",
      },
    }));

    try {
      const response = await fetch('/api/sonarqube/test');
      const data = await response.json();
      
      if (data.success) {
        alert(
          `SonarQube connected successfully!\n\n` +
          `Project: ${data.projectName || data.projectKey}\n` +
          `Metrics found: ${data.metrics?.length || 0}`
        );
        setConnections((prev) => ({
          ...prev,
          sonarqube: {
            connected: true,
            lastSync: "Just now",
            syncStatus: "success",
            projectCount: 1,
          },
        }));
      } else {
        alert('Connection failed:\n\n' + (data.error || 'Unknown error'));
        setConnections((prev) => ({
          ...prev,
          sonarqube: {
            connected: false,
          },
        }));
      }
    } catch (error: any) {
      alert('Connection failed:\n\n' + error.message);
      setConnections((prev) => ({
        ...prev,
        sonarqube: {
          connected: false,
        },
      }));
    }
  };

  const handleConnect = (key: ConnectionKeys) => {
    // For GitHub
    if (key === "github") {
      if (connections[key].connected) {
        setConnections((prev) => ({
          ...prev,
          [key]: { connected: false },
        }));
      } else {
        testGitHubConnection();
      }
      return;
    }

    // For Jira
    if (key === "jira") {
      if (connections[key].connected) {
        setConnections((prev) => ({
          ...prev,
          [key]: { connected: false },
        }));
      } else {
        testJiraConnection();
      }
      return;
    }

    // For SonarQube
    if (key === "sonarqube") {
      if (connections[key].connected) {
        setConnections((prev) => ({
          ...prev,
          [key]: { connected: false },
        }));
      } else {
        testSonarQubeConnection();
      }
      return;
    }
  };

  const handleSync = (key: ConnectionKeys) => {
    setConnections((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        syncStatus: "pending",
        lastSync: "Syncing...",
      },
    }));

    setTimeout(() => {
      setConnections((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          syncStatus: "success",
          lastSync: "Just now",
        },
      }));
    }, 2000);
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
            const isSelected = label === "Integrations";
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
            <h2 className="text-2xl font-semibold text-yellow-500">Integrations</h2>
            <div className="text-sm text-gray-400">
              {Object.values(connections).filter((c) => c.connected).length} of 3 connected
            </div>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {integrationsList.map((integration) => {
              const key = integration.key;
              const status = connections[key];
              const isConnected = status.connected;

              return (
                <div
                  key={key}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-yellow-500/50 transition"
                >
                  {/* Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {key === "github" ? (
                          <span className="w-12 h-12 flex items-center justify-center rounded-full bg-white">
                            <Image
                              src={integration.logo}
                              alt={`${integration.name} Logo`}
                              width={28}
                              height={28}
                              className="object-contain"
                            />
                          </span>
                        ) : (
                          <Image
                            src={integration.logo}
                            alt={`${integration.name} Logo`}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        )}
                        <h3 className="text-xl font-semibold text-yellow-500">
                          {integration.name}
                        </h3>
                      </div>
                      {isConnected && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <p className="text-gray-300 text-sm mb-4">
                      {integration.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {integration.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-black text-yellow-500 text-xs rounded border border-zinc-700"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Connection Status */}
                    {isConnected && (
                      <div className="bg-black rounded-lg p-3 border border-zinc-800 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Last Sync</span>
                          <span className="text-xs text-gray-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {status.lastSync}
                          </span>
                        </div>
                        {status.syncStatus === "success" && (
                          <div className="flex items-center gap-2 text-xs text-green-500">
                            <CheckCircle className="w-3 h-3" />
                            Sync successful
                          </div>
                        )}
                        {status.syncStatus === "failed" && (
                          <div className="flex items-center gap-2 text-xs text-red-500">
                            <XCircle className="w-3 h-3" />
                            Sync failed
                          </div>
                        )}
                        {status.syncStatus === "pending" && (
                          <div className="flex items-center gap-2 text-xs text-yellow-500">
                            <Clock className="w-3 h-3 animate-spin" />
                            Syncing...
                          </div>
                        )}
                        {status.username && (
                          <p className="text-xs text-gray-400 mt-2">
                            Connected as: {status.username}
                          </p>
                        )}
                        {status.repoCount && (
                          <p className="text-xs text-gray-400 mt-2">
                            {status.repoCount} repositories connected
                          </p>
                        )}
                        {status.projectCount && (
                          <p className="text-xs text-gray-400 mt-2">
                            {status.projectCount} projects connected
                          </p>
                        )}
                        {status.issueCount !== undefined && (
                          <p className="text-xs text-gray-400 mt-2">
                            {status.issueCount} issues tracked
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConnect(key)}
                      className={`flex-1 px-4 py-2 rounded font-semibold transition
                        ${
                          isConnected
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-yellow-500 text-black hover:bg-yellow-600"
                        }
                      `}
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </button>
                    {isConnected && (
                      <button
                        onClick={() => handleSync(key)}
                        disabled={status.syncStatus === "pending"}
                        className="px-4 py-2 bg-zinc-800 text-yellow-500 rounded font-semibold hover:bg-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sync
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-500 mb-3">
              How Integrations Work
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <strong className="text-white">GitHub:</strong> Analyzes commit history, code changes, and identifies bug patterns across your repositories.
                {!session && <span className="text-yellow-500 ml-1">(Login with GitHub to connect)</span>}
              </p>
              <p>
                <strong className="text-white">Jira:</strong> Maps business priorities to technical work and detects hidden dependencies between tasks.
              </p>
              <p>
                <strong className="text-white">SonarQube:</strong> Provides code quality metrics used to calculate technical debt risk scores.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IntegrationsPage;