import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock the db module
vi.mock("./db", () => ({
  getLeaks: vi.fn().mockResolvedValue([
    { leakId: "LK-2026-0001", title: "Test Leak", titleAr: "تسريب تجريبي", severity: "critical", sectorAr: "حكومي", recordCount: 1000, status: "active", source: "telegram" },
    { leakId: "LK-2026-0002", title: "Another Leak", titleAr: "تسريب آخر", severity: "high", sectorAr: "صحي", recordCount: 500, status: "investigating", source: "darkweb" },
  ]),
  getLeakById: vi.fn().mockResolvedValue({
    leakId: "LK-2026-0001", title: "Test Leak", titleAr: "تسريب تجريبي", severity: "critical",
    sectorAr: "حكومي", recordCount: 1000, status: "active", source: "telegram",
    description: "Test description", descriptionAr: "وصف تجريبي",
  }),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalLeaks: 256, criticalAlerts: 56, totalRecords: 229200000, activeMonitors: 27,
  }),
  getChannels: vi.fn().mockResolvedValue([
    { name: "Telegram Bot", type: "telegram", status: "active" },
  ]),
  getMonitoringJobs: vi.fn().mockResolvedValue([
    { jobId: "JOB-TG-001", name: "Telegram Monitor", nameAr: "رصد تليجرام", jobStatus: "running" },
  ]),
  getAlertRules: vi.fn().mockResolvedValue([]),
  getAlertHistory: vi.fn().mockResolvedValue([]),
  getSellerProfiles: vi.fn().mockResolvedValue([
    { sellerId: "SLR-001", alias: "DarkTrader", aliasAr: "تاجر الظلام", riskLevel: "high" },
  ]),
  getEvidenceChain: vi.fn().mockResolvedValue([]),
  getEvidenceStats: vi.fn().mockResolvedValue({ total: 15, verified: 10 }),
  getThreatRules: vi.fn().mockResolvedValue([]),
  getDarkWebListings: vi.fn().mockResolvedValue([]),
  getPasteEntries: vi.fn().mockResolvedValue([]),
  getFeedbackEntries: vi.fn().mockResolvedValue([]),
  getFeedbackStats: vi.fn().mockResolvedValue({ totalFeedback: 100, averageAccuracy: 85 }),
  getKnowledgeGraphData: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
  getOsintQueries: vi.fn().mockResolvedValue([]),
  getReports: vi.fn().mockResolvedValue([]),
  getThreatMapData: vi.fn().mockResolvedValue([]),
  getAuditLogs: vi.fn().mockResolvedValue([]),
  logAudit: vi.fn().mockResolvedValue(undefined),
  getScheduledReports: vi.fn().mockResolvedValue([]),
  getRetentionPolicies: vi.fn().mockResolvedValue([]),
  getAllIncidentDocuments: vi.fn().mockResolvedValue([]),
}));

import { invokeLLM } from "./_core/llm";
import { rasidAIChat, buildSystemPrompt, RASID_TOOLS } from "./rasidAI";
import { getDashboardStats } from "./db";

const mockedInvokeLLM = vi.mocked(invokeLLM);

describe("rasidAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RASID_TOOLS", () => {
    it("should have 19 tool definitions", () => {
      expect(RASID_TOOLS).toBeDefined();
      expect(RASID_TOOLS.length).toBe(19);
    });

    it("each tool should have required properties", () => {
      for (const tool of RASID_TOOLS) {
        expect(tool.type).toBe("function");
        expect(tool.function).toBeDefined();
        expect(tool.function.name).toBeTruthy();
        expect(tool.function.description).toBeTruthy();
        expect(tool.function.parameters).toBeDefined();
      }
    });

    it("should include key tools", () => {
      const toolNames = RASID_TOOLS.map((t: any) => t.function.name);
      expect(toolNames).toContain("query_leaks");
      expect(toolNames).toContain("get_dashboard_stats");
      expect(toolNames).toContain("get_leak_details");
      expect(toolNames).toContain("get_sellers_info");
      expect(toolNames).toContain("get_evidence_info");
      expect(toolNames).toContain("analyze_trends");
      expect(toolNames).toContain("get_platform_guide");
    });
  });

  describe("buildSystemPrompt", () => {
    it("should build a comprehensive system prompt", () => {
      const stats = { totalLeaks: 256, criticalAlerts: 56, totalRecords: 229200000, activeMonitors: 27 };
      const prompt = buildSystemPrompt("TestUser", stats);
      expect(prompt).toContain("راصد الذكي");
      expect(prompt).toContain("NDMO");
      expect(prompt).toContain("TestUser");
      expect(prompt).toContain("256");
      expect(prompt).toContain("56");
    });

    it("should include platform statistics", () => {
      const stats = { totalLeaks: 256, criticalAlerts: 56, totalRecords: 229200000, activeMonitors: 27 };
      const prompt = buildSystemPrompt("Admin", stats);
      expect(prompt).toContain("إجمالي التسريبات");
      expect(prompt).toContain("التنبيهات الحرجة");
      expect(prompt).toContain("السجلات المكشوفة");
    });
  });

  describe("rasidAIChat", () => {
    it("should return a response for a simple message", async () => {
      mockedInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "مرحباً! أنا راصد الذكي. كيف يمكنني مساعدتك؟",
              role: "assistant",
            },
            index: 0,
            finish_reason: "stop",
          },
        ],
      } as any);

      const result = await rasidAIChat("مرحباً", [], "TestUser", 1);
      expect(result.response).toContain("مرحباً");
      expect(result.toolsUsed).toBeDefined();
      expect(Array.isArray(result.toolsUsed)).toBe(true);
    });

    it("should handle tool calls from LLM", async () => {
      // First call returns a tool call
      mockedInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null,
              role: "assistant",
              tool_calls: [
                {
                  id: "call_1",
                  type: "function",
                  function: {
                    name: "get_dashboard_stats",
                    arguments: "{}",
                  },
                },
              ],
            },
            index: 0,
            finish_reason: "tool_calls",
          },
        ],
      } as any);

      // Second call returns final response after tool results
      mockedInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "إجمالي التسريبات: 256 تسريب. التنبيهات الحرجة: 56.",
              role: "assistant",
            },
            index: 0,
            finish_reason: "stop",
          },
        ],
      } as any);

      const result = await rasidAIChat("ملخص لوحة المعلومات", [], "TestUser", 1);
      expect(result.response).toContain("256");
      expect(result.toolsUsed).toContain("get_dashboard_stats");
    });

    it("should handle LLM errors gracefully", async () => {
      mockedInvokeLLM.mockRejectedValueOnce(new Error("LLM service unavailable"));

      const result = await rasidAIChat("اختبار", [], "TestUser", 1);
      expect(result.response).toContain("عذراً");
    });

    it("should pass chat history to LLM", async () => {
      mockedInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "نعم، يمكنني مساعدتك بمزيد من التفاصيل.",
              role: "assistant",
            },
            index: 0,
            finish_reason: "stop",
          },
        ],
      } as any);

      const history = [
        { role: "user" as const, content: "ما هي التسريبات الحرجة؟" },
        { role: "assistant" as const, content: "هناك 56 تنبيه حرج." },
      ];

      const result = await rasidAIChat("أعطني تفاصيل أكثر", history, "TestUser", 1);
      expect(result.response).toBeTruthy();

      // Verify history was included in the call
      const callArgs = mockedInvokeLLM.mock.calls[0][0];
      expect(callArgs.messages.length).toBeGreaterThan(2); // system + history + user
    });

    it("should handle empty LLM response", async () => {
      mockedInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null,
              role: "assistant",
            },
            index: 0,
            finish_reason: "stop",
          },
        ],
      } as any);

      const result = await rasidAIChat("اختبار", [], "TestUser", 1);
      expect(result.response).toBeTruthy(); // Should have fallback message
    });

    it("should limit tool call iterations to prevent infinite loops", async () => {
      // Simulate multiple tool calls
      for (let i = 0; i < 6; i++) {
        mockedInvokeLLM.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: null,
                role: "assistant",
                tool_calls: [
                  {
                    id: `call_${i}`,
                    type: "function",
                    function: {
                      name: "get_dashboard_stats",
                      arguments: "{}",
                    },
                  },
                ],
              },
              index: 0,
              finish_reason: "tool_calls",
            },
          ],
        } as any);
      }

      // Final response after max iterations
      mockedInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "تم الوصول للحد الأقصى من الاستعلامات.",
              role: "assistant",
            },
            index: 0,
            finish_reason: "stop",
          },
        ],
      } as any);

      const result = await rasidAIChat("تحليل شامل", [], "TestUser", 1);
      expect(result.response).toBeTruthy();
      // Should not exceed MAX_TOOL_ITERATIONS (5)
      expect(mockedInvokeLLM).toHaveBeenCalledTimes(6); // 5 tool calls + 1 final
    });
  });
});
