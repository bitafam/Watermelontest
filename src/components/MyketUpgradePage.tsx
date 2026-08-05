import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Zap, CheckCircle, Info, CreditCard, AlertTriangle } from "lucide-react";
import { Myket } from "@salarizadi/capacitor-myket";

export function MyketUpgradePage({ onUpgradeSuccess, onBack }: { onUpgradeSuccess: () => void, onBack: () => void }) {
  const [purchaseState, setPurchaseState] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initMyket = async () => {
      try {
        await Myket.initialize({
          rsaPublicKey: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+21H2+aGGTB7daEX2rm1/dKRKmFEkQ0Ao1tLUx10/1Agl3FvDNhQvQw+q7AIZuKoVDJ8pWGY1Hm+gOmaHpgN94gvS8plu1g87nAC/slx2RXgG+bUjmu+9GlvX5RmsIaD5PjzQkB2KdOQZVWFM1ersnKxQceSAMMnYuQQ2r1eRUQIDAQAB"
        });
        
        Myket.addListener('purchaseStateChanged', (data: any) => {
          if (data.state === 'PURCHASED') {
            localStorage.setItem("isPremium", "true");
            setPurchaseState("success");
            setTimeout(() => {
              onUpgradeSuccess();
            }, 2000);
          } else if (data.state === 'CANCELLED' || data.state === 'FAILED' || data.state === 'FAILED_TO_BEGIN') {
            setPurchaseState("error");
            setErrorMessage("پرداخت لغو شد یا خطایی رخ داد.");
          }
        });
        
        setPurchaseState("idle");
      } catch (err) {
        console.error("Myket init failed:", err);
        setPurchaseState("error");
        setErrorMessage("خطا در اتصال به مایکت. لطفاً از نصب بودن برنامه مایکت مطمئن شوید.");
      }
    };
    initMyket();
    
    return () => {
      Myket.removeAllListeners();
    };
  }, []);

  const handlePurchase = async () => {
    setPurchaseState("loading");
    try {
      await Myket.purchaseProduct({
        productId: "Fullversion",
        type: "inapp"
      });
    } catch (err: any) {
      console.error("Myket purchase failed:", err);
      setPurchaseState("error");
      setErrorMessage(err?.message || "خطا در شروع فرایند پرداخت");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto py-8 px-4"
    >
      <div className="bg-gradient-to-b from-emerald-900/40 to-[#0A100D] border border-emerald-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"></div>
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-2 font-display">ارتقاء به نسخه کامل</h1>
            <p className="text-sm text-slate-400">یکبار خرید برای همیشه</p>
          </div>
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <Zap className="w-7 h-7 text-emerald-400" />
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-semibold">حذف کامل تبلیغات بنری و ویدیویی</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-semibold">رفع محدودیت دفعات آنالیز در دقیقه</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-semibold">دسترسی سریع‌تر به نتایج پردازش تصویر</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-semibold">پشتیبانی و به‌روزرسانی‌های ویژه</span>
          </div>
        </div>

        {purchaseState === "idle" && (
          <button 
            onClick={handlePurchase}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            <CreditCard className="w-5 h-5" />
            خرید نسخه بدون محدودیت
          </button>
        )}

        {purchaseState === "loading" && (
          <button disabled className="w-full bg-slate-800 text-slate-400 font-bold py-4 rounded-xl flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            در حال اتصال به مایکت...
          </button>
        )}

        {purchaseState === "error" && (
          <div className="space-y-3">
            <div className="w-full bg-rose-950/50 border border-rose-500 text-rose-400 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 px-2 text-center text-sm">
              <AlertTriangle className="w-5 h-5" />
              {errorMessage}
            </div>
            <button 
              onClick={() => setPurchaseState("idle")}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {purchaseState === "success" && (
          <div className="w-full bg-emerald-950/50 border border-emerald-500 text-emerald-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            خرید موفقیت‌آمیز بود!
          </div>
        )}

        <button 
          onClick={onBack}
          className="w-full mt-4 bg-transparent border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 font-semibold py-3 rounded-xl transition-all"
        >
          بازگشت به برنامه
        </button>

      </div>
      
      <div className="mt-6 flex items-start gap-3 p-4 bg-blue-950/20 border border-blue-900/30 rounded-xl">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300 leading-relaxed">
          پرداخت شما از طریق درگاه رسمی مارکت اندرویدی «مایکت» انجام می‌شود و کاملاً امن است. پس از پرداخت، امکانات نسخه کامل فوراً برای شما فعال خواهد شد.
        </p>
      </div>
    </motion.div>
  );
}
