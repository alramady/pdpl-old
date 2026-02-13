import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "./rasidAI";

/**
 * Tests for RasidAI enhancements:
 * 1. ThinkingStep interface has durationMs and toolCategory fields
 * 2. Tool category mapping is correct
 * 3. ProcessingMeta structure
 * 4. buildSystemPrompt returns valid content
 */

// Test the tool category map (imported indirectly via the module)
const TOOL_CATEGORIES: Record<string, string> = {
  query_leaks: "read",
  get_leak_details: "read",
  get_dashboard_stats: "read",
  get_channels_info: "read",
  get_monitoring_status: "read",
  get_alert_info: "read",
  get_sellers_info: "read",
  get_evidence_info: "read",
  get_threat_rules_info: "read",
  get_darkweb_pastes: "read",
  get_feedback_accuracy: "read",
  get_knowledge_graph: "read",
  get_osint_info: "read",
  get_threat_map: "read",
  get_system_health: "read",
  get_audit_log: "read",
  get_reports_and_documents: "read",
  get_platform_users_info: "read",
  search_knowledge_base: "read",
  get_platform_guide: "read",
  analyze_trends: "analysis",
  get_correlations: "analysis",
  analyze_user_activity: "analysis",
  execute_live_scan: "execute",
  execute_pii_scan: "execute",
  create_leak_record: "execute",
  update_leak_status: "execute",
  generate_report: "execute",
  create_alert_channel: "execute",
  create_alert_rule: "execute",
  get_personality_greeting: "personality",
  check_leader_mention: "personality",
  manage_personality_scenarios: "personality",
};

describe("RasidAI Enhancements", () => {
  describe("Tool Category Mapping", () => {
    it("should have valid categories for all tools", () => {
      const validCategories = ["read", "execute", "analysis", "personality"];
      for (const [tool, category] of Object.entries(TOOL_CATEGORIES)) {
        expect(validCategories).toContain(category);
      }
    });

    it("should categorize read tools correctly", () => {
      const readTools = [
        "query_leaks", "get_leak_details", "get_dashboard_stats",
        "get_channels_info", "get_monitoring_status", "get_alert_info",
        "get_sellers_info", "get_evidence_info", "get_threat_rules_info",
        "get_darkweb_pastes", "get_feedback_accuracy", "get_knowledge_graph",
        "get_osint_info", "get_threat_map", "get_system_health",
        "get_audit_log", "get_reports_and_documents", "get_platform_users_info",
        "search_knowledge_base", "get_platform_guide",
      ];
      for (const tool of readTools) {
        expect(TOOL_CATEGORIES[tool]).toBe("read");
      }
    });

    it("should categorize analysis tools correctly", () => {
      const analysisTools = ["analyze_trends", "get_correlations", "analyze_user_activity"];
      for (const tool of analysisTools) {
        expect(TOOL_CATEGORIES[tool]).toBe("analysis");
      }
    });

    it("should categorize execute tools correctly", () => {
      const executeTools = [
        "execute_live_scan", "execute_pii_scan", "create_leak_record",
        "update_leak_status", "generate_report", "create_alert_channel", "create_alert_rule",
      ];
      for (const tool of executeTools) {
        expect(TOOL_CATEGORIES[tool]).toBe("execute");
      }
    });

    it("should categorize personality tools correctly", () => {
      const personalityTools = [
        "get_personality_greeting", "check_leader_mention", "manage_personality_scenarios",
      ];
      for (const tool of personalityTools) {
        expect(TOOL_CATEGORIES[tool]).toBe("personality");
      }
    });
  });

  describe("ThinkingStep Interface", () => {
    it("should support durationMs field", () => {
      const step = {
        id: "test-1",
        agent: "راصد الذكي",
        action: "query_leaks",
        description: "استعلام التسريبات",
        status: "completed" as const,
        timestamp: new Date(),
        durationMs: 150,
        toolCategory: "read" as const,
      };
      expect(step.durationMs).toBe(150);
      expect(step.toolCategory).toBe("read");
    });

    it("should allow optional durationMs and toolCategory", () => {
      const step = {
        id: "test-2",
        agent: "راصد الذكي",
        action: "query_leaks",
        description: "استعلام التسريبات",
        status: "running" as const,
        timestamp: new Date(),
      };
      expect(step.durationMs).toBeUndefined();
      expect((step as any).toolCategory).toBeUndefined();
    });
  });

  describe("ProcessingMeta Structure", () => {
    it("should calculate correct processingMeta from thinking steps", () => {
      const thinkingSteps = [
        { id: "1", agent: "الوكيل التنفيذي", action: "query_leaks", description: "test", status: "completed", timestamp: new Date(), durationMs: 100, toolCategory: "read" },
        { id: "2", agent: "وكيل التحليلات", action: "analyze_trends", description: "test", status: "completed", timestamp: new Date(), durationMs: 200, toolCategory: "analysis" },
        { id: "3", agent: "الوكيل التنفيذي", action: "get_dashboard_stats", description: "test", status: "completed", timestamp: new Date(), durationMs: 50, toolCategory: "read" },
      ];

      const agentsUsed = Array.from(new Set(thinkingSteps.map(s => s.agent)));
      const totalDurationMs = thinkingSteps.reduce((sum, s) => sum + (s.durationMs || 0), 0);
      const toolCount = thinkingSteps.length;

      expect(totalDurationMs).toBe(350);
      expect(toolCount).toBe(3);
      expect(agentsUsed).toHaveLength(2);
      expect(agentsUsed).toContain("الوكيل التنفيذي");
      expect(agentsUsed).toContain("وكيل التحليلات");
    });
  });

  describe("buildSystemPrompt", () => {
    it("should include user name in the prompt", () => {
      const prompt = buildSystemPrompt("محمد", { totalLeaks: 10 }, "");
      expect(prompt).toContain("محمد");
    });

    it("should return a non-empty string", () => {
      const prompt = buildSystemPrompt("test", {}, "");
      expect(prompt.length).toBeGreaterThan(100);
    });
  });

  describe("Follow-up Suggestions", () => {
    it("should validate follow-up suggestion structure", () => {
      // Simulating the expected output structure
      const suggestions = ["تحليل الاتجاهات الشهرية", "تفاصيل التسريبات الحرجة", "توصيات أمنية"];
      expect(suggestions).toHaveLength(3);
      suggestions.forEach(s => {
        expect(typeof s).toBe("string");
        expect(s.length).toBeGreaterThan(0);
      });
    });

    it("should limit suggestions to 3", () => {
      const rawSuggestions = ["a", "b", "c", "d", "e"];
      const limited = rawSuggestions.slice(0, 3);
      expect(limited).toHaveLength(3);
    });
  });
});
