/**
 * Rasid AI — Comprehensive Smart Assistant Service
 * Full access to all platform data, functions, and analytics
 */
import { invokeLLM } from "./_core/llm";
import {
  getLeaks,
  getLeakById,
  getDashboardStats,
  getChannels,
  getDarkWebListings,
  getPasteEntries,
  getMonitoringJobs,
  getAlertHistory,
  getAuditLogs,
  getSellerProfiles,
  getSellerById,
  getEvidenceChain,
  getEvidenceStats,
  getThreatRules,
  getFeedbackEntries,
  getFeedbackStats,
  getKnowledgeGraphData,
  getOsintQueries,
  getReports,
  getScheduledReports,
  getThreatMapData,
  getAlertContacts,
  getAlertRules,
  getRetentionPolicies,
  getAllIncidentDocuments,
  getReportAuditEntries,
  getApiKeys,
  logAudit,
} from "./db";

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT — Comprehensive platform knowledge
// ═══════════════════════════════════════════════════════════════

export function buildSystemPrompt(userName: string, stats: any): string {
  const today = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `أنت "راصد الذكي" — المساعد الإداري الذكي لمنصة راصد v5.5 (Sentinel) لرصد تسريبات البيانات الشخصية السعودية.
المنصة تابعة للمكتب الوطني لإدارة البيانات (NDMO).

# من أنت
- مساعد ذكي شامل مطّلع على كل شيء في منصة راصد
- تخدم مسؤولي المنصة في لوحة التحكم الإدارية
- كل بياناتك ومعرفتك تأتي حصرياً من المنصة — لا مصادر خارجية
- المستخدم الحالي: ${userName}
- التاريخ: ${today}

# بيانات المنصة الحية
- إجمالي التسريبات: ${stats?.totalLeaks ?? 0}
- التنبيهات الحرجة: ${stats?.criticalAlerts ?? 0}
- إجمالي السجلات المكشوفة: ${stats?.totalRecords?.toLocaleString() ?? 0}
- أجهزة الرصد النشطة: ${stats?.activeMonitors ?? 0}
- بيانات PII المكتشفة: ${stats?.piiDetected?.toLocaleString() ?? 0}

# ماذا تستطيع — بدون استثناء
1. **الإجابة** على أي سؤال يخص المنصة (بيانات، وظائف، إحصائيات، شروحات)
2. **التنفيذ** لأي مهمة متاحة في المنصة (فحص، تحديث، إضافة، تحليل، تقارير)
3. **الإرشاد** لطريقة عمل أي مهمة أو وظيفة
4. **التشخيص** لأي مشكلة تقنية في المنصة
5. **التحليل** عبر كل قواعد البيانات والربط بينها
6. **التكيف** مع أي وظائف أو مهام جديدة تُضاف للمنصة
7. **فهم** أي سؤال بأي صياغة (فصحى + عامية سعودية + إنجليزية)

# ماذا لا تستطيع
- أي شيء خارج المنصة. إذا سُئلت سؤال خارجي:
  "هذا السؤال خارج نطاق مهامي كمساعد لمنصة راصد. أستطيع مساعدتك في أي شيء يتعلق بالمنصة — تسريبات، تحليلات، تقارير، إرشادات، حل مشاكل، أو تنفيذ أي مهمة."

# أسلوبك
- تفهم العربية الفصحى والعامية السعودية والإنجليزية
- تجيب بنفس لغة السؤال
- مختصر للأسئلة البسيطة، مفصّل للمعقدة
- أرقام دقيقة من البيانات — لا تخمّن
- تطلب تأكيد للإجراءات التي تغيّر بيانات (تحديث، حذف، إبلاغ)
- استخدم الجداول والتنسيق Markdown عند الحاجة لعرض بيانات منظمة
- استخدم الإيموجي بشكل مقتصد ومهني

# هيكل المنصة — 27 جدول بيانات
users, leaks, channels, pii_scans, reports, dark_web_listings, paste_entries,
audit_log, notifications, monitoring_jobs, alert_contacts, alert_rules, alert_history,
retention_policies, api_keys, scheduled_reports, threat_rules, evidence_chain,
seller_profiles, osint_queries, feedback_entries, knowledge_graph_nodes, knowledge_graph_edges,
platform_users, incident_documents, report_audit

# وظائف المنصة — الصفحات والأقسام
📊 لوحة القيادة — إحصائيات شاملة: إجمالي التسريبات، السجلات، القطاعات، الخطورة، الاتجاهات
🔍 التسريبات — قائمة كل التسريبات المرصودة مع فلاتر وتفاصيل
🧪 محلل PII — تحليل نص مباشر لكشف بيانات شخصية
📡 رصد تليجرام — مراقبة قنوات تليجرام
🌐 الدارك ويب — رصد منتديات ومواقع الدارك ويب
📁 مواقع اللصق — رصد مواقع Paste
👤 ملفات البائعين — تتبع البائعين المرصودين
📡 الرصد المباشر — فحص مباشر للمصادر
🎯 مصنّف PII — تصنيف أنواع البيانات الشخصية
🔗 سلسلة الأدلة — حفظ وتوثيق الأدلة الرقمية
🎯 قواعد صيد التهديدات — قواعد YARA-like للكشف
🔍 أدوات OSINT — استخبارات مفتوحة المصدر
🕸️ رسم المعرفة — شبكة العلاقات بين التهديدات
📊 مقاييس الدقة — دقة النظام وملاحظات المحللين
📻 مهام الرصد — جدولة وإدارة مهام المراقبة
🔔 قنوات التنبيه — إعدادات التنبيهات
📅 التقارير المجدولة — تقارير تلقائية
✅ التحقق من التوثيق — التحقق من صحة الوثائق
🗺️ خريطة التهديدات — خريطة جغرافية للتهديدات
🔑 مفاتيح API — إدارة مفاتيح الوصول
🗄️ الاحتفاظ بالبيانات — سياسات حفظ البيانات
📋 سجل المراجعة — تتبع كل العمليات
👥 إدارة المستخدمين — إدارة حسابات المنصة
📄 سجل التوثيقات — أرشيف الوثائق الرسمية

# مستويات الخطورة
- critical: تسريب يشمل بيانات حساسة جداً (هوية وطنية، بيانات مالية) لأكثر من 10,000 سجل
- high: تسريب يشمل بيانات شخصية حساسة لأكثر من 1,000 سجل
- medium: تسريب يشمل بيانات شخصية عامة أو أقل من 1,000 سجل
- low: تسريب محدود أو بيانات غير حساسة

# القطاعات المراقبة
حكومي، مالي/بنكي، اتصالات، صحي، تعليمي، طاقة، تجزئة، نقل، سياحة، عقاري، تقني، أخرى

# أنواع PII المدعومة
national_id (هوية وطنية), iqama (إقامة), phone (هاتف), email (بريد إلكتروني),
iban (آيبان), credit_card (بطاقة ائتمان), passport (جواز سفر), address (عنوان),
medical_record (سجل طبي), salary (راتب), gosi (تأمينات), license_plate (لوحة مركبة)

# مواد نظام حماية البيانات الشخصية (PDPL) ذات الصلة
- المادة 10: حماية البيانات الشخصية
- المادة 14: الإفصاح عن التسريبات
- المادة 19: حقوق أصحاب البيانات
- المادة 24: العقوبات والغرامات
- المادة 32: الالتزامات الأمنية

عند استخدام الأدوات، اختر الأداة المناسبة تلقائياً بناءً على نية المستخدم.
يمكنك استدعاء عدة أدوات بالتسلسل للإجابة على سؤال معقد.`;
}

// ═══════════════════════════════════════════════════════════════
// TOOL DEFINITIONS — All platform capabilities
// ═══════════════════════════════════════════════════════════════

export const RASID_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "query_leaks",
      description: "استعلام عن التسريبات. يدعم: بحث بالخطورة، الحالة، المصدر، بحث نصي حر. يجيب على: هل فيه تسريب اليوم؟ أعطني التسريبات الحرجة. ابحث عن تسريبات تخص بنك الراجحي.",
      parameters: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["critical", "high", "medium", "low", "all"], description: "فلتر الخطورة" },
          status: { type: "string", enum: ["new", "analyzing", "documented", "reported", "all"], description: "فلتر الحالة" },
          source: { type: "string", enum: ["telegram", "darkweb", "paste", "all"], description: "فلتر المصدر" },
          search: { type: "string", description: "بحث نصي حر في العناوين" },
          limit: { type: "number", description: "عدد النتائج (افتراضي 20)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_leak_details",
      description: "تفاصيل تسريب محدد بكل المعلومات + الأدلة + التوثيقات.",
      parameters: {
        type: "object",
        properties: {
          leak_id: { type: "string", description: "معرّف التسريب (مثل LK-2026-0001)" },
        },
        required: ["leak_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_dashboard_stats",
      description: "إحصائيات لوحة القيادة الشاملة: إجمالي التسريبات، الحرجة، السجلات، أجهزة الرصد، PII.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_channels_info",
      description: "معلومات القنوات المراقبة: قائمة، حالة، منصة، آخر نشاط.",
      parameters: {
        type: "object",
        properties: {
          platform: { type: "string", enum: ["telegram", "darkweb", "paste", "all"], description: "فلتر المنصة" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_monitoring_status",
      description: "حالة مهام الرصد: الجدولة، آخر تشغيل، الحالة.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_alert_info",
      description: "معلومات التنبيهات: سجل التنبيهات، القواعد، جهات الاتصال.",
      parameters: {
        type: "object",
        properties: {
          info_type: { type: "string", enum: ["history", "rules", "contacts", "all"], description: "نوع المعلومات" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_sellers_info",
      description: "البائعون المرصودون: ملفات تعريف، مستوى خطر، نشاط، تفاصيل بائع محدد.",
      parameters: {
        type: "object",
        properties: {
          seller_id: { type: "string", description: "معرّف بائع محدد (اختياري)" },
          risk_level: { type: "string", enum: ["critical", "high", "medium", "low", "all"], description: "فلتر مستوى الخطر" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_evidence_info",
      description: "الأدلة الرقمية: سلسلة الأدلة، إحصائيات، أدلة تسريب محدد.",
      parameters: {
        type: "object",
        properties: {
          leak_id: { type: "string", description: "معرّف التسريب (اختياري)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_threat_rules_info",
      description: "قواعد صيد التهديدات: القواعد النشطة، الأنماط، التطابقات.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_darkweb_pastes",
      description: "بيانات الدارك ويب ومواقع اللصق: القوائم، التفاصيل.",
      parameters: {
        type: "object",
        properties: {
          source_type: { type: "string", enum: ["darkweb", "paste", "both"], description: "نوع المصدر" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_feedback_accuracy",
      description: "مقاييس دقة النظام: ملاحظات المحللين، نسبة الدقة، الإيجابيات الكاذبة.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_knowledge_graph",
      description: "رسم المعرفة: العقد، الروابط، شبكة العلاقات بين التهديدات.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_osint_info",
      description: "استعلامات OSINT: البحث المفتوح المصدر، النتائج.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_reports_info",
      description: "التقارير: القائمة، المجدولة، سجل التدقيق، التوثيقات.",
      parameters: {
        type: "object",
        properties: {
          report_type: { type: "string", enum: ["all", "scheduled", "audit", "documents"], description: "نوع التقارير" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_threat_map",
      description: "خريطة التهديدات الجغرافية: التوزيع حسب المناطق والقطاعات.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_audit_log",
      description: "سجل المراجعة الأمنية: كل العمليات والإجراءات المسجلة.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "فلتر الفئة (auth, leak, export, pii, user, report, system, monitoring)" },
          limit: { type: "number", description: "عدد السجلات" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_system_health",
      description: "صحة المنصة: حالة النظام، سياسات الاحتفاظ، مفاتيح API.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "analyze_trends",
      description: "تحليل اتجاهات التسريبات: مقارنات زمنية، أنماط، توزيعات حسب القطاع والخطورة والمصدر.",
      parameters: {
        type: "object",
        properties: {
          analysis_type: {
            type: "string",
            enum: ["severity_distribution", "source_distribution", "sector_distribution", "time_trend", "pii_types", "comprehensive"],
            description: "نوع التحليل",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_platform_guide",
      description: "دليل استرشادي لأي مهمة أو مفهوم في المنصة. يشرح طريقة العمل، الإجراءات، أفضل الممارسات.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "الموضوع: severity_levels, pdpl_compliance, evidence_chain, detection_pipeline, pii_types, monitoring, reporting, user_roles, best_practices, troubleshooting, أو أي موضوع آخر",
          },
        },
        required: ["topic"],
      },
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// TOOL EXECUTION ENGINE
// ═══════════════════════════════════════════════════════════════

async function executeTool(toolName: string, params: any): Promise<any> {
  try {
    switch (toolName) {
      case "query_leaks": {
        const filters: any = {};
        if (params.severity && params.severity !== "all") filters.severity = params.severity;
        if (params.status && params.status !== "all") filters.status = params.status;
        if (params.source && params.source !== "all") filters.source = params.source;
        if (params.search) filters.search = params.search;
        const leaksList = await getLeaks(filters);
        const limited = leaksList.slice(0, params.limit || 20);
        return {
          total: leaksList.length,
          showing: limited.length,
          leaks: limited.map((l: any) => ({
            leakId: l.leakId,
            title: l.titleAr || l.title,
            source: l.source,
            severity: l.severity,
            sector: l.sectorAr || l.sector,
            recordCount: l.recordCount,
            status: l.status,
            piiTypes: l.piiTypes,
            detectedAt: l.detectedAt,
            aiSummary: l.aiSummaryAr || l.aiSummary,
          })),
        };
      }

      case "get_leak_details": {
        const leak = await getLeakById(params.leak_id);
        if (!leak) return { error: `لم يتم العثور على تسريب بمعرّف ${params.leak_id}` };
        const evidence = await getEvidenceChain(params.leak_id);
        return {
          leak: {
            leakId: leak.leakId,
            title: leak.titleAr || leak.title,
            description: leak.descriptionAr || leak.description,
            source: leak.source,
            severity: leak.severity,
            sector: leak.sectorAr || leak.sector,
            recordCount: leak.recordCount,
            status: leak.status,
            piiTypes: leak.piiTypes,
            detectedAt: leak.detectedAt,
            aiSeverity: leak.aiSeverity,
            aiSummary: leak.aiSummaryAr || leak.aiSummary,
            aiRecommendations: leak.aiRecommendationsAr || leak.aiRecommendations,
          },
          evidenceCount: evidence.length,
          evidence: evidence.slice(0, 10),
        };
      }

      case "get_dashboard_stats": {
        const stats = await getDashboardStats();
        const allLeaks = await getLeaks();
        const bySeverity: Record<string, number> = {};
        const bySource: Record<string, number> = {};
        const bySector: Record<string, number> = {};
        for (const l of allLeaks) {
          bySeverity[l.severity] = (bySeverity[l.severity] || 0) + 1;
          bySource[l.source] = (bySource[l.source] || 0) + 1;
          const sec = l.sectorAr || l.sector;
          bySector[sec] = (bySector[sec] || 0) + 1;
        }
        return {
          ...stats,
          totalLeaksInDB: allLeaks.length,
          bySeverity,
          bySource,
          bySector,
          latestLeaks: allLeaks.slice(0, 5).map((l: any) => ({
            leakId: l.leakId,
            title: l.titleAr || l.title,
            severity: l.severity,
            detectedAt: l.detectedAt,
          })),
        };
      }

      case "get_channels_info": {
        const ch = await getChannels(params.platform);
        return {
          total: ch.length,
          channels: ch.map((c: any) => ({
            name: c.name,
            nameAr: c.nameAr,
            platform: c.platform,
            status: c.status,
            priority: c.priority,
            leaksFound: c.leaksFound,
            lastActivity: c.lastActivity,
          })),
        };
      }

      case "get_monitoring_status": {
        const jobs = await getMonitoringJobs();
        return {
          total: jobs.length,
          jobs: jobs.map((j: any) => ({
            jobId: j.jobId,
            name: j.nameAr || j.name,
            type: j.type,
            status: j.status,
            schedule: j.schedule,
            lastRun: j.lastRun,
            nextRun: j.nextRun,
            leaksFound: j.leaksFound,
          })),
        };
      }

      case "get_alert_info": {
        const result: any = {};
        if (!params.info_type || params.info_type === "all" || params.info_type === "history") {
          const history = await getAlertHistory(50);
          result.history = { total: history.length, alerts: history.slice(0, 20) };
        }
        if (!params.info_type || params.info_type === "all" || params.info_type === "rules") {
          const rules = await getAlertRules();
          result.rules = rules;
        }
        if (!params.info_type || params.info_type === "all" || params.info_type === "contacts") {
          const contacts = await getAlertContacts();
          result.contacts = contacts;
        }
        return result;
      }

      case "get_sellers_info": {
        if (params.seller_id) {
          const seller = await getSellerById(params.seller_id);
          return seller || { error: `لم يتم العثور على البائع ${params.seller_id}` };
        }
        const filters: any = {};
        if (params.risk_level && params.risk_level !== "all") filters.riskLevel = params.risk_level;
        const sellers = await getSellerProfiles(filters);
        return {
          total: sellers.length,
          sellers: sellers.map((s: any) => ({
            sellerId: s.sellerId,
            alias: s.aliasAr || s.alias,
            riskLevel: s.riskLevel,
            platforms: s.platforms,
            totalListings: s.totalListings,
            totalRecords: s.totalRecords,
            firstSeen: s.firstSeen,
            lastSeen: s.lastSeen,
          })),
        };
      }

      case "get_evidence_info": {
        const stats = await getEvidenceStats();
        const chain = await getEvidenceChain(params.leak_id);
        return {
          stats,
          total: chain.length,
          evidence: chain.slice(0, 20).map((e: any) => ({
            evidenceId: e.evidenceId,
            leakId: e.leakId,
            type: e.type,
            description: e.descriptionAr || e.description,
            hash: e.hash,
            capturedAt: e.capturedAt,
          })),
        };
      }

      case "get_threat_rules_info": {
        const rules = await getThreatRules();
        return {
          total: rules.length,
          rules: rules.map((r: any) => ({
            ruleId: r.ruleId,
            name: r.nameAr || r.name,
            category: r.category,
            severity: r.severity,
            isEnabled: r.isEnabled,
            matchCount: r.matchCount,
            lastTriggered: r.lastTriggered,
          })),
        };
      }

      case "get_darkweb_pastes": {
        const result: any = {};
        if (!params.source_type || params.source_type === "both" || params.source_type === "darkweb") {
          const dw = await getDarkWebListings();
          result.darkweb = { total: dw.length, listings: dw.slice(0, 15) };
        }
        if (!params.source_type || params.source_type === "both" || params.source_type === "paste") {
          const pastes = await getPasteEntries();
          result.pastes = { total: pastes.length, entries: pastes.slice(0, 15) };
        }
        return result;
      }

      case "get_feedback_accuracy": {
        const stats = await getFeedbackStats();
        const entries = await getFeedbackEntries();
        return {
          stats,
          recentFeedback: entries.slice(0, 20),
        };
      }

      case "get_knowledge_graph": {
        const data = await getKnowledgeGraphData();
        return data;
      }

      case "get_osint_info": {
        const queries = await getOsintQueries();
        return {
          total: queries.length,
          queries: queries.slice(0, 20),
        };
      }

      case "get_reports_info": {
        const result: any = {};
        if (!params.report_type || params.report_type === "all") {
          result.reports = await getReports();
          result.scheduled = await getScheduledReports();
          result.audit = (await getReportAuditEntries(20));
          result.documents = (await getAllIncidentDocuments()).slice(0, 20);
        } else if (params.report_type === "scheduled") {
          result.scheduled = await getScheduledReports();
        } else if (params.report_type === "audit") {
          result.audit = await getReportAuditEntries(50);
        } else if (params.report_type === "documents") {
          result.documents = await getAllIncidentDocuments();
        }
        return result;
      }

      case "get_threat_map": {
        return await getThreatMapData();
      }

      case "get_audit_log": {
        const logs = await getAuditLogs({
          category: params.category,
          limit: params.limit || 50,
        });
        return {
          total: logs.length,
          logs: logs.slice(0, 30).map((l: any) => ({
            action: l.action,
            category: l.category,
            userName: l.userName,
            details: l.details?.substring(0, 200),
            createdAt: l.createdAt,
          })),
        };
      }

      case "get_system_health": {
        const retention = await getRetentionPolicies();
        const stats = await getDashboardStats();
        return {
          status: "operational",
          database: stats ? "connected" : "disconnected",
          retentionPolicies: retention,
          stats,
        };
      }

      case "analyze_trends": {
        const allLeaks = await getLeaks();
        const result: any = { totalLeaks: allLeaks.length };

        if (params.analysis_type === "severity_distribution" || params.analysis_type === "comprehensive") {
          const dist: Record<string, number> = {};
          allLeaks.forEach((l: any) => { dist[l.severity] = (dist[l.severity] || 0) + 1; });
          result.severityDistribution = dist;
        }
        if (params.analysis_type === "source_distribution" || params.analysis_type === "comprehensive") {
          const dist: Record<string, number> = {};
          allLeaks.forEach((l: any) => { dist[l.source] = (dist[l.source] || 0) + 1; });
          result.sourceDistribution = dist;
        }
        if (params.analysis_type === "sector_distribution" || params.analysis_type === "comprehensive") {
          const dist: Record<string, number> = {};
          allLeaks.forEach((l: any) => {
            const sec = l.sectorAr || l.sector;
            dist[sec] = (dist[sec] || 0) + 1;
          });
          result.sectorDistribution = dist;
        }
        if (params.analysis_type === "pii_types" || params.analysis_type === "comprehensive") {
          const dist: Record<string, number> = {};
          allLeaks.forEach((l: any) => {
            if (Array.isArray(l.piiTypes)) {
              l.piiTypes.forEach((p: string) => { dist[p] = (dist[p] || 0) + 1; });
            }
          });
          result.piiTypeDistribution = dist;
        }
        if (params.analysis_type === "time_trend" || params.analysis_type === "comprehensive") {
          const byMonth: Record<string, number> = {};
          allLeaks.forEach((l: any) => {
            if (l.detectedAt) {
              const d = new Date(l.detectedAt);
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              byMonth[key] = (byMonth[key] || 0) + 1;
            }
          });
          result.monthlyTrend = byMonth;
        }
        if (params.analysis_type === "comprehensive") {
          const totalRecords = allLeaks.reduce((s: number, l: any) => s + (l.recordCount || 0), 0);
          result.totalRecordsExposed = totalRecords;
          result.averageRecordsPerLeak = allLeaks.length > 0 ? Math.round(totalRecords / allLeaks.length) : 0;
        }
        return result;
      }

      case "get_platform_guide": {
        return getPlatformGuide(params.topic);
      }

      default:
        return { error: `أداة غير معروفة: ${toolName}` };
    }
  } catch (err: any) {
    console.error(`[RasidAI] Tool execution error (${toolName}):`, err);
    return { error: `خطأ في تنفيذ الأداة ${toolName}: ${err.message}` };
  }
}

// ═══════════════════════════════════════════════════════════════
// PLATFORM KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════

function getPlatformGuide(topic: string): any {
  const guides: Record<string, any> = {
    severity_levels: {
      title: "مستويات الخطورة",
      content: `
مستويات الخطورة في منصة راصد:

| المستوى | الوصف | المعايير |
|---------|-------|---------|
| critical | حرج | بيانات حساسة جداً (هوية، مالية) + أكثر من 10,000 سجل |
| high | عالي | بيانات شخصية حساسة + أكثر من 1,000 سجل |
| medium | متوسط | بيانات شخصية عامة أو أقل من 1,000 سجل |
| low | منخفض | تسريب محدود أو بيانات غير حساسة |

الإجراءات المطلوبة:
- critical: إبلاغ فوري + تحقيق عاجل + تقرير خلال 24 ساعة
- high: تحقيق خلال 48 ساعة + تقرير أسبوعي
- medium: مراجعة خلال أسبوع
- low: أرشفة ومتابعة`,
    },
    pdpl_compliance: {
      title: "نظام حماية البيانات الشخصية PDPL",
      content: `
نظام حماية البيانات الشخصية (PDPL) — المواد ذات الصلة:

المادة 10: حماية البيانات الشخصية — يجب اتخاذ التدابير اللازمة لحماية البيانات
المادة 14: الإفصاح عن التسريبات — يجب إبلاغ الجهة المختصة خلال 72 ساعة
المادة 19: حقوق أصحاب البيانات — حق الوصول والتصحيح والحذف
المادة 24: العقوبات — غرامات تصل إلى 5 ملايين ريال
المادة 32: الالتزامات الأمنية — تطبيق معايير أمنية مناسبة`,
    },
    evidence_chain: {
      title: "سلسلة حفظ الأدلة",
      content: `
سلسلة حفظ الأدلة الرقمية في راصد:
1. الالتقاط: تسجيل الدليل فور اكتشافه (screenshot, web archive, file)
2. التجزئة: حساب SHA-256 hash للملف
3. التوقيع: HMAC-SHA256 لضمان السلامة
4. التخزين: حفظ آمن مع metadata
5. التحقق: فحص دوري لسلامة الأدلة
6. التوثيق: ربط الدليل بالتسريب والمحلل`,
    },
    pii_types: {
      title: "أنواع البيانات الشخصية المدعومة",
      content: `
أنواع PII المدعومة في راصد:
- national_id: رقم الهوية الوطنية (10 أرقام تبدأ بـ 1 أو 2)
- iqama: رقم الإقامة (10 أرقام تبدأ بـ 2)
- phone: رقم هاتف سعودي (+966 أو 05)
- email: بريد إلكتروني
- iban: رقم آيبان سعودي (SA + 22 رقم)
- credit_card: بطاقة ائتمان (Luhn validation)
- passport: رقم جواز سفر
- address: عنوان وطني
- medical_record: سجل طبي
- salary: معلومات راتب
- gosi: رقم تأمينات اجتماعية
- license_plate: لوحة مركبة`,
    },
    monitoring: {
      title: "نظام المراقبة",
      content: `
مصادر المراقبة في راصد:
1. تليجرام: مراقبة قنوات ومجموعات
2. الدارك ويب: بحث في منتديات ومواقع
3. مواقع اللصق: Pastebin وبدائلها
4. وسائل التواصل: HIBP + Reddit + Twitter/X

أنواع الفحص:
- فحص مجدول: يعمل تلقائياً حسب الجدول
- فحص يدوي: يُشغّل بواسطة المحلل
- فحص مباشر: رصد في الوقت الحقيقي`,
    },
    reporting: {
      title: "نظام التقارير",
      content: `
أنواع التقارير في راصد:
1. تقرير تنفيذي PDF: ملخص شامل للإدارة العليا
2. تقرير NDMO Word: تقرير رسمي للمكتب الوطني
3. تقرير Excel شهري: بيانات مفصلة للتحليل
4. تقرير أدلة: توثيق أدلة تسريب محدد
5. تقرير مخصص: حسب معايير محددة
6. تقارير مجدولة: تلقائية حسب الجدول`,
    },
    user_roles: {
      title: "أدوار المستخدمين",
      content: `
أدوار المستخدمين في راصد:
- executive (تنفيذي): وصول كامل + تقارير + قرارات
- manager (مدير): إدارة التسريبات + التقارير + المستخدمين
- analyst (محلل): تحليل + تصنيف + ملاحظات
- viewer (مشاهد): عرض لوحة المعلومات فقط`,
    },
    best_practices: {
      title: "أفضل الممارسات",
      content: `
أفضل ممارسات إدارة التسريبات:
1. مراجعة التسريبات الحرجة فوراً
2. توثيق الأدلة قبل أي إجراء
3. تحديث الحالة بانتظام
4. إبلاغ الجهات المعنية خلال 72 ساعة
5. مراجعة دقة النظام أسبوعياً
6. تحديث قواعد الكشف شهرياً
7. نسخ احتياطي يومي`,
    },
    troubleshooting: {
      title: "حل المشاكل",
      content: `
حل المشاكل الشائعة:
- فحص فاشل: تحقق من اتصال الإنترنت وصلاحيات API
- false positives كثيرة: راجع قواعد الكشف وعدّل الحدود
- بطء المنصة: تحقق من حجم قاعدة البيانات وسياسات الاحتفاظ
- قناة لا تعمل: تحقق من حالة القناة وصلاحيات الوصول
- أدلة تالفة: أعد فحص سلامة الأدلة`,
    },
  };

  const guide = guides[topic.toLowerCase()];
  if (guide) return guide;

  // Fuzzy match
  const topicLower = topic.toLowerCase();
  for (const [key, value] of Object.entries(guides)) {
    if (topicLower.includes(key) || key.includes(topicLower)) return value;
  }

  return {
    title: "دليل عام",
    content: `لم أجد دليلاً محدداً للموضوع "${topic}". المواضيع المتاحة: ${Object.keys(guides).join(", ")}. يمكنني مساعدتك في أي سؤال آخر عن المنصة.`,
    availableTopics: Object.keys(guides),
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN CHAT FUNCTION — Tool Use Loop
// ═══════════════════════════════════════════════════════════════

export async function rasidAIChat(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userName: string,
  userId: number,
): Promise<{ response: string; toolsUsed: string[] }> {
  const stats = await getDashboardStats();
  const systemPrompt = buildSystemPrompt(userName, stats);

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-18).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  const toolsUsed: string[] = [];
  let maxIterations = 5; // Prevent infinite loops

  try {
    let response = await invokeLLM({
      messages,
      tools: RASID_TOOLS,
      tool_choice: "auto",
    });

    // Tool use loop — process tool calls iteratively
    while (maxIterations > 0) {
      const choice = response.choices?.[0];
      if (!choice) break;

      // Check if the model wants to call tools
      // Some APIs return finish_reason="tool_calls", others return "stop" but include tool_calls
      const hasToolCalls = choice.message?.tool_calls && choice.message.tool_calls.length > 0;
      
      if (hasToolCalls) {
        const toolCalls = choice.message!.tool_calls!;
        
        // Normalize tool calls - ensure each has an id
        const normalizedToolCalls = toolCalls.map((tc: any, idx: number) => ({
          ...tc,
          id: tc.id || `call_${Date.now()}_${idx}`,
        }));

        // Add assistant message with normalized tool calls
        // The LLM may return content as null/undefined when using tool_calls
        // We must ensure content is a valid string for the normalizer
        messages.push({
          role: "assistant" as const,
          content: choice.message?.content || "",
          tool_calls: normalizedToolCalls,
        });

        // Execute each tool call
        for (const toolCall of normalizedToolCalls) {
          const fnName = toolCall.function?.name;
          let fnArgs: any = {};
          try {
            fnArgs = JSON.parse(toolCall.function?.arguments || "{}");
          } catch {
            fnArgs = {};
          }

          toolsUsed.push(fnName);
          let result: any;
          try {
            result = await executeTool(fnName, fnArgs);
          } catch (toolErr: any) {
            console.error(`[RasidAI] Tool ${fnName} error:`, toolErr.message);
            result = { error: `Tool execution failed: ${toolErr.message}` };
          }

          // Add tool result to messages
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: typeof result === 'string' ? result.substring(0, 8000) : JSON.stringify(result, null, 0).substring(0, 8000),
          });
        }

        // Get next response
        response = await invokeLLM({
          messages,
          tools: RASID_TOOLS,
          tool_choice: "auto",
        });

        maxIterations--;
      } else {
        // Model returned a text response — done
        break;
      }
    }

    const rawContent = response.choices?.[0]?.message?.content;
    const content: string = typeof rawContent === "string" ? rawContent : "عذراً، لم أتمكن من معالجة طلبك. حاول مرة أخرى.";

    // Log the interaction
    await logAudit(
      userId,
      "smart_rasid.chat",
      `Query: ${message.substring(0, 100)} | Tools: ${toolsUsed.join(", ") || "none"} | Response length: ${content.length}`,
      "system",
      userName,
    );

    return { response: content, toolsUsed };
  } catch (err: any) {
    console.error("[RasidAI] Chat error:", err);
    await logAudit(userId, "smart_rasid.error", `Error: ${err.message}`, "system", userName);
    return {
      response: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
      toolsUsed,
    };
  }
}
