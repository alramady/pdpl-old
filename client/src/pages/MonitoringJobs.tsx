/**
 * MonitoringJobs — Scheduled background monitoring job dashboard
 * Shows job status, last run results, and manual trigger controls
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Radio,
  Play,
  Pause,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Globe,
  Send,
  FileText,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";

const platformIcons: Record<string, React.ElementType> = {
  telegram: Send,
  darkweb: Globe,
  paste: FileText,
  all: Activity,
};

const platformLabels: Record<string, { ar: string; en: string }> = {
  telegram: { ar: "تليجرام", en: "Telegram" },
  darkweb: { ar: "الدارك ويب", en: "Dark Web" },
  paste: { ar: "مواقع اللصق", en: "Paste Sites" },
  all: { ar: "جميع المنصات", en: "All Platforms" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "نشط", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  paused: { label: "متوقف", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Pause },
  running: { label: "قيد التشغيل", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", icon: Loader2 },
  error: { label: "خطأ", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
};

function formatDate(date: Date | string | null) {
  if (!date) return "لم يتم التشغيل بعد";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function MonitoringJobs() {
  const { data: jobs, isLoading, refetch } = trpc.jobs.list.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const triggerMutation = trpc.jobs.trigger.useMutation({
    onSuccess: (_, vars) => {
      toast.success("تم تشغيل المهمة", { description: `Job ${vars.jobId} triggered` });
      refetch();
    },
    onError: () => {
      toast.error("فشل تشغيل المهمة", { description: "Failed to trigger job" });
    },
  });

  const toggleMutation = trpc.jobs.toggleStatus.useMutation({
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === "active" ? "تم استئناف المهمة" : "تم إيقاف المهمة",
        { description: `Job ${vars.jobId} ${vars.status === "active" ? "resumed" : "paused"}` }
      );
      refetch();
    },
  });

  // Listen for real-time job updates
  const { lastJobUpdate } = useWebSocket();
  useEffect(() => {
    if (lastJobUpdate) {
      refetch();
    }
  }, [lastJobUpdate]);

  // Summary stats
  const activeJobs = jobs?.filter((j) => j.status === "active").length ?? 0;
  const totalRuns = jobs?.reduce((sum, j) => sum + (j.totalRuns ?? 0), 0) ?? 0;
  const totalLeaksFound = jobs?.reduce((sum, j) => sum + (j.leaksFound ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">مهام الرصد المجدولة</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitoring Jobs — إدارة مهام الفحص التلقائي</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent border-border"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "المهام النشطة", labelEn: "Active Jobs", value: activeJobs, icon: Radio, color: "text-emerald-400", glow: "glow-emerald" },
          { label: "إجمالي التشغيلات", labelEn: "Total Runs", value: totalRuns, icon: RefreshCw, color: "text-cyan-400", glow: "glow-cyan" },
          { label: "تسريبات مكتشفة", labelEn: "Leaks Found", value: totalLeaksFound, icon: AlertTriangle, color: "text-amber-400", glow: "glow-amber" },
          { label: "إجمالي المهام", labelEn: "Total Jobs", value: jobs?.length ?? 0, icon: Clock, color: "text-purple-400", glow: "" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card rounded-xl p-4 ${stat.glow}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} bg-current/10`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Jobs list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Radio className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">لا توجد مهام مجدولة</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job, idx) => {
            const PlatformIcon = platformIcons[job.platform] || Activity;
            const platLabel = platformLabels[job.platform] || platformLabels.all;
            const statusConf = statusConfig[job.status] || statusConfig.active;
            const StatusIcon = statusConf.icon;
            const isRunning = job.status === "running";

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="glass-card rounded-xl p-5 hover:border-primary/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Job info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <PlatformIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{job.nameAr}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusConf.color}`}>
                          <StatusIcon className={`w-3 h-3 ${isRunning ? "animate-spin" : ""}`} />
                          {statusConf.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {platLabel.ar}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {job.cronExpression}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs bg-transparent border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                      onClick={() => triggerMutation.mutate({ jobId: job.jobId })}
                      disabled={isRunning || triggerMutation.isPending}
                    >
                      {isRunning ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                      تشغيل يدوي
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 text-xs bg-transparent border-border ${
                        job.status === "active"
                          ? "hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30"
                          : "hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                      }`}
                      onClick={() =>
                        toggleMutation.mutate({
                          jobId: job.jobId,
                          status: job.status === "active" ? "paused" : "active",
                        })
                      }
                      disabled={isRunning}
                    >
                      {job.status === "active" ? (
                        <>
                          <Pause className="w-3 h-3" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          استئناف
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Job details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/30">
                  <div>
                    <p className="text-[10px] text-muted-foreground">آخر تشغيل</p>
                    <p className="text-xs text-foreground mt-0.5">{formatDate(job.lastRunAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">إجمالي التشغيلات</p>
                    <p className="text-xs text-foreground mt-0.5 font-bold">{job.totalRuns ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">تسريبات مكتشفة</p>
                    <p className="text-xs text-amber-400 mt-0.5 font-bold">{job.leaksFound ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">آخر نتيجة</p>
                    <p className="text-xs text-foreground mt-0.5 truncate">{job.lastResult || "—"}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
