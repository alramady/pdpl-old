/**
 * DashboardLayout — Rasid Platform
 * RTL-first sidebar with collapsible navigation groups
 * Royal blue dark theme matching rasid.vip
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Send,
  Globe,
  FileText,
  ScanSearch,
  ShieldAlert,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Menu,
  X,
  Search,
  Shield,
  LogIn,
  LogOut,
  Users,
  Loader2,
  Radio,
  ScrollText,
  Bell,
  Archive,
  Map,
  CalendarClock,
  KeyRound,
  Crosshair,
  Link2,
  UserX,
  Radar,
  Brain,
  Network,
  Sun,
  Moon,
  Bot,
  CheckCircle2,
  Scan,
  FileCheck,
  FileBarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNdmoAuth } from "@/hooks/useNdmoAuth";
import { getLoginUrl } from "@/const";
import NotificationBell from "./NotificationBell";
import { useTheme } from "@/contexts/ThemeContext";

const RASID_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/ziWPuMClYqvYmkJG.png";

interface NavItem {
  label: string;
  labelEn: string;
  icon: React.ElementType;
  path: string;
  requiresAuth?: boolean;
  minRole?: string;
}

interface NavGroup {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "command",
    label: "قيادي",
    labelEn: "Command",
    icon: LayoutDashboard,
    items: [
      { label: "لوحة القيادة", labelEn: "Dashboard", icon: LayoutDashboard, path: "/" },
      { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/reports" },
      { label: "خريطة التهديدات", labelEn: "Threat Map", icon: Map, path: "/threat-map" },
      { label: "راصد الذكي", labelEn: "Smart Rasid", icon: Bot, path: "/smart-rasid" },
    ],
  },
  {
    id: "operational",
    label: "تنفيذي",
    labelEn: "Operational",
    icon: ShieldAlert,
    items: [
      { label: "التسريبات", labelEn: "Leaks", icon: ShieldAlert, path: "/leaks" },
      { label: "رصد تليجرام", labelEn: "Telegram", icon: Send, path: "/telegram" },
      { label: "الدارك ويب", labelEn: "Dark Web", icon: Globe, path: "/darkweb" },
      { label: "مواقع اللصق", labelEn: "Paste Sites", icon: FileText, path: "/paste-sites" },
      { label: "ملفات البائعين", labelEn: "Seller Profiles", icon: UserX, path: "/seller-profiles" },
      { label: "الرصد المباشر", labelEn: "Live Scan", icon: Scan, path: "/live-scan" },
    ],
  },
  {
    id: "advanced",
    label: "متقدم",
    labelEn: "Advanced",
    icon: Brain,
    items: [
      { label: "مصنّف PII", labelEn: "PII Classifier", icon: ScanSearch, path: "/pii-classifier" },
      { label: "سلسلة الأدلة", labelEn: "Evidence Chain", icon: Link2, path: "/evidence-chain" },
      { label: "قواعد صيد التهديدات", labelEn: "Threat Rules", icon: Crosshair, path: "/threat-rules" },
      { label: "أدوات OSINT", labelEn: "OSINT Tools", icon: Radar, path: "/osint-tools" },
      { label: "رسم المعرفة", labelEn: "Knowledge Graph", icon: Network, path: "/knowledge-graph" },
      { label: "مقاييس الدقة", labelEn: "Accuracy Metrics", icon: Brain, path: "/feedback-accuracy" },
    ],
  },
  {
    id: "management",
    label: "إداري",
    labelEn: "Management",
    icon: Settings,
    items: [
      { label: "مهام الرصد", labelEn: "Monitoring Jobs", icon: Radio, path: "/monitoring-jobs" },
      { label: "قنوات التنبيه", labelEn: "Alert Channels", icon: Bell, path: "/alert-channels" },
      { label: "التقارير المجدولة", labelEn: "Scheduled Reports", icon: CalendarClock, path: "/scheduled-reports" },
      { label: "التحقق من التوثيق", labelEn: "Verify Document", icon: FileCheck, path: "/verify" },
    ],
  },
  {
    id: "admin",
    label: "النظام",
    labelEn: "System",
    icon: Shield,
    items: [
      { label: "مفاتيح API", labelEn: "API Keys", icon: KeyRound, path: "/api-keys", requiresAuth: true, minRole: "admin" },
      { label: "الاحتفاظ بالبيانات", labelEn: "Data Retention", icon: Archive, path: "/data-retention", requiresAuth: true, minRole: "admin" },
      { label: "سجل المراجعة", labelEn: "Audit Log", icon: ScrollText, path: "/audit-log", requiresAuth: true, minRole: "admin" },
      { label: "إدارة المستخدمين", labelEn: "Users", icon: Users, path: "/user-management", requiresAuth: true, minRole: "admin" },
      { label: "سجل التوثيقات", labelEn: "Documents", icon: FileBarChart, path: "/documents-registry", requiresAuth: true, minRole: "admin" },
    ],
  },
];

// Flatten for lookup
const allNavItems = navGroups.flatMap((g) => g.items);

const roleLabels: Record<string, string> = {
  executive: "تنفيذي",
  manager: "مدير",
  analyst: "محلل",
  viewer: "مشاهد",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, loading, logout, isAdmin, ndmoRole } = useNdmoAuth();
  const { theme, toggleTheme, switchable } = useTheme();

  // Track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.id] = true; // all expanded by default
    });
    return initial;
  });

  const currentPage = allNavItems.find((item) => item.path === location);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Filter nav items based on role
  const isItemVisible = (item: NavItem) => {
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.minRole === "admin" && !isAdmin) return false;
    return true;
  };

  // Check if a group has any visible items
  const isGroupVisible = (group: NavGroup) => {
    return group.items.some(isItemVisible);
  };

  // Check if current page is in a group
  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => item.path === location);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 h-full
          bg-sidebar border-l border-sidebar-border
          transition-all duration-300 ease-in-out
          flex flex-col
          ${collapsed ? "w-[72px]" : "w-[270px]"}
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          right-0 lg:right-auto
        `}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={RASID_LOGO}
              alt="راصد"
              className="w-9 h-9 object-contain"
              style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
            />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <h1 className="text-sm font-bold text-foreground whitespace-nowrap">منصة راصد</h1>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">رصد تسريبات البيانات الشخصية</p>
            </motion.div>
          )}
        </div>

        {/* Navigation with groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navGroups.filter(isGroupVisible).map((group) => {
            const isExpanded = expandedGroups[group.id];
            const isActive = isGroupActive(group);
            const GroupIcon = group.icon;
            const visibleItems = group.items.filter(isItemVisible);

            return (
              <div key={group.id} className="mb-1">
                {/* Group header */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg
                      text-xs font-semibold uppercase tracking-wider
                      transition-colors duration-200
                      ${isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <GroupIcon className="w-3.5 h-3.5" />
                      <span>{group.label}</span>
                      <span className="text-[9px] opacity-60 font-normal normal-case">{group.labelEn}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`}
                    />
                  </button>
                ) : (
                  <div className="h-px bg-sidebar-border mx-2 my-2" />
                )}

                {/* Group items */}
                <AnimatePresence initial={false}>
                  {(isExpanded || collapsed) && (
                    <motion.div
                      initial={collapsed ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={collapsed ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={`space-y-0.5 ${collapsed ? "" : "mt-1 mr-2"}`}>
                        {visibleItems.map((item) => {
                          const isItemActive = location === item.path;
                          const Icon = item.icon;
                          return (
                            <Link key={item.path} href={item.path}>
                              <motion.div
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                  flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                                  transition-colors duration-200 group relative
                                  ${isItemActive
                                    ? "bg-primary/15 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                  }
                                `}
                              >
                                {isItemActive && (
                                  <motion.div
                                    layoutId="activeNav"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-l-full"
                                  />
                                )}
                                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isItemActive ? "text-primary" : ""}`} />
                                {!collapsed && (
                                  <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                                )}
                                {collapsed && (
                                  <div className="absolute right-14 bg-popover text-popover-foreground text-xs py-1 px-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                  </div>
                                )}
                              </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User profile / login at bottom */}
        <div className="p-3 border-t border-sidebar-border">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : isAuthenticated && user ? (
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user.name || "مستخدم"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {roleLabels[ndmoRole] || ndmoRole}
                    {isAdmin && " (مشرف)"}
                  </p>
                </div>
              )}
              {!collapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    logout();
                    toast("تم تسجيل الخروج");
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <a href="/login">
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 text-xs w-full ${collapsed ? "px-0 justify-center" : ""}`}
              >
                <LogIn className="w-3.5 h-3.5" />
                {!collapsed && "تسجيل الدخول"}
              </Button>
            </a>
          )}
        </div>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-sidebar-border hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile close */}
        <button
          className="absolute top-4 left-4 lg:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {currentPage?.label || "لوحة القيادة"}
              </h2>
              <p className="text-xs text-muted-foreground">{currentPage?.labelEn || "Dashboard"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {switchable && toggleTheme && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={toggleTheme}
                title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}

            {/* Search — link to Smart Rasid */}
            <Link href="/smart-rasid">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                title="البحث الذكي"
              >
                <Search className="w-4 h-4" />
              </Button>
            </Link>

            {/* Real-time Notifications */}
            <NotificationBell userId={user?.id} />

            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">نشط</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
