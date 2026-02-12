/**
 * SemanticSearchDashboard — لوحة إحصائيات البحث الدلالي
 * Displays embedding coverage, search performance, popular queries, 
 * activity timeline, and low-coverage topics for content gap analysis
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Brain,
  Search,
  BarChart3,
  TrendingUp,
  Zap,
  Database,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  Sparkles,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SemanticSearchDashboard() {
  const [testQuery, setTestQuery] = useState("");
  const [enableRerank, setEnableRerank] = useState(true);

  // Queries
  const embeddingStats = trpc.knowledgeBaseAdmin.embeddingStats.useQuery();
  const searchAnalytics = trpc.knowledgeBaseAdmin.searchAnalytics.useQuery();
  const popularQueries = trpc.knowledgeBaseAdmin.popularQueries.useQuery();
  const lowCoverage = trpc.knowledgeBaseAdmin.lowCoverageQueries.useQuery();
  const timeline = trpc.knowledgeBaseAdmin.searchActivityTimeline.useQuery();
  const queryLogs = trpc.knowledgeBaseAdmin.searchQueryLogs.useQuery({ limit: 15 });

  // Test search mutation
  const testSearch = trpc.knowledgeBaseAdmin.testSemanticSearch.useMutation({
    onSuccess: () => toast.success("تم تنفيذ البحث التجريبي بنجاح"),
    onError: (err) => toast.error(`فشل البحث: ${err.message}`),
  });

  // Generate all embeddings mutation
  const generateAll = trpc.knowledgeBaseAdmin.generateAllEmbeddings.useMutation({
    onSuccess: (data) => {
      toast.success(`تم توليد ${data.generated} تضمين بنجاح`);
      embeddingStats.refetch();
    },
    onError: (err) => toast.error(`فشل التوليد: ${err.message}`),
  });

  const stats = embeddingStats.data;
  const analytics = searchAnalytics.data;
  const popular = popularQueries.data || [];
  const lowCov = lowCoverage.data || [];
  const timelineData = timeline.data || [];
  const logs = queryLogs.data || [];

  const handleTestSearch = () => {
    if (!testQuery.trim()) return;
    testSearch.mutate({
      query: testQuery.trim(),
      topK: 5,
      rerank: enableRerank,
    });
  };

  // Calculate max count for popular queries bar chart
  const maxPopularCount = Math.max(...popular.map(q => q.count), 1);
  const maxTimelineCount = Math.max(...timelineData.map(d => d.count), 1);

  return (
    <div className="space-y-6 p-1" dir="rtl">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">تحليلات البحث الدلالي</h1>
            <p className="text-sm text-muted-foreground">مراقبة أداء البحث الدلالي وتحليل استعلامات المستخدمين</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            embeddingStats.refetch();
            searchAnalytics.refetch();
            popularQueries.refetch();
            lowCoverage.refetch();
            timeline.refetch();
            queryLogs.refetch();
          }}
          className="gap-2 border-cyan-500/20 hover:bg-cyan-500/10"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث البيانات
        </Button>
      </div>

      {/* ═══ EMBEDDING COVERAGE SECTION ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Coverage Card */}
        <Card className="glass-card border-white/[0.06] col-span-1 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              تغطية التضمينات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Circular Progress */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="url(#coverageGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats?.coverage || 0) * 3.27} 327`}
                  />
                  <defs>
                    <linearGradient id="coverageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-cyan-400">{stats?.coverage || 0}%</span>
                  <span className="text-[9px] text-muted-foreground">تغطية</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">إجمالي المقالات</span>
                  <span className="text-lg font-bold">{stats?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    مع تضمينات
                  </span>
                  <span className="text-lg font-bold text-emerald-400">{stats?.withEmbeddings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-400" />
                    بدون تضمينات
                  </span>
                  <span className="text-lg font-bold text-red-400">{stats?.withoutEmbeddings || 0}</span>
                </div>
                {(stats?.withoutEmbeddings || 0) > 0 && (
                  <Button
                    size="sm"
                    onClick={() => generateAll.mutate()}
                    disabled={generateAll.isPending}
                    className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                  >
                    {generateAll.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    توليد التضمينات المفقودة
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> النموذج: {stats?.model || "—"}</span>
              <span>الأبعاد: {stats?.dimensions || "—"}</span>
              <span>ذاكرة التخزين: {stats?.cacheSize || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Search Performance Cards */}
        <Card className="glass-card border-white/[0.06]">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-2">
              <Search className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-3xl font-bold">{analytics?.totalQueries || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الاستعلامات</p>
            <div className="flex items-center gap-3 mt-2 text-[10px]">
              <span className="text-cyan-400">{analytics?.queriesLast24h || 0} اليوم</span>
              <span className="text-blue-400">{analytics?.queriesLast7d || 0} أسبوع</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/[0.06]">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{analytics?.avgTopScore ? (analytics.avgTopScore * 100).toFixed(0) : 0}%</p>
            <p className="text-xs text-muted-foreground mt-1">متوسط دقة البحث</p>
            <div className="flex items-center gap-3 mt-2 text-[10px]">
              <span className="text-amber-400">{analytics?.zeroResultQueries || 0} بلا نتائج</span>
              <span className="text-violet-400">{analytics?.rerankedQueries || 0} معاد ترتيبها</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ SEARCH METHOD BREAKDOWN ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">{analytics?.semanticQueries || 0}</p>
              <p className="text-xs text-muted-foreground">بحث دلالي</p>
            </div>
            <div className="mr-auto text-xs text-muted-foreground">
              {analytics?.totalQueries ? ((analytics.semanticQueries / analytics.totalQueries) * 100).toFixed(0) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Search className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{analytics?.keywordQueries || 0}</p>
              <p className="text-xs text-muted-foreground">بحث بالكلمات</p>
            </div>
            <div className="mr-auto text-xs text-muted-foreground">
              {analytics?.totalQueries ? ((analytics.keywordQueries / analytics.totalQueries) * 100).toFixed(0) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-400">{analytics?.rerankedQueries || 0}</p>
              <p className="text-xs text-muted-foreground">معاد ترتيبها بالذكاء</p>
            </div>
            <div className="mr-auto text-xs text-muted-foreground">
              {analytics?.avgResponseTimeMs || 0}ms متوسط
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ TEST SEMANTIC SEARCH ═══ */}
      <Card className="glass-card border-cyan-500/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            اختبار البحث الدلالي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="أدخل استعلام للبحث الدلالي..."
                className="pr-10 bg-white/5 border-white/10"
                onKeyDown={(e) => e.key === "Enter" && handleTestSearch()}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={enableRerank}
                onChange={(e) => setEnableRerank(e.target.checked)}
                className="rounded border-white/20"
              />
              إعادة ترتيب
            </label>
            <Button
              onClick={handleTestSearch}
              disabled={testSearch.isPending || !testQuery.trim()}
              className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              {testSearch.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              بحث
            </Button>
          </div>

          {/* Test Results */}
          <AnimatePresence>
            {testSearch.data && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-3"
              >
                <div className="flex items-center gap-4 text-xs text-muted-foreground bg-white/5 rounded-lg p-3">
                  <span>النتائج: <strong className="text-foreground">{testSearch.data.stats.totalResults}</strong></span>
                  <span>أعلى دقة: <strong className="text-emerald-400">{(testSearch.data.stats.topScore * 100).toFixed(1)}%</strong></span>
                  <span>متوسط الدقة: <strong className="text-cyan-400">{(testSearch.data.stats.avgScore * 100).toFixed(1)}%</strong></span>
                  <span>الوقت: <strong className="text-amber-400">{testSearch.data.stats.responseTimeMs}ms</strong></span>
                  {testSearch.data.stats.reranked && (
                    <span className="text-violet-400 flex items-center gap-1"><Zap className="w-3 h-3" /> معاد الترتيب</span>
                  )}
                </div>
                {testSearch.data.results.map((r, i) => (
                  <div key={r.entryId} className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">
                          {r.rank}
                        </span>
                        <span className="font-medium text-sm">{r.titleAr || r.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">{r.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-mono ${r.similarity > 0.8 ? 'text-emerald-400' : r.similarity > 0.7 ? 'text-cyan-400' : 'text-amber-400'}`}>
                          {(r.similarity * 100).toFixed(1)}%
                        </span>
                        {r.rerankedScore !== undefined && (
                          <span className="text-violet-400 font-mono">↑{(r.rerankedScore * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.contentPreview}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ═══ POPULAR QUERIES & LOW COVERAGE ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Popular Queries */}
        <Card className="glass-card border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              الاستعلامات الأكثر شيوعاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popular.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                لا توجد استعلامات مسجلة بعد
              </div>
            ) : (
              <div className="space-y-2">
                {popular.map((q, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded text-[10px] bg-white/5 flex items-center justify-center text-muted-foreground font-mono">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs truncate max-w-[200px]">{q.query}</span>
                        <span className="text-[10px] text-muted-foreground">{q.count} مرة</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-cyan-500"
                          style={{ width: `${(q.count / maxPopularCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono ${q.avgScore > 0.8 ? 'text-emerald-400' : q.avgScore > 0.7 ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {(q.avgScore * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Coverage / Content Gaps */}
        <Card className="glass-card border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              فجوات المحتوى (استعلامات ضعيفة النتائج)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowCov.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                لا توجد فجوات في المحتوى حالياً
              </div>
            ) : (
              <div className="space-y-2">
                {lowCov.map((q, i) => (
                  <div key={i} className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{q.query}</span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-amber-400">{q.count} مرة</span>
                        <span className="text-red-400">نتائج: {q.avgResults.toFixed(1)}</span>
                        <span className="text-muted-foreground">دقة: {(q.avgScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══ SEARCH ACTIVITY TIMELINE ═══ */}
      <Card className="glass-card border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            نشاط البحث (آخر 30 يوم)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              لا توجد بيانات نشاط بعد
            </div>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {timelineData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-8 bg-background/90 border border-white/10 rounded px-2 py-1 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d.date}: {d.count} استعلام
                  </div>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-blue-500/60 to-cyan-500/60 transition-all hover:from-blue-500 hover:to-cyan-500"
                    style={{
                      height: `${Math.max((d.count / maxTimelineCount) * 100, 4)}%`,
                      minHeight: "4px",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ RECENT QUERY LOG ═══ */}
      <Card className="glass-card border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            سجل الاستعلامات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              لا توجد استعلامات مسجلة بعد
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-muted-foreground">
                    <th className="text-right py-2 px-2">الاستعلام</th>
                    <th className="text-center py-2 px-2">المصدر</th>
                    <th className="text-center py-2 px-2">الطريقة</th>
                    <th className="text-center py-2 px-2">النتائج</th>
                    <th className="text-center py-2 px-2">الدقة</th>
                    <th className="text-center py-2 px-2">الوقت</th>
                    <th className="text-center py-2 px-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/5">
                      <td className="py-2 px-2 max-w-[200px] truncate">{log.query}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                          log.source === "rasid_ai" ? "bg-violet-500/10 text-violet-400" :
                          log.source === "knowledge_base_ui" ? "bg-cyan-500/10 text-cyan-400" :
                          "bg-blue-500/10 text-blue-400"
                        }`}>
                          {log.source === "rasid_ai" ? "راصد" : log.source === "knowledge_base_ui" ? "واجهة" : "API"}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`text-[9px] ${log.searchMethod === "semantic" ? "text-cyan-400" : "text-amber-400"}`}>
                          {log.searchMethod === "semantic" ? "دلالي" : "كلمات"}
                        </span>
                        {log.reranked && <Zap className="w-3 h-3 text-violet-400 inline mr-1" />}
                      </td>
                      <td className="py-2 px-2 text-center font-mono">{log.resultCount}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`font-mono ${
                          Number(log.topScore) > 0.8 ? "text-emerald-400" :
                          Number(log.topScore) > 0.7 ? "text-cyan-400" :
                          Number(log.topScore) > 0 ? "text-amber-400" : "text-red-400"
                        }`}>
                          {log.topScore ? `${(Number(log.topScore) * 100).toFixed(0)}%` : "—"}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-muted-foreground font-mono">
                        {log.responseTimeMs ? `${log.responseTimeMs}ms` : "—"}
                      </td>
                      <td className="py-2 px-2 text-center text-muted-foreground">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
