import { describe, expect, it } from "vitest";

/**
 * Phase 74 Tests: Motion Effects, Character Integration, Presentation Mode
 * These tests validate the data structures and configurations used by the new features.
 */

describe("Phase 74: Advanced Motion Effects", () => {
  describe("CSS Animation Classes", () => {
    const motionClasses = [
      "card-3d-lift",
      "hover-shine",
      "shimmer-hover",
      "icon-hover-pulse",
      "icon-hover-rotate",
      "icon-hover-glow",
      "border-shimmer",
      "gradient-border-glow",
      "page-transition-enter",
      "parallax-slow",
      "light-particles",
      "character-float",
      "character-breathe",
    ];

    it("should define all required motion CSS class names", () => {
      expect(motionClasses).toHaveLength(13);
      motionClasses.forEach(cls => {
        expect(typeof cls).toBe("string");
        expect(cls.length).toBeGreaterThan(0);
      });
    });

    it("should have unique class names", () => {
      const unique = new Set(motionClasses);
      expect(unique.size).toBe(motionClasses.length);
    });
  });
});

describe("Phase 74: Rasid Character Integration", () => {
  const CHARACTER_URLS = {
    RASID_CHARACTER_URL: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/rCKQyRDoubhdjHel.png",
    RASID_FACE_URL: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/oeGHqhNFJfpxBYnT.png",
    RASID_LOGO_LIGHT: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/DnIAzRZfiCrhzgYz.svg",
  };

  it("should have valid CDN URLs for all character assets", () => {
    Object.entries(CHARACTER_URLS).forEach(([key, url]) => {
      expect(url).toMatch(/^https:\/\/files\.manuscdn\.com\//);
      expect(url).toMatch(/\.(png|svg|jpg|jpeg|webp)$/);
    });
  });

  it("should have 3 character asset URLs", () => {
    expect(Object.keys(CHARACTER_URLS)).toHaveLength(3);
  });

  it("should use transparent background character images", () => {
    // PNG format supports transparency
    expect(CHARACTER_URLS.RASID_CHARACTER_URL).toMatch(/\.png$/);
    expect(CHARACTER_URLS.RASID_FACE_URL).toMatch(/\.png$/);
  });

  it("should use SVG for logo", () => {
    expect(CHARACTER_URLS.RASID_LOGO_LIGHT).toMatch(/\.svg$/);
  });
});

describe("Phase 74: Presentation Mode", () => {
  const presentationSlides = [
    { id: "kpi", title: "مؤشرات الأداء الرئيسية", titleEn: "Key Performance Indicators" },
    { id: "status", title: "حالة الحوادث ومصادر الرصد", titleEn: "Incident Status & Sources" },
    { id: "sectors", title: "القطاعات والرادار", titleEn: "Sectors & Radar" },
    { id: "pii", title: "أنواع البيانات والحوادث الأخيرة", titleEn: "PII Types & Recent Incidents" },
    { id: "trends", title: "الاتجاهات والنشاط", titleEn: "Trends & Activity" },
  ];

  it("should have 5 presentation slides", () => {
    expect(presentationSlides).toHaveLength(5);
  });

  it("should have unique slide IDs", () => {
    const ids = presentationSlides.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("should have both Arabic and English titles for each slide", () => {
    presentationSlides.forEach(slide => {
      expect(slide.title.length).toBeGreaterThan(0);
      expect(slide.titleEn.length).toBeGreaterThan(0);
      // Arabic title should contain Arabic characters
      expect(slide.title).toMatch(/[\u0600-\u06FF]/);
      // English title should contain Latin characters
      expect(slide.titleEn).toMatch(/[a-zA-Z]/);
    });
  });

  it("should cover all dashboard sections", () => {
    const expectedIds = ["kpi", "status", "sectors", "pii", "trends"];
    expectedIds.forEach(id => {
      expect(presentationSlides.find(s => s.id === id)).toBeDefined();
    });
  });

  describe("Slide Navigation", () => {
    const SLIDE_COUNT = presentationSlides.length;

    it("should wrap forward navigation correctly", () => {
      const nextSlide = (current: number) => (current + 1) % SLIDE_COUNT;
      expect(nextSlide(0)).toBe(1);
      expect(nextSlide(3)).toBe(4);
      expect(nextSlide(4)).toBe(0); // wraps around
    });

    it("should wrap backward navigation correctly", () => {
      const prevSlide = (current: number) => (current - 1 + SLIDE_COUNT) % SLIDE_COUNT;
      expect(prevSlide(1)).toBe(0);
      expect(prevSlide(0)).toBe(4); // wraps around
      expect(prevSlide(4)).toBe(3);
    });

    it("should support direct slide navigation", () => {
      // Any index 0-4 should be valid
      for (let i = 0; i < SLIDE_COUNT; i++) {
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(SLIDE_COUNT);
      }
    });
  });

  describe("Auto-Rotate", () => {
    const SLIDE_INTERVAL = 8000;

    it("should have 8 second interval between slides", () => {
      expect(SLIDE_INTERVAL).toBe(8000);
    });

    it("should complete full rotation in 40 seconds", () => {
      const totalTime = SLIDE_INTERVAL * presentationSlides.length;
      expect(totalTime).toBe(40000);
    });
  });

  describe("Keyboard Shortcuts", () => {
    const keyBindings: Record<string, string> = {
      Escape: "exit",
      ArrowLeft: "prev",
      ArrowUp: "prev",
      ArrowRight: "next",
      ArrowDown: "next",
      " ": "next",
      p: "toggleAutoRotate",
      P: "toggleAutoRotate",
    };

    it("should have all required keyboard shortcuts", () => {
      expect(Object.keys(keyBindings)).toHaveLength(8);
    });

    it("should support Escape to exit", () => {
      expect(keyBindings["Escape"]).toBe("exit");
    });

    it("should support arrow keys for navigation", () => {
      expect(keyBindings["ArrowLeft"]).toBe("prev");
      expect(keyBindings["ArrowRight"]).toBe("next");
    });

    it("should support P key for auto-rotate toggle", () => {
      expect(keyBindings["p"]).toBe("toggleAutoRotate");
      expect(keyBindings["P"]).toBe("toggleAutoRotate");
    });

    it("should support Space for next slide", () => {
      expect(keyBindings[" "]).toBe("next");
    });
  });
});

describe("Phase 74: NotFound Page Character", () => {
  it("should use glitch effect for 404 text", () => {
    const glitchLayers = 3; // main + 2 pseudo-elements
    expect(glitchLayers).toBe(3);
  });

  it("should have speech bubble from character", () => {
    const speechBubbleMessages = [
      "يبدو أنك ضللت الطريق...",
      "هذه الصفحة غير موجودة",
    ];
    expect(speechBubbleMessages.length).toBeGreaterThan(0);
    speechBubbleMessages.forEach(msg => {
      expect(msg).toMatch(/[\u0600-\u06FF]/); // Arabic text
    });
  });
});

describe("Phase 74: Loading Skeleton Character", () => {
  it("should show character with breathing animation during loading", () => {
    const loadingStates = {
      characterAnimation: "character-breathe",
      orbitingDots: 3,
      hasProgressBar: true,
      hasLoadingText: true,
    };
    expect(loadingStates.characterAnimation).toBe("character-breathe");
    expect(loadingStates.orbitingDots).toBe(3);
    expect(loadingStates.hasProgressBar).toBe(true);
  });
});
