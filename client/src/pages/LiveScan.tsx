/**
 * LiveScan — Real-time monitoring page
 * Shows live scanning activity with source configuration
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Radio,
  Globe,
  Send,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Eye,
  ChevronDown,
  Activity,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ScanSource {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ElementType;
  enabled: boolean;
  status: "active" | "paused" | "error";
  lastScan: string;
  findings: number;
}

interface ScanEvent {
  id: string;
  timestamp: Date;
  source: string;
  sourceIcon: React.ElementType;
  type: "finding" | "scan" | "alert" | "info";
  message: string;
  severity?: "critical" | "high" | "medium" | "low";
  details?: string;
}

const initialSources: ScanSource[] = [
  { id: "telegram", name: "تليجرام", nameEn: "Telegram", icon: Send, enabled: true, status: "active", lastScan: "منذ 3 ثوانٍ", findings: 47 },
  { id: "darkweb", name: "الدارك ويب", nameEn: "Dark Web", icon: Globe, enabled: true, status: "active", lastScan: "منذ 12 ثانية", findings: 23 },
  { id: "paste", name: "مواقع اللصق", nameEn: "Paste Sites", icon: FileText, enabled: true, status: "active", lastScan: "منذ 8 ثوانٍ", findings: 15 },
  { id: "forums", name: "المنتديات", nameEn: "Forums", icon: Shield, enabled: false, status: "paused", lastScan: "منذ ساعة", findings: 8 },
  { id: "social", name: "وسائل التواصل", nameEn: "Social Media", icon: Radio, enabled: false, status: "paused", lastScan: "منذ 3 ساعات", findings: 3 },
];

const sampleMessages = [
  { source: "telegram", type: "finding" as const, severity: "critical" as const, message: "تم رصد قاعدة بيانات تحتوي على 500,000 سجل من قطاع الاتصالات", details: "قناة: DataLeaks_KSA" },
  { source: "darkweb", type: "finding" as const, severity: "high" as const, message: "عرض بيع بيانات بنكية لـ 120,000 عميل سعودي", details: "منتدى: BreachForums" },
  { source: "paste", type: "scan" as const, message: "فحص 2,847 لصقة جديدة على Pastebin", details: "3 نتائج مطابقة" },
  { source: "telegram", type: "alert" as const, severity: "high" as const, message: "قناة جديدة تروج لبيانات حكومية سعودية", details: "تم إضافتها للمراقبة" },
  { source: "darkweb", type: "scan" as const, message: "مسح 156 سوق على الدارك ويب", details: "12 عرض جديد" },
  { source: "paste", type: "finding" as const, severity: "medium" as const, message: "كشف بيانات بريد إلكتروني لـ 8,500 موظف حكومي", details: "موقع: ghostbin.co" },
  { source: "telegram", type: "info" as const, message: "تحديث قائمة القنوات المراقبة: 1,247 قناة نشطة" },
  { source: "darkweb", type: "finding" as const, severity: "critical" as const, message: "تسريب سجلات طبية من مستشفى كبير - 890,000 سجل", details: "بائع: DarkPhantom" },
  { source: "paste", type: "scan" as const, message: "تحليل 5,120 لصقة - 7 تطابقات مع أنماط PII سعودية" },
  { source: "telegram", type: "finding" as const, severity: "high" as const, message: "مجموعة تبادل بيانات جوازات سفر سعودية", details: "مجموعة: 4,200 عضو" },
];

const sourceIcons: Record<string, React.ElementType> = {
  telegram: Send,
  darkweb: Globe,
  paste: FileText,
  forums: Shield,
  social: Radio,
};

const severityColors: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const typeIcons: Record<string, React.ElementType> = {
  finding: AlertTriangle,
  scan: Scan,
  alert: Zap,
  info: Activity,
};

export default function LiveScan() {
  const [sources, setSources] = useState<ScanSource[]>(initialSources);
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [totalFindings, setTotalFindings] = useState(0);
  const [scanRate, setScanRate] = useState(0);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate scan events
  useEffect(() => {
    if (!isScanning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const addEvent = () => {
      const enabledSources = sources.filter((s) => s.enabled);
      if (enabledSources.length === 0) return;

      const sample = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      const SourceIcon = sourceIcons[sample.source] || Activity;

      const newEvent: ScanEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(),
        source: sample.source,
        sourceIcon: SourceIcon,
        type: sample.type,
        message: sample.message,
        severity: sample.severity,
        details: sample.details,
      };

      setEvents((prev) => [...prev.slice(-100), newEvent]);
      if (sample.type === "finding") {
        setTotalFindings((prev) => prev + 1);
      }
      setScanRate((prev) => prev + 1);
    };

    intervalRef.current = setInterval(addEvent, 2000 + Math.random() * 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isScanning, sources]);

  // Auto-scroll to bottom
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  // Reset scan rate every 10s
  useEffect(() => {
    const timer = setInterval(() => setScanRate(0), 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, enabled: !s.enabled, status: !s.enabled ? "active" : "paused" }
          : s
      )
    );
    toast.success("تم تحديث مصدر الرصد");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="relative">
              <Scan className="w-7 h-7 text-primary" />
              {isScanning && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            الرصد المباشر
          </h1>
          <p className="text-muted-foreground text-sm mt-1">مراقبة فورية لمصادر التسريبات في الوقت الحقيقي</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            إعدادات المصادر
          </Button>
          <Button
            size="sm"
            onClick={() => setIsScanning(!isScanning)}
            className={`gap-2 ${isScanning ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
          >
            {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isScanning ? "إيقاف" : "تشغيل"}
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {isScanning ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
              <span className="text-xs text-muted-foreground">الحالة</span>
            </div>
            <p className={`text-lg font-bold ${isScanning ? "text-emerald-400" : "text-red-400"}`}>
              {isScanning ? "نشط" : "متوقف"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">المصادر النشطة</span>
            </div>
            <p className="text-lg font-bold text-foreground">{sources.filter((s) => s.enabled).length}/{sources.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">الاكتشافات</span>
            </div>
            <p className="text-lg font-bold text-amber-400">{totalFindings}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">معدل المسح</span>
            </div>
            <p className="text-lg font-bold text-purple-400">{scanRate}/10s</p>
          </CardContent>
        </Card>
      </div>

      {/* Source settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">إعدادات مصادر الرصد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sources.map((source) => {
                    const Icon = source.icon;
                    return (
                      <div
                        key={source.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          source.enabled
                            ? "border-primary/20 bg-primary/5"
                            : "border-border/50 bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${source.enabled ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <p className="text-sm font-medium text-foreground">{source.name}</p>
                            <p className="text-xs text-muted-foreground">{source.lastScan} • {source.findings} نتيجة</p>
                          </div>
                        </div>
                        <Switch
                          checked={source.enabled}
                          onCheckedChange={() => toggleSource(source.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live event feed */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            البث المباشر
            {isScanning && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEvents([])}
            className="text-xs gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            مسح
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] overflow-y-auto space-y-2 font-mono text-sm" dir="rtl">
            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Scan className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">{isScanning ? "في انتظار النتائج..." : "الرصد متوقف"}</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {events.map((event) => {
                const TypeIcon = typeIcons[event.type] || Activity;
                const SourceIcon = event.sourceIcon;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30"
                  >
                    {/* Time */}
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5 font-mono" dir="ltr">
                      {event.timestamp.toLocaleTimeString("ar-SA")}
                    </span>

                    {/* Source icon */}
                    <SourceIcon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {event.severity && (
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${severityColors[event.severity]}`}>
                            {event.severity === "critical" ? "حرج" : event.severity === "high" ? "عالي" : event.severity === "medium" ? "متوسط" : "منخفض"}
                          </Badge>
                        )}
                        <span className="text-foreground text-xs">{event.message}</span>
                      </div>
                      {event.details && (
                        <p className="text-[10px] text-muted-foreground mt-1">{event.details}</p>
                      )}
                    </div>

                    {/* Type icon */}
                    <TypeIcon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                      event.type === "finding" ? "text-amber-400" :
                      event.type === "alert" ? "text-red-400" :
                      event.type === "scan" ? "text-blue-400" : "text-muted-foreground"
                    }`} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={eventsEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
