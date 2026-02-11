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
  ChevronLeft,
  Clock,
  Zap,
  Globe,
  Eye,
  TrendingUp,
  Loader2,
  X,
  MessageSquare,
  Plus,
  History,
} from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  searchResults?: any;
}

const quickCommands = [
  { label: "ملخص لوحة المعلومات", icon: BarChart3, color: "text-cyan-400", query: "ملخص لوحة المعلومات" },
  { label: "تسريبات حرجة", icon: AlertTriangle, color: "text-red-400", query: "ابحث عن تسريبات حرجة" },
  { label: "أنشئ تقرير أسبوعي", icon: FileText, color: "text-emerald-400", query: "أنشئ تقرير أسبوعي" },
  { label: "حالة الامتثال", icon: Shield, color: "text-amber-400", query: "حالة الامتثال" },
  { label: "تقرير استخباراتي", icon: Eye, color: "text-purple-400", query: "أنشئ تقرير استخباراتي شامل" },
  { label: "تحديث البيانات", icon: RefreshCw, color: "text-blue-400", query: "حدث البيانات" },
];

const capabilities = [
  { icon: BarChart3, label: "عرض ملخص لوحة المعلومات", color: "text-cyan-400" },
  { icon: Search, label: "البحث في التسريبات", color: "text-emerald-400" },
  { icon: Shield, label: "فحص سياسات الخصوصية", color: "text-amber-400" },
  { icon: Globe, label: "فحص شهادات SSL/TLS", color: "text-blue-400" },
  { icon: Database, label: "عرض حالة الامتثال", color: "text-purple-400" },
  { icon: Zap, label: "استعلامات استخباراتية", color: "text-orange-400" },
  { icon: FileText, label: "إنشاء تقارير PDF", color: "text-indigo-400" },
  { icon: RefreshCw, label: "تحديث بيانات المنصة", color: "text-teal-400" },
];

export default function SmartRasid() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [drillLeakId, setDrillLeakId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const chatMutation = trpc.smartRasid.chat.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debounced suggestions
  const fetchSuggestions = useCallback(async (partial: string) => {
    if (partial.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      // Use a simple fetch instead of trpc for suggestions to avoid re-render loops
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

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const result = await chatMutation.mutateAsync({
        message: msg,
        history: history as Array<{ role: "user" | "assistant"; content: string }>,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: (typeof result.response === 'string' ? result.response : '') as string,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
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
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  };

  // Extract leak IDs from message content for drill-down
  const extractLeakIds = (content: string): string[] => {
    const matches = content.match(/LK-\d{4}-\d{4}/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a1628] to-[#0d1f3c]" dir="rtl">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/5 bg-[#0d1a30]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0d1a30]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                راصد الذكي
                <span className="text-[10px] font-normal bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">RASID AI</span>
              </h1>
              <p className="text-[11px] text-slate-400">المساعد الذكي لمنصة راصد — تحليل أمني متقدم</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              title="سجل المحادثات"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              محادثة جديدة
            </button>
          </div>
        </div>

        {/* Quick Command Bar */}
        <div className="flex items-center gap-2 px-6 pb-3 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] text-slate-500 whitespace-nowrap">أوامر سريعة</span>
          {quickCommands.map((cmd, i) => (
            <button
              key={i}
              onClick={() => sendMessage(cmd.query)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-all"
            >
              <cmd.icon className={`w-3 h-3 ${cmd.color}`} />
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-[#0d1a30]">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              🤖 مرحباً بك في <span className="text-cyan-400">راصد الذكي</span>
            </h2>
            <p className="text-sm text-slate-400 mb-6 text-center">
              المساعد الذكي لمنصة راصد الوطنية لرصد تسريبات البيانات الشخصية
            </p>

            <div className="w-full bg-[#0d1f3c]/80 rounded-2xl border border-white/5 p-5 mb-6">
              <p className="text-sm text-slate-300 mb-4 text-center">يمكنني مساعدتك في:</p>
              <div className="grid grid-cols-2 gap-2">
                {capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <cap.icon className={`w-4 h-4 ${cap.color}`} />
                    <span className="text-xs text-slate-300">{cap.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-4 text-center">
                💡 اكتب <span className="text-cyan-400 font-bold">مساعدة</span> لعرض جميع الأوامر المتاحة
              </p>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {quickCommands.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(cmd.query)}
                  className="px-4 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-sm text-cyan-300 hover:text-cyan-200 transition-all"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {user?.name?.charAt(0) || (user as any)?.displayName?.charAt(0) || "م"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-cyan-600/20 border border-cyan-500/20 text-white"
                        : "bg-[#0d1f3c] border border-white/5 text-slate-200"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <Streamdown>{msg.content}</Streamdown>
                        {/* Clickable Leak IDs */}
                        {extractLeakIds(msg.content).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                            {extractLeakIds(msg.content).map(id => (
                              <button
                                key={id}
                                onClick={() => setDrillLeakId(id)}
                                className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors font-mono"
                              >
                                📋 {id}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${msg.role === "user" ? "justify-end" : ""}`}>
                    <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                    {msg.role === "assistant" && (
                      <span className="text-[10px] text-emerald-500">✓ مكتمل</span>
                    )}
                  </div>

                  {/* Follow-up suggestions after assistant messages */}
                  {msg.role === "assistant" && msg.id === messages[messages.length - 1]?.id && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {getFollowUpSuggestions(msg.content).map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(suggestion)}
                          className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/20 text-slate-400 hover:text-white transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-[#0d1f3c] border border-white/5 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-sm text-slate-400">جارٍ التحليل...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-white/5 bg-[#0d1a30]/80 backdrop-blur-xl p-4">
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mb-2 bg-[#0d1f3c] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(s)}
                className="w-full text-right px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2 border-b border-white/5 last:border-0"
              >
                <Search className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
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
              placeholder="اكتب أمراً أو سؤالاً..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
              disabled={isLoading}
            />
            <ChevronLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white disabled:opacity-30 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 max-w-4xl mx-auto">
          <p className="text-[10px] text-slate-600">
            RASID AI v2.0 — مكتب إدارة البيانات الوطنية
          </p>
          <p className="text-[10px] text-slate-600">
            ⌨️ Enter للإرسال · ⇧ لسطر جديد
          </p>
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
    suggestions.push("ابحث عن تسريبات حرجة");
    suggestions.push("فحص سياسة الخصوصية");
  }
  if (lower.includes("ملخص") || lower.includes("لوحة")) {
    suggestions.push("ابحث عن تسريبات حرجة");
    suggestions.push("حالة الامتثال");
  }
  if (lower.includes("تقرير")) {
    suggestions.push("أنشئ تقرير أسبوعي");
    suggestions.push("ملخص لوحة المعلومات");
  }
  if (lower.includes("امتثال") || lower.includes("خصوصية")) {
    suggestions.push("فحص شهادات SSL/TLS");
    suggestions.push("ملخص لوحة المعلومات");
  }

  if (suggestions.length === 0) {
    suggestions.push("ملخص لوحة المعلومات");
    suggestions.push("ابحث عن تسريبات حرجة");
    suggestions.push("مساعدة");
  }

  return suggestions.slice(0, 3);
}
