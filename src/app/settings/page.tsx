"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Moon,
  Sun,
  Trash2,
  Save,
  Shield,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/" },
  { label: "Integrations", icon: GitPullRequest, path: "/connections" },
  { label: "Technical Debt", icon: AlertTriangle, path: "/tech-debt" },
  { label: "Dependencies", icon: GitBranch, path: "/dependencies" },
  { label: "Commit Analyzer", icon: FileText, path: "/commits" },
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;

const SettingsPage = () => {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState("30");
  const [riskThreshold, setRiskThreshold] = useState(8.0);
  const [language, setLanguage] = useState("en-US");
  const [timezone, setTimezone] = useState("UTC");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      loadPreferences();
    } else if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [session, status, router]);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/preferences');
      const data = await response.json();
      
      if (data.success && data.preferences) {
        const prefs = data.preferences;
        setFullName(prefs.fullName || '');
        setEmail(session?.user?.email || '');
        setEmailNotifications(prefs.emailNotifications);
        setSlackNotifications(prefs.slackNotifications);
        setSlackWebhookUrl(prefs.slackWebhookUrl || '');
        setAutoSync(prefs.autoSync);
        setSyncInterval(prefs.syncInterval.toString());
        setRiskThreshold(prefs.riskScoreThreshold);
        setLanguage(prefs.language);
        setTimezone(prefs.timezone);
        setDarkMode(prefs.darkMode);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          emailNotifications,
          slackNotifications,
          slackWebhookUrl,
          autoSync,
          syncInterval: parseInt(syncInterval),
          riskScoreThreshold: riskThreshold,
          language,
          timezone,
          darkMode,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings: " + data.error);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🧪 Test Notification from VelocityIQ',
          message: 'This is a test notification. Your notification settings are working correctly!',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        let msg = 'Test notification sent!\n\n';
        if (data.sent.email) msg += '📧 Email: Sent\n';
        if (data.sent.slack) msg += '💬 Slack: Sent\n';
        if (!data.sent.email && !data.sent.slack) {
          msg = 'No notifications sent. Enable email or Slack notifications first.';
        }
        alert(msg);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion initiated. You will receive a confirmation email.");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="text-yellow-500">Loading settings...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

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
            <h3 className="text-lg font-semibold text-yellow-500 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-yellow-500 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className="mb-8 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-500 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h3>
              <button
                onClick={handleTestNotification}
                className="px-3 py-1 text-sm bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition"
              >
                Send Test
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-zinc-700">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-xs text-gray-400">Receive alerts about critical tech debt and dependencies</div>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    emailNotifications
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-zinc-700 text-gray-400 hover:bg-zinc-600"
                  }`}
                >
                  {emailNotifications ? "On" : "Off"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-zinc-700">
                <div>
                  <div className="font-medium">Slack Notifications</div>
                  <div className="text-xs text-gray-400">Send alerts to your Slack workspace</div>
                </div>
                <button
                  onClick={() => setSlackNotifications(!slackNotifications)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    slackNotifications
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-zinc-700 text-gray-400 hover:bg-zinc-600"
                  }`}
                >
                  {slackNotifications ? "On" : "Off"}
                </button>
              </div>

              {slackNotifications && (
                <div className="p-3 bg-black rounded-lg border border-zinc-700">
                  <label className="text-xs text-gray-400 mb-1 block">Slack Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhookUrl}
                    onChange={(e) => setSlackWebhookUrl(e.target.value)}
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-yellow-500 text-white text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Get your webhook URL from Slack's Incoming Webhooks app
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Analysis Settings */}
          <section className="mb-8 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-yellow-500 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Analysis Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-zinc-700">
                <div>
                  <div className="font-medium">Auto-Sync</div>
                  <div className="text-xs text-gray-400">Automatically sync data from integrations</div>
                </div>
                <button
                  onClick={() => setAutoSync(!autoSync)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    autoSync
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-zinc-700 text-gray-400 hover:bg-zinc-600"
                  }`}
                >
                  {autoSync ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="p-3 bg-black rounded-lg border border-zinc-700">
                <label className="block mb-2 font-medium">Sync Interval</label>
                <select
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(e.target.value)}
                  className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-yellow-500 text-white"
                >
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                  <option value="180">Every 3 hours</option>
                  <option value="360">Every 6 hours</option>
                </select>
              </div>

              <div className="p-3 bg-black rounded-lg border border-zinc-700">
                <label className="block mb-2 font-medium">Risk Score Threshold</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="10"
                    step="0.5"
                    value={riskThreshold}
                    onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-yellow-500 font-bold w-12">{riskThreshold.toFixed(1)}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Alert when risk score exceeds this threshold
                </div>
              </div>
            </div>
          </section>

          {/* System Settings */}
          <section className="mb-8 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-yellow-500 mb-4">System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Language</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-yellow-500 text-white"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-UK">English (UK)</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-yellow-500 text-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="GMT">GMT</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                  <option value="IST">IST (India)</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between p-3 bg-black rounded-lg border border-zinc-700">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-xs text-gray-400">Toggle dark/light theme</div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 px-4 py-2 border border-yellow-500 rounded-lg hover:bg-zinc-800 transition text-yellow-500 font-semibold"
              >
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                {darkMode ? "Dark" : "Light"}
              </button>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>

          {/* Danger Zone */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-red-800">
            <h3 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h3>
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg mb-4">
              <p className="text-sm text-gray-300 mb-2">
                Once you delete your account, there is no going back. This will:
              </p>
              <ul className="text-xs text-gray-400 space-y-1 ml-4">
                <li>• Permanently delete all your data</li>
                <li>• Remove all integration connections</li>
                <li>• Delete all analysis history</li>
              </ul>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
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