import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, AlertCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const RASID_LOGO_LIGHT = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/THVppkjqyLegafUm.png";
const RASID_LOGO_DARK = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/kuCEchYUSnPsbhZS.png";
const RASID_CHARACTER = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/qTFgtbWZjShuewJe.png";

// Floating bubble component matching rasid.vip
function FloatingBubbles() {
  const bubbles = [
    { size: 120, x: "75%", y: "20%", delay: 0, duration: 8 },
    { size: 80, x: "85%", y: "60%", delay: 2, duration: 10 },
    { size: 60, x: "15%", y: "70%", delay: 1, duration: 7 },
    { size: 150, x: "60%", y: "80%", delay: 3, duration: 12 },
    { size: 40, x: "90%", y: "10%", delay: 0.5, duration: 9 },
    { size: 90, x: "30%", y: "85%", delay: 4, duration: 11 },
    { size: 50, x: "70%", y: "45%", delay: 1.5, duration: 8 },
    { size: 70, x: "50%", y: "15%", delay: 2.5, duration: 10 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            background: "radial-gradient(circle at 30% 30%, oklch(0.55 0.12 250 / 0.18), oklch(0.45 0.1 250 / 0.06))",
            animation: `float-bubble ${b.duration}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Light mode bubbles (lighter colors)
function FloatingBubblesLight() {
  const bubbles = [
    { size: 120, x: "75%", y: "20%", delay: 0, duration: 8 },
    { size: 80, x: "85%", y: "60%", delay: 2, duration: 10 },
    { size: 60, x: "15%", y: "70%", delay: 1, duration: 7 },
    { size: 150, x: "60%", y: "80%", delay: 3, duration: 12 },
    { size: 40, x: "90%", y: "10%", delay: 0.5, duration: 9 },
    { size: 90, x: "30%", y: "85%", delay: 4, duration: 11 },
    { size: 50, x: "70%", y: "45%", delay: 1.5, duration: 8 },
    { size: 70, x: "50%", y: "15%", delay: 2.5, duration: 10 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            background: "radial-gradient(circle at 30% 30%, oklch(0.8 0.06 250 / 0.25), oklch(0.85 0.04 250 / 0.08))",
            animation: `float-bubble ${b.duration}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function PlatformLogin() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme, switchable } = useTheme();

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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      dir="rtl"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0a1628 0%, #0d1f3c 30%, #132b52 60%, #0f2340 100%)"
          : "linear-gradient(135deg, #eef2f7 0%, #e8eef5 30%, #f0f4f9 60%, #e5ecf4 100%)",
      }}
    >
      {/* Floating bubbles */}
      {isDark ? <FloatingBubbles /> : <FloatingBubblesLight />}

      {/* Theme toggle — top left like rasid.vip */}
      {switchable && toggleTheme && (
        <button
          onClick={toggleTheme}
          className="absolute top-5 left-5 z-20 p-2.5 rounded-xl transition-all duration-300 hover:scale-110"
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
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

      {/* Main content area */}
      <div className="relative z-10 flex items-center gap-16 max-w-5xl w-full">
        {/* Login form — right side (RTL) */}
        <div className="flex-1 max-w-md mx-auto lg:mx-0">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={isDark ? RASID_LOGO_DARK : RASID_LOGO_LIGHT}
              alt="منصة راصد"
              className="h-20 mx-auto object-contain mb-3"
            />
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
            className="rounded-2xl p-8"
            style={{
              background: isDark
                ? "rgba(15, 30, 60, 0.65)"
                : "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(20px)",
              border: isDark
                ? "1px solid rgba(59, 130, 246, 0.15)"
                : "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: isDark
                ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(59, 130, 246, 0.05)"
                : "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            <h2
              className="text-lg font-semibold text-center mb-6"
              style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}
            >
              تسجيل الدخول
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
                  className="h-11"
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
                    className="h-11 pl-10"
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
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
                  className="text-sm hover:underline"
                  style={{ color: isDark ? "#60a5fa" : "#3b82f6" }}
                  onClick={() => {}}
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-12 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)",
                  border: "none",
                }}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ تسجيل الدخول...
                  </span>
                ) : (
                  "دخول"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(0, 0, 0, 0.06)" }}>
              <p className="text-xs text-center" style={{ color: isDark ? "#64748b" : "#94a3b8" }}>
                هذا النظام مخصص للمستخدمين المصرح لهم فقط. أي محاولة وصول غير مصرح بها ستتم مراقبتها وتسجيلها.
              </p>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: isDark ? "#475569" : "#94a3b8" }}>
            مكتب إدارة البيانات الوطنية — منصة راصد
          </p>
        </div>

        {/* Character mascot — left side (visible in light mode on large screens) */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <img
            src={RASID_CHARACTER}
            alt="راصد"
            className="w-80 h-80 object-contain drop-shadow-2xl"
            style={{
              filter: isDark ? "brightness(0.9) drop-shadow(0 0 30px rgba(59, 130, 246, 0.15))" : "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1))",
              animation: "float-bubble 6s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}
