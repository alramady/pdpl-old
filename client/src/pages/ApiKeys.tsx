/**
 * ApiKeys — API Key Management for external SIEM/SOC integrations
 * Admin-only page for creating, managing, and revoking API keys
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Code2,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ApiKeys() {
  const { data: keys, isLoading, refetch } = trpc.apiKeys.list.useQuery();
  const { data: permissions } = trpc.apiKeys.permissions.useQuery();
  const createMutation = trpc.apiKeys.create.useMutation({
    onSuccess: (data) => {
      refetch();
      setNewKey(data.rawKey);
      setShowCreate(false);
      toast.success("تم إنشاء مفتاح API بنجاح");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.apiKeys.update.useMutation({
    onSuccess: () => { refetch(); toast.success("تم تحديث المفتاح"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.apiKeys.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("تم حذف المفتاح"); },
    onError: (e) => toast.error(e.message),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [form, setForm] = useState({
    name: "",
    permissions: [] as string[],
    rateLimit: 1000,
    expiresAt: "",
  });

  const togglePermission = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            إدارة مفاتيح API للتكامل مع أنظمة SIEM و SOC الخارجية
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setShowDocs(!showDocs)}
          >
            <Code2 className="w-3.5 h-3.5" />
            {showDocs ? "إخفاء التوثيق" : "توثيق API"}
          </Button>
          <Button
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            مفتاح جديد
          </Button>
        </div>
      </div>

      {/* New Key Display (shown once after creation) */}
      <AnimatePresence>
        {newKey && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-400 mb-1">مفتاح API الجديد — احفظه الآن!</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  لن يتم عرض هذا المفتاح مرة أخرى. انسخه واحفظه في مكان آمن.
                </p>
                <div className="flex items-center gap-2 bg-background/80 rounded-lg p-3 font-mono text-xs text-foreground break-all">
                  <code className="flex-1">{newKey}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(newKey);
                      toast.success("تم نسخ المفتاح");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs text-amber-400"
                  onClick={() => setNewKey(null)}
                >
                  تم الحفظ — إغلاق
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Documentation */}
      <AnimatePresence>
        {showDocs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 overflow-hidden"
          >
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              توثيق API — أمثلة الاستخدام
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">المصادقة — أضف المفتاح في ترويسة Authorization:</p>
                <pre className="bg-background rounded-lg p-3 text-xs text-cyan-400 font-mono overflow-x-auto" dir="ltr">
{`curl -H "Authorization: Bearer ndmo_your_api_key_here" \\
  https://your-domain.manus.space/api/v1/leaks`}
                </pre>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">جلب التسريبات:</p>
                <pre className="bg-background rounded-lg p-3 text-xs text-cyan-400 font-mono overflow-x-auto" dir="ltr">
{`GET /api/v1/leaks
GET /api/v1/leaks?severity=critical
GET /api/v1/leaks?source=telegram`}
                </pre>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">إنشاء تسريب جديد (SIEM integration):</p>
                <pre className="bg-background rounded-lg p-3 text-xs text-cyan-400 font-mono overflow-x-auto" dir="ltr">
{`POST /api/v1/leaks
Content-Type: application/json

{
  "title": "New Leak from SIEM",
  "source": "telegram",
  "severity": "high",
  "sector": "Banking",
  "recordCount": 5000,
  "piiTypes": ["National ID", "IBAN"]
}`}
                </pre>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">فحص PII:</p>
                <pre className="bg-background rounded-lg p-3 text-xs text-cyan-400 font-mono overflow-x-auto" dir="ltr">
{`POST /api/v1/pii/scan
Content-Type: application/json

{
  "text": "National ID: 1234567890, Phone: +966501234567"
}`}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-xl p-6"
          >
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              إنشاء مفتاح API جديد
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">اسم المفتاح</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    placeholder="SIEM Integration Key"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">حد الطلبات / يوم</label>
                  <input
                    type="number"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={form.rateLimit}
                    onChange={(e) => setForm({ ...form, rateLimit: parseInt(e.target.value) || 1000 })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">تاريخ الانتهاء (اختياري)</label>
                  <input
                    type="date"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">الصلاحيات</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {permissions?.map((perm) => (
                    <button
                      key={perm.id}
                      className={`p-2 rounded-lg border text-xs text-right transition-colors ${
                        form.permissions.includes(perm.id)
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border/50 bg-background/50 text-muted-foreground hover:border-border"
                      }`}
                      onClick={() => togglePermission(perm.id)}
                    >
                      <p className="font-medium">{perm.labelAr}</p>
                      <p className="text-[10px] opacity-70">{perm.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>إلغاء</Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => createMutation.mutate({
                    ...form,
                    expiresAt: form.expiresAt || null,
                  })}
                  disabled={!form.name || form.permissions.length === 0 || createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  إنشاء المفتاح
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keys List */}
      <div className="space-y-3">
        {keys?.map((key, i) => (
          <motion.div
            key={key.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card/60 backdrop-blur-sm border rounded-xl p-5 ${
              key.isActive ? "border-border/50" : "border-red-500/20 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  key.isActive ? "bg-primary/10" : "bg-red-500/10"
                }`}>
                  <KeyRound className={`w-5 h-5 ${key.isActive ? "text-primary" : "text-red-400"}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{key.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{key.keyPrefix}••••••••</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  key.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {key.isActive ? "نشط" : "معطل"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span>{(key.permissions as string[] | null)?.length ?? 0} صلاحية</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-3.5 h-3.5" />
                <span>{key.requestsToday}/{key.rateLimit} طلب/يوم</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {key.lastUsedAt
                    ? `آخر استخدام: ${new Date(key.lastUsedAt).toLocaleDateString("ar-SA")}`
                    : "لم يُستخدم بعد"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {key.expiresAt
                    ? `ينتهي: ${new Date(key.expiresAt).toLocaleDateString("ar-SA")}`
                    : "بدون انتهاء"}
                </span>
              </div>
            </div>

            {/* Permissions tags */}
            <div className="flex flex-wrap gap-1 mt-3">
              {(key.permissions as string[] | null)?.map((perm) => (
                <span key={perm} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80">
                  {perm}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => updateMutation.mutate({ id: key.id, isActive: !key.isActive })}
                disabled={updateMutation.isPending}
              >
                {key.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {key.isActive ? "تعطيل" : "تفعيل"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-8 text-red-400 hover:text-red-300"
                onClick={() => {
                  if (confirm("هل أنت متأكد من حذف هذا المفتاح؟ لن يمكن التراجع عن هذا الإجراء.")) {
                    deleteMutation.mutate({ id: key.id });
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-3 h-3" />
                حذف
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {(!keys || keys.length === 0) && !showCreate && (
        <div className="text-center py-12">
          <KeyRound className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">لا توجد مفاتيح API</p>
          <p className="text-xs text-muted-foreground mt-1">أنشئ مفتاحاً للتكامل مع أنظمة SIEM/SOC الخارجية</p>
        </div>
      )}
    </div>
  );
}
