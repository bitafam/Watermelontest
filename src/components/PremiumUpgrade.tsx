import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Tv, 
  Check, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  Unlock,
  Info
} from "lucide-react";
import { motion } from "motion/react";
import { isFullVersionActive, purchaseFullVersion } from "../utils/tapsell";

interface PremiumUpgradeProps {
  onBack?: () => void;
  onUpgradeSuccess?: () => void;
}

export default function PremiumUpgrade({ onBack, onUpgradeSuccess }: PremiumUpgradeProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" | null }>({ text: "", type: null });

  useEffect(() => {
    const checkPremium = async () => {
      const active = await isFullVersionActive();
      setIsPremium(active);
    };
    checkPremium();
  }, []);

  const handlePurchase = async () => {
    setIsLoading(true);
    setStatusMessage({ text: "در حال اتصال به درگاه پرداخت مایکت...", type: "info" });
    try {
      const result = await purchaseFullVersion();
      if (result === "success" || result === "already_owned") {
        setIsPremium(true);
        setStatusMessage({ text: "برنامه با موفقیت به نسخه کامل ارتقا یافت! تبلیغات و محدودیت‌ها برداشته شدند.", type: "success" });
        if (onUpgradeSuccess) {
          onUpgradeSuccess();
        }
      } else {
        setStatusMessage({ text: "پرداخت توسط کاربر لغو شد یا با خطا مواجه گردید.", type: "error" });
      }
    } catch (error: any) {
      console.error("Payment failure:", error);
      setStatusMessage({ 
        text: error?.message || "خطایی در فرآیند پرداخت رخ داد. لطفاً مطمئن شوید مایکت نصب است.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 text-right"
      dir="rtl"
    >
      {/* Header card with background ambient circles */}
      <div className="bg-[#0E1612] border border-emerald-900/50 rounded-2xl overflow-hidden shadow-xl relative p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-100 font-sans tracking-tight">
                ارتقا به نسخه کامل برنامه
              </h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
              با خرید نسخه کامل، از امکانات بی‌نهایت هندوانه‌سنج هوشمند بدون آزار تبلیغات لذت ببرید.
            </p>
          </div>
          
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 rounded-xl border border-emerald-800/30 text-sm font-medium transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 ml-1" />
            بازگشت
          </button>
        </div>
      </div>

      {/* Main details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Benefits panel (takes 2 columns on desktop) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0E1612] border border-emerald-900/30 rounded-2xl p-6 shadow-lg space-y-5">
            <h3 className="text-lg font-bold text-gray-200 border-b border-emerald-950 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              مزایای نسخه کامل و بدون محدودیت
            </h3>

            <div className="space-y-4">
              {/* Benefit 1 */}
              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-800/20 text-emerald-400 mt-1">
                  <Tv className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-100 text-sm md:text-base">حذف دائمی و کامل تمامی تبلیغات</h4>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    با ارتقاء برنامه، تمامی تبلیغات بنری و میان‌برنامه‌ای به طور کامل و برای همیشه خاموش خواهند شد تا تجربه‌ای سریع و روان داشته باشید.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-800/20 text-emerald-400 mt-1">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-100 text-sm md:text-base">رفع کامل تمامی محدودیت‌ها</h4>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    محدودیت تعداد اسکن‌های روزانه و زمان انتظار ۳ دقیقه‌ای پس از هر آزمایش به طور کامل برداشته می‌شود.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-800/20 text-emerald-400 mt-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-100 text-sm md:text-base">حمایت از توسعه‌دهنده</h4>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    با ارتقا به نسخه کامل، به توسعه‌دهنده انرژی می‌دهید تا قابلیت‌های هوشمند بیشتری به برنامه اضافه کند.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action card column */}
        <div className="space-y-6">
          <div className="bg-[#0E1612] border border-emerald-900/30 rounded-2xl p-6 shadow-lg text-center space-y-6 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-950/60 rounded-full border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                {isPremium ? (
                  <Unlock className="w-8 h-8 text-emerald-400" />
                ) : (
                  <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs text-gray-500 block">وضعیت فعلی برنامه:</span>
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/30 rounded-full text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                    نسخه کامل (بدون تبلیغات)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-950/50 text-amber-500 border border-amber-900/30 rounded-full text-xs font-bold">
                    نسخه رایگان (دارای تبلیغات)
                  </span>
                )}
              </div>

              <div className="border-t border-emerald-950 my-4" />

              <div className="space-y-2 text-right">
                <div className="flex gap-2 items-center text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  حذف کامل تمام بنرهای تپسل
                </div>
                <div className="flex gap-2 items-center text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  رفع محدودیت انتظار روزانه
                </div>
                <div className="flex gap-2 items-center text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  فعال‌سازی همیشگی لایسنس مایکت
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {statusMessage.text && (
                <div className={`p-3 rounded-xl text-xs text-right leading-relaxed ${
                  statusMessage.type === "success" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/30" :
                  statusMessage.type === "error" ? "bg-red-950/50 text-red-300 border border-red-900/30" :
                  "bg-emerald-950/30 text-emerald-400 border border-emerald-900/20"
                }`}>
                  <div className="flex gap-1.5 items-start">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{statusMessage.text}</span>
                  </div>
                </div>
              )}

              {isPremium ? (
                <div className="w-full py-3.5 px-4 bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  نسخه کامل قبلاً فعال شده است
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 rounded-xl text-sm font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 animate-bounce" />
                      خرید نسخه کامل و ارتقا
                    </>
                  )}
                </button>
              )}
              <p className="text-[10px] text-gray-500 leading-relaxed">
                پرداخت شما به طور مستقیم از طریق درگاه امن پرداخت درون‌برنامه‌ای مایکت انجام می‌شود.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
