/**
 * PublicVerify — Public document verification page
 * No login required — accessible via /public/verify
 * Allows anyone to verify document authenticity via code or QR scan
 */
import { useState, useRef, useEffect } from "react";
import { useRoute } from "wouter";
import {
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  QrCode,
  FileText,
  Upload,
  ArrowLeft,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RASID_LOGO_DARK = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/kuCEchYUSnPsbhZS.png";

// Floating bubbles for background
function FloatingBubbles() {
  const bubbles = [
    { size: 100, x: "80%", y: "15%", delay: 0, duration: 9 },
    { size: 70, x: "10%", y: "60%", delay: 1.5, duration: 8 },
    { size: 130, x: "65%", y: "75%", delay: 3, duration: 11 },
    { size: 50, x: "90%", y: "50%", delay: 0.5, duration: 7 },
    { size: 80, x: "25%", y: "85%", delay: 2, duration: 10 },
    { size: 60, x: "50%", y: "10%", delay: 4, duration: 8 },
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
            background: "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.15), rgba(37,99,235,0.05))",
            animation: `float-bubble ${b.duration}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

type VerifyState = "idle" | "scanning" | "success" | "error";

// Scanning animation phases
const scanPhases = [
  { label: "جارٍ الاتصال بقاعدة البيانات...", icon: "🔗", progress: 15 },
  { label: "البحث عن كود التوثيق...", icon: "🔍", progress: 35 },
  { label: "التحقق من صحة البيانات...", icon: "🛡️", progress: 55 },
  { label: "مطابقة المحتوى الحرفي...", icon: "📄", progress: 75 },
  { label: "التحقق من سلامة التوقيع الرقمي...", icon: "🔐", progress: 90 },
  { label: "إنهاء عملية التحقق...", icon: "✅", progress: 100 },
];

export default function PublicVerify() {
  const [, params] = useRoute("/public/verify/:code");
  const [code, setCode] = useState(params?.code || "");
  const [state, setState] = useState<VerifyState>("idle");
  const [scanPhaseIndex, setScanPhaseIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Auto-verify if code in URL
  useEffect(() => {
    if (params?.code) {
      setCode(params.code);
      handleVerify(params.code);
    }
  }, [params?.code]);

  const handleVerify = async (verifyCode?: string) => {
    const codeToVerify = verifyCode || code.trim();
    if (!codeToVerify) return;

    setState("scanning");
    setScanPhaseIndex(0);
    setResult(null);
    setError("");

    // Animate through scan phases
    for (let i = 0; i < scanPhases.length; i++) {
      setScanPhaseIndex(i);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    }

    // Call API
    try {
      const res = await fetch(`/api/trpc/documentation.verify?input=${encodeURIComponent(JSON.stringify({ code: codeToVerify }))}`);
      const json = await res.json();
      const data = json?.result?.data;

      if (data?.valid) {
        setState("success");
        setResult(data);
      } else {
        setState("error");
        setError(data?.message || "لم يتم العثور على توثيق بهذا الكود");
      }
    } catch (err) {
      setState("error");
      setError("حدث خطأ في الاتصال بالخادم");
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 30%, #132b52 60%, #0f2340 100%)",
      }}
    >
      <FloatingBubbles />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={RASID_LOGO_DARK} alt="راصد" className="h-10 object-contain" />
          <div>
            <h1 className="text-white font-bold text-lg">منصة راصد الوطنية</h1>
            <p className="text-blue-300/60 text-xs">التحقق من صحة التوثيق</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">متصل</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
        {state === "idle" && (
          <div className="w-full max-w-lg space-y-8 text-center">
            <div>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Fingerprint className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">التحقق من صحة التوثيق</h2>
              <p className="text-blue-200/60 text-sm max-w-md mx-auto">
                أدخل كود التوثيق المطبوع على الخطاب أو امسح رمز QR للتحقق من صحة ومصداقية الوثيقة
              </p>
            </div>

            <div
              className="rounded-2xl p-6 space-y-4"
              style={{
                background: "rgba(15, 30, 60, 0.65)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(59, 130, 246, 0.15)",
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200/80 block text-right">كود التوثيق</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="أدخل كود التوثيق (مثال: NDMO-DOC-2026-XXXX)"
                  className="h-12 text-center text-lg font-mono bg-[#0a1628]/50 border-blue-500/20 text-white placeholder:text-blue-300/30"
                  dir="ltr"
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
              </div>

              <Button
                onClick={() => handleVerify()}
                disabled={!code.trim()}
                className="w-full h-12 text-base font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)",
                }}
              >
                <Search className="w-5 h-5 ml-2" />
                تحقق الآن
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-blue-500/10" />
                <span className="text-xs text-blue-300/40">أو</span>
                <div className="flex-1 h-px bg-blue-500/10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-11 border-blue-500/20 text-blue-300 hover:bg-blue-500/10 bg-transparent"
                  onClick={() => {}}
                >
                  <QrCode className="w-4 h-4 ml-2" />
                  مسح QR
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-blue-500/20 text-blue-300 hover:bg-blue-500/10 bg-transparent"
                  onClick={() => {}}
                >
                  <Upload className="w-4 h-4 ml-2" />
                  رفع ملف
                </Button>
              </div>
            </div>

            <p className="text-blue-300/30 text-xs">
              للتأكد من صحة بيانات التوثيق يرجى مسح الكود في منصة راصد الوطنية
            </p>
          </div>
        )}

        {/* Scanning animation */}
        {state === "scanning" && (
          <div className="w-full max-w-lg space-y-8 text-center">
            <div className="relative">
              {/* Rotating ring */}
              <div className="w-32 h-32 mx-auto relative">
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-500/20"
                  style={{ animation: "spin 3s linear infinite" }}
                />
                <div
                  className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-400 border-r-blue-400"
                  style={{ animation: "spin 1.5s linear infinite" }}
                />
                <div
                  className="absolute inset-4 rounded-full border-4 border-transparent border-b-cyan-400"
                  style={{ animation: "spin 2s linear infinite reverse" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-blue-400" style={{ animation: "pulse-glow 1.5s ease-in-out infinite" }} />
                </div>
              </div>

              {/* Particle effects */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-blue-400/40"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${i * 45}deg) translateY(-80px)`,
                    animation: `pulse-glow ${1 + i * 0.2}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">جارٍ التحقق...</h3>
              <p className="text-blue-200/60 text-sm mb-6">{scanPhases[scanPhaseIndex]?.label}</p>

              {/* Progress bar */}
              <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-blue-900/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${scanPhases[scanPhaseIndex]?.progress || 0}%`,
                    background: "linear-gradient(90deg, #2563eb, #60a5fa, #38bdf8)",
                  }}
                />
              </div>

              {/* Phase steps */}
              <div className="mt-6 space-y-2 text-right max-w-xs mx-auto">
                {scanPhases.map((phase, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                      i < scanPhaseIndex
                        ? "text-emerald-400"
                        : i === scanPhaseIndex
                        ? "text-blue-300"
                        : "text-blue-300/20"
                    }`}
                  >
                    <span>{i < scanPhaseIndex ? "✓" : i === scanPhaseIndex ? "●" : "○"}</span>
                    <span>{phase.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success result */}
        {state === "success" && result && (
          <div className="w-full max-w-lg space-y-6 text-center">
            <div>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">التوثيق صحيح ومعتمد</h2>
              <p className="text-blue-200/60 text-sm">تم التحقق من صحة الوثيقة بنجاح</p>
            </div>

            <div
              className="rounded-2xl p-6 text-right space-y-4"
              style={{
                background: "rgba(15, 30, 60, 0.65)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              {result.document && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-300/50 text-xs mb-1">كود التوثيق</p>
                      <p className="text-white font-mono">{result.document.verificationCode}</p>
                    </div>
                    <div>
                      <p className="text-blue-300/50 text-xs mb-1">تاريخ الإصدار</p>
                      <p className="text-white">{new Date(result.document.createdAt).toLocaleDateString("ar-SA")}</p>
                    </div>
                    <div>
                      <p className="text-blue-300/50 text-xs mb-1">صادر بواسطة</p>
                      <p className="text-white">{result.document.generatedBy}</p>
                    </div>
                    <div>
                      <p className="text-blue-300/50 text-xs mb-1">عنوان الحادثة</p>
                      <p className="text-white">{result.document.leakTitle}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-blue-500/10">
                    <p className="text-emerald-400/80 text-xs flex items-center gap-1 justify-center">
                      <Shield className="w-3 h-3" />
                      تم التحقق من المطابقة الحرفية للمحتوى
                    </p>
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={() => { setState("idle"); setCode(""); setResult(null); }}
              variant="outline"
              className="border-blue-500/20 text-blue-300 hover:bg-blue-500/10 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              تحقق من وثيقة أخرى
            </Button>
          </div>
        )}

        {/* Error result */}
        {state === "error" && (
          <div className="w-full max-w-lg space-y-6 text-center">
            <div>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">التوثيق غير صالح</h2>
              <p className="text-blue-200/60 text-sm">{error}</p>
            </div>

            <Button
              onClick={() => { setState("idle"); setCode(""); setError(""); }}
              variant="outline"
              className="border-blue-500/20 text-blue-300 hover:bg-blue-500/10 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              حاول مرة أخرى
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4">
        <p className="text-blue-300/30 text-xs">
          © 2026 مكتب إدارة البيانات الوطنية — منصة راصد
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
