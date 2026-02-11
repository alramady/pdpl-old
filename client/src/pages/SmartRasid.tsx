import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";
import LeakDetailDrilldown from "@/components/LeakDetailDrilldown";
import {
  Brain,
  Send,
  Search,
  Shield,
  BarChart3,
  FileText,
  AlertTriangle,
  Database,
  RefreshCw,
  Sparkles,
  Clock,
  Zap,
  Globe,
  Eye,
  TrendingUp,
  Loader2,
  MessageSquare,
  Plus,
  History,
  Bot,
  Network,
  Users,
  MapPin,
  Crosshair,
  Link2,
  Mic,
  Paperclip,
  ChevronDown,
  ChevronRight,
  Wand2,
  Activity,
  BookOpen,
  Layers,
  Terminal,
  Cpu,
  Copy,
  Check,
  Star,
  Crown,
  Workflow,
  CircleDot,
  CheckCircle2,
  XCircle,
  GitBranch,
  ScanSearch,
  UserCheck,
  FileSearch,
  BarChart2,
  Fingerprint,
  Radio,
  Radar,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ═══ CONSTANTS ═══
const RASID_CHARACTER_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/EcTxzqTDBTbCBkgA.png";
const RASID_FACE_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/CKohhQCRRyLHdRyE.png";

interface ThinkingStep {
  id: string;
  agent: string;
  action: string;
  description: string;
  status: "running" | "completed" | "error";
  timestamp: string;
  result?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
  thinkingSteps?: ThinkingStep[];
  rating?: number;
  userQuery?: string;
}

const quickCommands = [
  { label: "ملخص لوحة المعلومات", icon: BarChart3, color: "text-cyan-400", bgColor: "bg-cyan-500/10 border-cyan-500/20", query: "أعطني ملخص شامل للوحة المعلومات مع تحليل" },
  { label: "تسريبات حرجة", icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20", query: "ما هي التسريبات الحرجة الحالية؟ أعطني تفاصيل كل واحد" },
  { label: "تحليل ارتباطات", icon: GitBranch, color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", query: "أجرِ تحليل ارتباطات شامل: ربط البائعين بالقطاعات، أنماط زمنية، واكتشاف الشذوذ" },
  { label: "حالة الحماية", icon: Shield, color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20", query: "ما حالة حماية البيانات الشخصية؟ وما مستوى التهديدات الحالي والتوصيات؟" },
  { label: "نشاط المستخدمين", icon: UserCheck, color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20", query: "حلل نشاط المستخدمين اليوم: من فعل ماذا؟ كم عملية نُفذت؟" },
  { label: "خريطة التهديدات", icon: MapPin, color: "text-indigo-400", bgColor: "bg-indigo-500/10 border-indigo-500/20", query: "اعرض خريطة التهديدات الجغرافية والتوزيع حسب المناطق" },
  { label: "التقارير والمستندات", icon: FileSearch, color: "text-teal-400", bgColor: "bg-teal-500/10 border-teal-500/20", query: "اعرض لي كل التقارير والمستندات المتاحة مع روابطها" },
  { label: "قواعد الكشف", icon: Crosshair, color: "text-rose-400", bgColor: "bg-rose-500/10 border-rose-500/20", query: "اعرض قواعد صيد التهديدات النشطة وأداءها" },
];

const capabilities = [
  { icon: BarChart3, label: "تحليل لوحة القيادة", desc: "إحصائيات وتقارير شاملة" },
  { icon: Search, label: "البحث في التسريبات", desc: "بحث متقدم بكل الفلاتر" },
  { icon: Shield, label: "حماية البيانات", desc: "نظام PDPL والتوصيات" },
  { icon: Globe, label: "الدارك ويب واللصق", desc: "رصد المصادر المظلمة" },
  { icon: Users, label: "البائعون والتهديدات", desc: "ملفات تعريف المهددين" },
  { icon: GitBranch, label: "تحليل الارتباطات", desc: "ربط البيانات واكتشاف الأنماط" },
  { icon: UserCheck, label: "مراقبة الأنشطة", desc: "تتبع نشاط الموظفين" },
  { icon: BookOpen, label: "قاعدة المعرفة", desc: "مقالات وسياسات وإرشادات" },
  { icon: FileSearch, label: "إدارة الملفات", desc: "جلب التقارير والمستندات" },
  { icon: Network, label: "رسم المعرفة", desc: "شبكة العلاقات والروابط" },
  { icon: Activity, label: "المراقبة والتنبيهات", desc: "حالة مهام الرصد" },
  { icon: BarChart2, label: "تحليل الاتجاهات", desc: "أنماط زمنية وتوزيعات" },
  { icon: Crosshair, label: "صيد التهديدات", desc: "قواعد YARA-like" },
  { icon: Link2, label: "سلسلة الأدلة", desc: "توثيق وحفظ الأدلة" },
  { icon: HeartHandshake, label: "الشخصية التفاعلية", desc: "ترحيب ذكي واحترام القادة" },
];

// Tool name to Arabic label mapping
const toolLabels: Record<string, string> = {
  query_leaks: "استعلام التسريبات",
  get_leak_details: "تفاصيل التسريب",
  get_dashboard_stats: "إحصائيات لوحة القيادة",
  get_channels_info: "معلومات القنوات",
  get_monitoring_status: "حالة المراقبة",
  get_alert_info: "معلومات التنبيهات",
  get_sellers_info: "البائعون المرصودون",
  get_evidence_info: "الأدلة الرقمية",
  get_threat_rules_info: "قواعد التهديدات",
  get_darkweb_pastes: "الدارك ويب واللصق",
  get_feedback_accuracy: "مقاييس الدقة",
  get_knowledge_graph: "رسم المعرفة",
  get_osint_info: "استخبارات OSINT",
  get_reports_and_documents: "التقارير والمستندات",
  get_threat_map: "خريطة التهديدات",
  get_audit_log: "سجل المراجعة",
  get_system_health: "صحة النظام",
  analyze_trends: "تحليل الاتجاهات",
  get_platform_guide: "الدليل الإرشادي",
  analyze_user_activity: "تحليل نشاط المستخدمين",
  search_knowledge_base: "البحث في قاعدة المعرفة",
  get_correlations: "تحليل الارتباطات",
  get_platform_users_info: "معلومات المستخدمين",
  get_personality_greeting: "ترحيب شخصي",
  check_leader_mention: "فحص إشارة لقائد",
  manage_personality_scenarios: "إدارة سيناريوهات الشخصية",
};

// Agent icons mapping
const agentIcons: Record<string, typeof Brain> = {
  "راصد الذكي": Radar,
  "الوكيل التنفيذي": Zap,
  "وكيل التحليلات": BarChart2,
  "وكيل سجل المراجعة": Eye,
  "وكيل المعرفة": BookOpen,
  "وكيل الملفات": FileSearch,
  "وكيل الشخصية": HeartHandshake,
};

const agentColors: Record<string, string> = {
  "راصد الذكي": "text-cyan-400",
  "الوكيل التنفيذي": "text-emerald-400",
  "وكيل التحليلات": "text-violet-400",
  "وكيل سجل المراجعة": "text-orange-400",
  "وكيل المعرفة": "text-blue-400",
  "وكيل الملفات": "text-teal-400",
  "وكيل الشخصية": "text-pink-400",
};

// ═══ MATRIX RAIN BACKGROUND ═══
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01راصدحمايةبياناتأمنسيبرانيرصدتسريبكشف";
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(10, 15, 28, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 200, 180, 0.08)";
      ctx.font = `${fontSize}px 'Tajawal', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
    />
  );
}

// ═══ SCANNING LINE EFFECT ═══
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none z-10"
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ═══ PULSE RING EFFECT ═══
function PulseRings({ size = 80 }: { size?: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-500/20"
          style={{ width: size + i * 30, height: size + i * 30 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ═══ THINKING STEPS COMPONENT — Console Style ═══
function ThinkingStepsDisplay({ steps, isExpanded, onToggle }: { steps: ThinkingStep[]; isExpanded: boolean; onToggle: () => void }) {
  if (!steps || steps.length === 0) return null;

  const completedCount = steps.filter(s => s.status === "completed").length;
  const errorCount = steps.filter(s => s.status === "error").length;

  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg bg-[#0a1628]/80 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-all w-full font-mono"
      >
        <Terminal className="w-3.5 h-3.5 animate-pulse" />
        <span className="font-medium tracking-wide">THINKING_PROCESS</span>
        <span className="text-[10px] text-cyan-400/60">
          [{completedCount}/{steps.length}]{errorCount > 0 ? ` ERR:${errorCount}` : ""}
        </span>
        <div className="flex-1" />
        <span className="text-[9px] text-cyan-500/40 font-mono">
          {isExpanded ? "▼ COLLAPSE" : "▶ EXPAND"}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-1 bg-[#060d1b]/90 border border-cyan-500/10 rounded-lg p-3 font-mono text-[11px] space-y-1">
              {steps.map((step, idx) => {
                const AgentIcon = agentIcons[step.agent] || Brain;
                const agentColor = agentColors[step.agent] || "text-cyan-400";
                const statusSymbol = step.status === "completed" ? "✓" : step.status === "error" ? "✗" : "◉";
                const statusColor = step.status === "completed" ? "text-emerald-400" : step.status === "error" ? "text-red-400" : "text-amber-400";

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-start gap-2 py-1 group"
                  >
                    <span className={`${statusColor} w-4 text-center flex-shrink-0`}>{statusSymbol}</span>
                    <AgentIcon className={`w-3 h-3 ${agentColor} flex-shrink-0 mt-0.5`} />
                    <span className={`${agentColor} min-w-[80px]`}>{step.agent}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-300">{step.description}</span>
                    {step.result && (
                      <span className="text-slate-600 truncate group-hover:whitespace-normal max-w-[200px]">
                        // {step.result}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ MAIN COMPONENT ═══
export default function SmartRasid() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [drillLeakId, setDrillLeakId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ratingHover, setRatingHover] = useState<{ msgId: string; star: number } | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [loadingSteps, setLoadingSteps] = useState<ThinkingStep[]>([]);

  const rateMutation = trpc.aiRatings.rate.useMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const chatMutation = trpc.smartRasid.chat.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingSteps]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [inputValue]);

  // Debounced suggestions
  const fetchSuggestions = useCallback(async (partial: string) => {
    if (partial.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`/api/trpc/smartRasid.suggestions?input=${encodeURIComponent(JSON.stringify({ partial }))}`);
      const data = await res.json();
      const result = data?.result?.data;
      if (result?.suggestions?.length > 0) {
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (suggestionsTimeoutRef.current) clearTimeout(suggestionsTimeoutRef.current);
    suggestionsTimeoutRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const selectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const sendMessage = async (text?: string) => {
    const msg = text || inputValue.trim();
    if (!msg || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(true);

    setLoadingSteps([
      {
        id: "loading-1",
        agent: "راصد الذكي",
        action: "analyze_intent",
        description: "تحليل نية المستخدم وتحديد الوكيل المختص",
        status: "running",
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      const history = messages.slice(-16).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const result = await chatMutation.mutateAsync({
        message: msg,
        history: history as Array<{ role: "user" | "assistant"; content: string }>,
      });

      setLoadingSteps([]);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: (typeof result.response === 'string' ? result.response : '') as string,
        timestamp: new Date(),
        toolsUsed: (result as any).toolsUsed,
        thinkingSteps: (result as any).thinkingSteps,
        userQuery: msg,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setLoadingSteps([]);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInputValue("");
    setExpandedThinking({});
    inputRef.current?.focus();
  };

  const handleRating = async (msg: ChatMessage, star: number) => {
    try {
      await rateMutation.mutateAsync({
        messageId: msg.id,
        rating: star,
        userMessage: msg.userQuery || "",
        aiResponse: msg.content,
        toolsUsed: msg.toolsUsed || [],
      });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, rating: star } : m));
      toast.success(`تم التقييم بنجاح (${star}/5)`);
    } catch {
      toast.error("فشل في حفظ التقييم");
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("تم النسخ");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  };

  const extractLeakIds = (content: string): string[] => {
    const matches = content.match(/LK-\d{4}-\d{4}/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const toggleThinking = (msgId: string) => {
    setExpandedThinking(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden" dir="rtl">
      {/* ═══ BACKGROUND EFFECTS ═══ */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060d1b] via-[#0a1628] to-[#0d1a30] z-0" />
      <MatrixRain />
      <ScanLine />

      {/* ═══ HEADER — Console Style with Rasid Character ═══ */}
      <div className="flex-shrink-0 border-b border-cyan-500/15 bg-[#0a1628]/80 backdrop-blur-2xl z-20 relative">
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4">
            {/* Rasid Character Avatar with glow */}
            <div className="relative group">
              <motion.div
                animate={{ boxShadow: ["0 0 15px rgba(0,200,180,0.2)", "0 0 30px rgba(0,200,180,0.4)", "0 0 15px rgba(0,200,180,0.2)"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-cyan-500/30 relative"
              >
                <img
                  src={RASID_FACE_URL}
                  alt="راصد الذكي"
                  className="w-full h-full object-cover object-top"
                />
              </motion.div>
              {/* Online indicator */}
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[2.5px] border-[#0a1628] shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              />
            </div>

            <div>
              <h1 className="text-[15px] font-bold text-white flex items-center gap-2 font-[Tajawal]">
                <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                  راصد الذكي
                </span>
                <span className="text-[9px] font-mono font-normal bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 tracking-wider">
                  v6.0
                </span>
              </h1>
              <p className="text-[11px] text-cyan-400/60 font-mono tracking-wide">
                SMART_RASID // {Object.keys(toolLabels).length} TOOLS · 7 AGENTS · ACTIVE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicators */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#060d1b]/60 border border-cyan-500/10 font-mono text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                ONLINE
              </span>
              <span className="text-cyan-500/30">|</span>
              <span className="text-cyan-400/50">{Object.keys(toolLabels).length} أداة</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 text-xs transition-all font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline tracking-wide">NEW_SESSION</span>
            </motion.button>
          </div>
        </div>

        {/* Quick Commands — Console-style chips */}
        <div className="flex items-center gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] text-cyan-500/40 whitespace-nowrap flex items-center gap-1 font-mono">
            <Terminal className="w-3 h-3" />
            CMD &gt;
          </span>
          {quickCommands.map((cmd, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => sendMessage(cmd.query)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${cmd.bgColor} border text-xs ${cmd.color} whitespace-nowrap transition-all font-mono hover:shadow-lg`}
            >
              <cmd.icon className="w-3 h-3" />
              {cmd.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ═══ CHAT AREA ═══ */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 z-10 relative">
        {messages.length === 0 ? (
          /* ═══ WELCOME SCREEN — Console Style ═══ */
          <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto">
            {/* Rasid Character with effects */}
            <div className="relative mb-8">
              <PulseRings size={130} />

              {/* Rotating tech ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] rounded-full border border-dashed border-cyan-500/15"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,200,180,0.6)]" />
              </motion.div>

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-35px] rounded-full border border-dashed border-teal-500/8"
              >
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-teal-400/60" />
              </motion.div>

              {/* Character image */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(0,200,180,0.2)] bg-[#0a1628]">
                  <img
                    src={RASID_FACE_URL}
                    alt="راصد الذكي"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Sparkle badge */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center border-[3px] border-[#0a1628] shadow-[0_0_15px_rgba(0,200,180,0.4)]"
                >
                  <Radar className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>
            </div>

            {/* Title with typewriter effect */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-2"
            >
              <h2 className="text-3xl font-bold font-[Tajawal] mb-1">
                <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                  راصد الذكي
                </span>
              </h2>
              <div className="flex items-center justify-center gap-2 text-cyan-400/60 font-mono text-xs">
                <motion.span
                  animate={{ opacity: [0, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  className="text-cyan-400"
                >
                  _
                </motion.span>
                <span>SMART RASID AI ASSISTANT</span>
                <motion.span
                  animate={{ opacity: [0, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  className="text-cyan-400"
                >
                  _
                </motion.span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-slate-400 mb-4 text-center max-w-lg font-[Tajawal]"
            >
              كبير المحللين السيبرانيين — يحلل، يستنتج، يربط، وينفذ
            </motion.p>

            {/* Agent Architecture — Console Display */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-2 mb-8 px-4 py-2.5 rounded-xl bg-[#060d1b]/80 border border-cyan-500/15 font-mono text-[10px]"
            >
              <Radar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 font-medium">RASID</span>
              <span className="text-cyan-500/30">→</span>
              {[
                { icon: Zap, label: "تنفيذي", color: "text-emerald-400" },
                { icon: BarChart2, label: "تحليلات", color: "text-violet-400" },
                { icon: Eye, label: "مراجعة", color: "text-orange-400" },
                { icon: BookOpen, label: "معرفة", color: "text-blue-400" },
                { icon: FileSearch, label: "ملفات", color: "text-teal-400" },
                { icon: HeartHandshake, label: "شخصية", color: "text-pink-400" },
              ].map((agent, i) => (
                <div key={i} className={`flex items-center gap-1 ${agent.color}`}>
                  <agent.icon className="w-3 h-3" />
                  <span>{agent.label}</span>
                  {i < 5 && <span className="text-cyan-500/20 mr-1">·</span>}
                </div>
              ))}
            </motion.div>

            {/* Capabilities Grid — Console Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full rounded-xl border border-cyan-500/15 bg-[#060d1b]/60 backdrop-blur-xl p-5 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <p className="text-sm font-medium text-white font-[Tajawal]">قدرات راصد الذكي</p>
                <span className="text-[10px] text-cyan-400/50 font-mono bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                  {Object.keys(toolLabels).length} TOOLS · 7 AGENTS
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {capabilities.map((cap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.03 }}
                    whileHover={{ scale: 1.03, borderColor: "rgba(0,200,180,0.3)" }}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#0a1628]/80 border border-cyan-500/10 hover:bg-cyan-500/5 transition-all cursor-default group"
                  >
                    <cap.icon className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-300 transition-colors flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-slate-200 block truncate font-[Tajawal]">{cap.label}</span>
                      <span className="text-[9px] text-slate-500 block truncate">{cap.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Action Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full"
            >
              <p className="text-xs text-slate-500 mb-3 text-center font-mono">// ابدأ بأحد هذه الأوامر أو اكتب أي سؤال</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickCommands.slice(0, 4).map((cmd, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(cmd.query)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0a1628]/60 hover:bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/25 transition-all group`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${cmd.bgColor} border flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <cmd.icon className={`w-5 h-5 ${cmd.color}`} />
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-[Tajawal]">{cmd.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* ═══ MESSAGE LIST ═══ */
          <>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {msg.role === "assistant" ? (
                    <motion.div
                      animate={{ boxShadow: ["0 0 8px rgba(0,200,180,0.15)", "0 0 16px rgba(0,200,180,0.3)", "0 0 8px rgba(0,200,180,0.15)"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/30"
                    >
                      <img src={RASID_FACE_URL} alt="راصد" className="w-full h-full object-cover object-top" />
                    </motion.div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/30">
                      <span className="text-xs text-white font-bold">
                        {user?.name?.charAt(0) || (user as any)?.displayName?.charAt(0) || "م"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] lg:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {/* Thinking Steps */}
                  {msg.role === "assistant" && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                    <ThinkingStepsDisplay
                      steps={msg.thinkingSteps}
                      isExpanded={expandedThinking[msg.id] ?? false}
                      onToggle={() => toggleThinking(msg.id)}
                    />
                  )}

                  {/* Tool usage indicator */}
                  {msg.role === "assistant" && msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {msg.toolsUsed.map((tool, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-mono"
                        >
                          <Terminal className="w-2.5 h-2.5" />
                          {toolLabels[tool] || tool}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    className={`rounded-xl px-4 py-3 relative group ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 text-slate-100"
                        : "bg-[#0a1628]/80 border border-cyan-500/10 text-slate-200"
                    }`}
                  >
                    {/* Copy button */}
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10"
                      title="نسخ"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                    </button>

                    {msg.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none [&_table]:text-xs [&_th]:bg-cyan-500/5 [&_td]:border-cyan-500/10 [&_th]:border-cyan-500/10 [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-1.5 [&_a]:text-cyan-400 [&_strong]:text-cyan-200 [&_code]:text-cyan-300 [&_code]:bg-cyan-500/10">
                        <Streamdown>{msg.content}</Streamdown>
                        {/* Clickable Leak IDs */}
                        {extractLeakIds(msg.content).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-cyan-500/10 flex flex-wrap gap-2">
                            <span className="text-[10px] text-slate-500">عرض تفاصيل:</span>
                            {extractLeakIds(msg.content).map(id => (
                              <button
                                key={id}
                                onClick={() => setDrillLeakId(id)}
                                className="text-[10px] px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/15 transition-colors font-mono"
                              >
                                {id}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed font-[Tajawal]">{msg.content}</p>
                    )}
                  </div>

                  {/* Timestamp + Rating */}
                  <div className={`flex items-center gap-1.5 mt-1.5 ${msg.role === "user" ? "justify-end" : "justify-between"}`}>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-2.5 h-2.5 text-slate-600" />
                      <span className="text-[10px] text-slate-600 font-mono">{formatTime(msg.timestamp)}</span>
                      {msg.role === "assistant" && (
                        <span className="text-[10px] text-emerald-500/70 flex items-center gap-0.5 font-mono">
                          <CheckCircle2 className="w-2.5 h-2.5" /> DONE
                        </span>
                      )}
                    </div>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-0.5" onMouseLeave={() => setRatingHover(null)}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = msg.rating ? star <= msg.rating : (ratingHover?.msgId === msg.id && star <= ratingHover.star);
                          return (
                            <button
                              key={star}
                              onClick={() => !msg.rating && handleRating(msg, star)}
                              onMouseEnter={() => !msg.rating && setRatingHover({ msgId: msg.id, star })}
                              className={`transition-all duration-150 ${msg.rating ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
                              title={msg.rating ? `تم التقييم: ${msg.rating}/5` : `تقييم ${star}/5`}
                              disabled={!!msg.rating}
                            >
                              <Star
                                className={`w-3.5 h-3.5 transition-colors ${
                                  isActive
                                    ? 'text-cyan-400 fill-cyan-400'
                                    : 'text-slate-700 hover:text-cyan-400/50'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Follow-up suggestions */}
                  {msg.role === "assistant" && msg.id === messages[messages.length - 1]?.id && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {getFollowUpSuggestions(msg.content).map((suggestion, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => sendMessage(suggestion)}
                          className="text-[11px] px-3 py-1.5 rounded-lg bg-[#0a1628]/60 hover:bg-cyan-500/10 border border-cyan-500/10 hover:border-cyan-500/25 text-slate-400 hover:text-cyan-300 transition-all font-mono"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Loading Indicator — Console Style */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3"
                >
                  <motion.div
                    animate={{ boxShadow: ["0 0 8px rgba(0,200,180,0.2)", "0 0 20px rgba(0,200,180,0.4)", "0 0 8px rgba(0,200,180,0.2)"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40"
                  >
                    <img src={RASID_FACE_URL} alt="راصد" className="w-full h-full object-cover object-top animate-pulse" />
                  </motion.div>
                  <div className="bg-[#0a1628]/80 border border-cyan-500/15 rounded-xl px-4 py-3 max-w-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1.5">
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-cyan-400" />
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-teal-400" />
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-sm text-cyan-400/80 font-mono">PROCESSING...</span>
                    </div>
                    {loadingSteps.length > 0 && (
                      <div className="space-y-1 mt-2 border-t border-cyan-500/10 pt-2 font-mono text-[10px]">
                        {loadingSteps.map((step) => (
                          <div key={step.id} className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Radar className="w-3 h-3 text-cyan-400" />
                            </motion.div>
                            <span className="text-cyan-400">{step.agent}</span>
                            <span className="text-cyan-500/30">→</span>
                            <span className="text-slate-500">{step.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ═══ INPUT AREA — Console Style ═══ */}
      <div className="flex-shrink-0 border-t border-cyan-500/15 bg-[#0a1628]/90 backdrop-blur-2xl p-4 z-20 relative">
        {/* Bottom accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mb-2 bg-[#060d1b]/95 border border-cyan-500/15 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-right px-4 py-2.5 text-sm text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300 transition-colors flex items-center gap-2 border-b border-cyan-500/5 last:border-0 font-[Tajawal]"
                >
                  <Search className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span>{s}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              {/* Console prompt indicator */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500/30 font-mono text-xs pointer-events-none">
                &gt;_
              </div>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                  if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="اسأل راصد الذكي أي شيء — تحليل، تنفيذ، مراقبة، استعلام..."
                rows={1}
                className="w-full bg-[#060d1b]/80 border border-cyan-500/15 rounded-xl px-4 py-3 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:shadow-[0_0_15px_rgba(0,200,180,0.1)] transition-all resize-none overflow-hidden font-[Tajawal]"
                disabled={isLoading}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,200,180,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white disabled:opacity-30 shadow-lg shadow-cyan-500/20 hover:shadow-xl transition-all flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5" />
              )}
            </motion.button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-slate-600 flex items-center gap-1 font-mono">
              <Radar className="w-3 h-3 text-cyan-500/40" />
              SMART_RASID v6.0 // {Object.keys(toolLabels).length} TOOLS · 7 AGENTS
            </p>
            <p className="text-[10px] text-slate-600 font-mono">
              Enter ↵ · Shift+Enter ⏎
            </p>
          </div>
        </div>
      </div>

      {/* Leak Detail Drilldown */}
      <LeakDetailDrilldown
        leak={drillLeakId ? { leakId: drillLeakId } : null}
        open={!!drillLeakId}
        onClose={() => setDrillLeakId(null)}
      />
    </div>
  );
}

// Generate follow-up suggestions based on the last assistant message
function getFollowUpSuggestions(content: string): string[] {
  const suggestions: string[] = [];
  const lower = content.toLowerCase();

  if (lower.includes("تسريب") || lower.includes("leak")) {
    suggestions.push("تفاصيل أكثر عن التسريبات الحرجة");
    suggestions.push("ما التوصيات الأمنية؟");
  }
  if (lower.includes("ملخص") || lower.includes("لوحة") || lower.includes("إحصائي")) {
    suggestions.push("تحليل الاتجاهات الشهرية");
    suggestions.push("تحليل الارتباطات");
  }
  if (lower.includes("تقرير") || lower.includes("مستند")) {
    suggestions.push("تفاصيل التقارير المجدولة");
    suggestions.push("سجل التوثيقات الرسمية");
  }
  if (lower.includes("حماية") || lower.includes("pdpl") || lower.includes("خصوصية") || lower.includes("تهديد")) {
    suggestions.push("ما مواد PDPL ذات الصلة؟");
    suggestions.push("أفضل الممارسات الأمنية");
  }
  if (lower.includes("بائع") || lower.includes("seller")) {
    suggestions.push("البائعون عالي الخطورة");
    suggestions.push("تحليل ارتباطات البائعين بالقطاعات");
  }
  if (lower.includes("تحليل") || lower.includes("اتجاه") || lower.includes("trend") || lower.includes("ارتباط")) {
    suggestions.push("توزيع التسريبات حسب القطاع");
    suggestions.push("اكتشاف الأنماط غير العادية");
  }
  if (lower.includes("نشاط") || lower.includes("مستخدم") || lower.includes("موظف")) {
    suggestions.push("سجل المراجعة الكامل");
    suggestions.push("من أصدر تقارير اليوم؟");
  }
  if (lower.includes("معرفة") || lower.includes("knowledge") || lower.includes("سياسة")) {
    suggestions.push("البحث في قاعدة المعرفة");
    suggestions.push("ما هو نظام PDPL؟");
  }

  if (suggestions.length === 0) {
    suggestions.push("ملخص لوحة المعلومات");
    suggestions.push("تحليل ارتباطات شامل");
    suggestions.push("دليل استخدام المنصة");
  }

  return suggestions.slice(0, 3);
}
