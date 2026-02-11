import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, AlertCircle, Sun, Moon, Shield, Lock } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const RASID_LOGO_LIGHT = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/THVppkjqyLegafUm.png";
const RASID_LOGO_DARK = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/kuCEchYUSnPsbhZS.png";
const RASID_CHARACTER = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/qTFgtbWZjShuewJe.png";

// ─── 3D Particle Canvas Background ───────────────────────────
function ParticleBackground({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particles
    const particles: Array<{
      x: number; y: number; z: number;
      vx: number; vy: number; vz: number;
      size: number; opacity: number;
      hue: number;
    }> = [];

    const PARTICLE_COUNT = 80;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 600 + 100,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        hue: 210 + Math.random() * 40,
      });
    }

    // Floating orbs (large glowing spheres)
    const orbs: Array<{
      x: number; y: number; radius: number;
      vx: number; vy: number;
      hue: number; opacity: number;
    }> = [];
    for (let i = 0; i < 5; i++) {
      orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 120 + 60,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        hue: 210 + Math.random() * 30,
        opacity: isDark ? 0.06 + Math.random() * 0.04 : 0.03 + Math.random() * 0.03,
      });
    }

    let time = 0;

    const animate = () => {
      time += 0.005;
      ctx.clearRect(0, 0, w, h);

      // Draw orbs
      for (const orb of orbs) {
        orb.x += orb.vx + Math.sin(time * 2) * 0.2;
        orb.y += orb.vy + Math.cos(time * 1.5) * 0.2;
        if (orb.x < -orb.radius) orb.x = w + orb.radius;
        if (orb.x > w + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = h + orb.radius;
        if (orb.y > h + orb.radius) orb.y = -orb.radius;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        if (isDark) {
          gradient.addColorStop(0, `hsla(${orb.hue}, 80%, 50%, ${orb.opacity * 1.5})`);
          gradient.addColorStop(0.5, `hsla(${orb.hue}, 70%, 40%, ${orb.opacity * 0.5})`);
          gradient.addColorStop(1, `hsla(${orb.hue}, 60%, 30%, 0)`);
        } else {
          gradient.addColorStop(0, `hsla(${orb.hue}, 60%, 70%, ${orb.opacity * 1.5})`);
          gradient.addColorStop(0.5, `hsla(${orb.hue}, 50%, 80%, ${orb.opacity * 0.5})`);
          gradient.addColorStop(1, `hsla(${orb.hue}, 40%, 90%, 0)`);
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw particles with 3D perspective
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        if (p.z < 100) p.z = 700;
        if (p.z > 700) p.z = 100;

        const perspective = 400 / p.z;
        const screenX = (p.x - w / 2) * perspective + w / 2;
        const screenY = (p.y - h / 2) * perspective + h / 2;
        const screenSize = p.size * perspective;
        const alpha = p.opacity * (1 - p.z / 800);

        if (isDark) {
          ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
        } else {
          ctx.fillStyle = `hsla(${p.hue}, 60%, 50%, ${alpha * 0.6})`;
        }
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(screenSize, 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.15;
            if (isDark) {
              ctx.strokeStyle = `hsla(220, 70%, 60%, ${alpha})`;
            } else {
              ctx.strokeStyle = `hsla(220, 50%, 50%, ${alpha * 0.5})`;
            }
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Hexagonal grid overlay (subtle)
      ctx.save();
      ctx.globalAlpha = isDark ? 0.03 : 0.015;
      const hexSize = 40;
      const hexH = hexSize * Math.sqrt(3);
      for (let row = -1; row < h / hexH + 1; row++) {
        for (let col = -1; col < w / (hexSize * 1.5) + 1; col++) {
          const cx = col * hexSize * 1.5 + (time * 20 % (hexSize * 1.5));
          const cy = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);
          ctx.strokeStyle = isDark ? "#60a5fa" : "#3b82f6";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const angle = (Math.PI / 3) * s - Math.PI / 6;
            const hx = cx + hexSize * 0.6 * Math.cos(angle);
            const hy = cy + hexSize * 0.6 * Math.sin(angle);
            if (s === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

// ─── Animated Logo Component ───────────────────────────
function AnimatedLogo({ src, isDark }: { src: string; isDark: boolean }) {
  return (
    <div className="relative inline-block">
      {/* Pulsing glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          animation: "logo-pulse 3s ease-in-out infinite",
          transform: "scale(1.8)",
        }}
      />
      {/* Rotating ring */}
      <div
        className="absolute inset-0"
        style={{
          border: isDark ? "2px solid rgba(59,130,246,0.15)" : "2px solid rgba(59,130,246,0.08)",
          borderTopColor: isDark ? "rgba(96,165,250,0.5)" : "rgba(59,130,246,0.3)",
          borderRadius: "50%",
          animation: "spin-slow 8s linear infinite",
          transform: "scale(1.4)",
        }}
      />
      {/* Shield icon overlay */}
      <div
        className="absolute -top-1 -right-1 z-10"
        style={{
          animation: "shield-bounce 2s ease-in-out infinite",
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #2563eb, #3b82f6)"
              : "linear-gradient(135deg, #3b82f6, #60a5fa)",
            boxShadow: isDark
              ? "0 0 12px rgba(59,130,246,0.4)"
              : "0 0 8px rgba(59,130,246,0.2)",
          }}
        >
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      {/* Logo image */}
      <img
        src={src}
        alt="منصة راصد"
        className="h-24 object-contain relative z-[1]"
        style={{
          filter: isDark
            ? "drop-shadow(0 0 20px rgba(59,130,246,0.2))"
            : "drop-shadow(0 0 15px rgba(59,130,246,0.1))",
          animation: "logo-float 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ─── Animated Character ───────────────────────────
function AnimatedCharacter({ isDark }: { isDark: boolean }) {
  return (
    <div className="relative">
      {/* Glow behind character */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)"
            : "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)",
          transform: "scale(1.3)",
          animation: "logo-pulse 4s ease-in-out infinite",
        }}
      />
      {/* Orbiting particles around character */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: isDark
              ? `hsla(${210 + i * 20}, 80%, 60%, 0.6)`
              : `hsla(${210 + i * 20}, 60%, 50%, 0.4)`,
            boxShadow: isDark
              ? `0 0 8px hsla(${210 + i * 20}, 80%, 60%, 0.4)`
              : `0 0 6px hsla(${210 + i * 20}, 60%, 50%, 0.2)`,
            animation: `orbit-particle ${6 + i * 2}s linear infinite`,
            animationDelay: `${i * -2}s`,
            top: "50%",
            left: "50%",
          }}
        />
      ))}
      <img
        src={RASID_CHARACTER}
        alt="راصد"
        className="w-80 h-80 object-contain relative z-[1]"
        style={{
          filter: isDark
            ? "brightness(0.95) drop-shadow(0 0 40px rgba(59, 130, 246, 0.15))"
            : "drop-shadow(0 10px 40px rgba(0, 0, 0, 0.1))",
          animation: "character-float 6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ─── CSS Animations ───────────────────────────
const animationStyles = `
  @keyframes logo-pulse {
    0%, 100% { opacity: 0.6; transform: scale(1.8); }
    50% { opacity: 1; transform: scale(2); }
  }
  @keyframes logo-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes spin-slow {
    from { transform: scale(1.4) rotate(0deg); }
    to { transform: scale(1.4) rotate(360deg); }
  }
  @keyframes shield-bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-3px) scale(1.1); }
  }
  @keyframes character-float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-8px) rotate(0.5deg); }
    75% { transform: translateY(4px) rotate(-0.5deg); }
  }
  @keyframes orbit-particle {
    0% { transform: translate(-50%, -50%) rotate(0deg) translateX(140px) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg) translateX(140px) rotate(-360deg); }
  }
  @keyframes scan-line {
    0% { transform: translateY(-100%); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(400%); opacity: 0; }
  }
  @keyframes typing-dots {
    0%, 20% { opacity: 0.3; }
    50% { opacity: 1; }
    80%, 100% { opacity: 0.3; }
  }
`;

export default function PlatformLogin() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme, switchable } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const utils = trpc.useUtils();

  const loginMutation = trpc.platformAuth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message || "فشل تسجيل الدخول");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!userId.trim() || !password.trim()) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    loginMutation.mutate({ userId: userId.trim(), password });
  };

  const isDark = theme === "dark";

  return (
    <>
      <style>{animationStyles}</style>
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        dir="rtl"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #060e1f 0%, #0a1628 20%, #0d1f3c 50%, #132b52 80%, #0f2340 100%)"
            : "linear-gradient(135deg, #eef2f7 0%, #e8eef5 30%, #f0f4f9 60%, #e5ecf4 100%)",
        }}
      >
        {/* 3D Particle Canvas */}
        <ParticleBackground isDark={isDark} />

        {/* Scan line effect */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ overflow: "hidden" }}
        >
          <div
            className="absolute w-full h-px"
            style={{
              background: isDark
                ? "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)"
                : "linear-gradient(90deg, transparent, rgba(59,130,246,0.1), transparent)",
              animation: "scan-line 8s linear infinite",
            }}
          />
        </div>

        {/* Theme toggle */}
        {switchable && toggleTheme && (
          <button
            onClick={toggleTheme}
            className="absolute top-5 left-5 z-20 p-2.5 rounded-xl transition-all duration-300 hover:scale-110"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(10px)",
            }}
            title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        )}

        {/* Main content */}
        <div
          className="relative z-10 flex items-center gap-16 max-w-5xl w-full"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Login form — right side (RTL) */}
          <div className="flex-1 max-w-md mx-auto lg:mx-0">
            {/* Animated Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedLogo
                  src={isDark ? RASID_LOGO_DARK : RASID_LOGO_LIGHT}
                  isDark={isDark}
                />
              </div>
              <h1
                className="text-xl font-bold mb-1"
                style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}
              >
                منصة راصد
              </h1>
              <p
                className="text-sm"
                style={{ color: isDark ? "#94a3b8" : "#64748b" }}
              >
                منصة رصد تسريبات البيانات الشخصية
              </p>
            </div>

            {/* Login card with glass morphism */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: isDark
                  ? "rgba(10, 22, 50, 0.7)"
                  : "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(24px)",
                border: isDark
                  ? "1px solid rgba(59, 130, 246, 0.15)"
                  : "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: isDark
                  ? "0 8px 40px rgba(0, 0, 0, 0.4), 0 0 80px rgba(59, 130, 246, 0.06), inset 0 1px 0 rgba(255,255,255,0.03)"
                  : "0 8px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              {/* Subtle gradient border glow */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, transparent 50%, rgba(96,165,250,0.05) 100%)"
                    : "none",
                }}
              />

              <div className="relative z-[1]">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Lock className="w-4 h-4" style={{ color: isDark ? "#60a5fa" : "#3b82f6" }} />
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}
                  >
                    تسجيل الدخول
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div
                      className="flex items-center gap-2 p-3 rounded-lg text-sm"
                      style={{
                        background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: isDark ? "#fca5a5" : "#dc2626",
                      }}
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      style={{ color: isDark ? "#cbd5e1" : "#374151" }}
                    >
                      اسم المستخدم
                    </label>
                    <Input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="أدخل اسم المستخدم"
                      className="h-11 transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
                      style={{
                        background: isDark ? "rgba(15, 30, 60, 0.5)" : "rgba(241, 245, 249, 0.8)",
                        borderColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(0, 0, 0, 0.1)",
                        color: isDark ? "#e2e8f0" : "#1e293b",
                      }}
                      dir="ltr"
                      autoComplete="username"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      style={{ color: isDark ? "#cbd5e1" : "#374151" }}
                    >
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        className="h-11 pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
                        style={{
                          background: isDark ? "rgba(15, 30, 60, 0.5)" : "rgba(241, 245, 249, 0.8)",
                          borderColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(0, 0, 0, 0.1)",
                          color: isDark ? "#e2e8f0" : "#1e293b",
                        }}
                        dir="ltr"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me + Forgot password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span
                        className="text-sm"
                        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
                      >
                        تذكرني
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-sm hover:underline transition-colors"
                      style={{ color: isDark ? "#60a5fa" : "#3b82f6" }}
                      onClick={() => {}}
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full h-12 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 100%)",
                      border: "none",
                      boxShadow: isDark
                        ? "0 4px 20px rgba(37, 99, 235, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)"
                        : "0 4px 20px rgba(37, 99, 235, 0.2)",
                    }}
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جارٍ تسجيل الدخول...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        <Lock className="w-4 h-4" />
                        دخول
                      </span>
                    )}
                  </Button>
                </form>

                <div
                  className="mt-6 pt-4 border-t"
                  style={{ borderColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(0, 0, 0, 0.06)" }}
                >
                  <p className="text-xs text-center" style={{ color: isDark ? "#64748b" : "#94a3b8" }}>
                    هذا النظام مخصص للمستخدمين المصرح لهم فقط. أي محاولة وصول غير مصرح بها ستتم مراقبتها وتسجيلها.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: isDark ? "#475569" : "#94a3b8" }}>
              مكتب إدارة البيانات الوطنية — منصة راصد
            </p>
          </div>

          {/* Animated Character — left side */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <AnimatedCharacter isDark={isDark} />
          </div>
        </div>
      </div>
    </>
  );
}
