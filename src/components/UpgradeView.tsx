import React from "react";
import { 
  Zap, 
  Check, 
  Sparkles, 
  Tv, 
  Timer, 
  Activity, 
  ShieldAlert, 
  Crown, 
  ArrowLeft 
} from "lucide-react";

interface UpgradeViewProps {
  onBack: () => void;
  isPremium: boolean;
  handleUpgrade: () => void;
}

export default function UpgradeView({ onBack, isPremium, handleUpgrade }: UpgradeViewProps) {
  const features = [
    {
      icon: <Tv className="w-5 h-5 text-amber-500" />,
      titleFa: "حذف کامل و دائمی تبلیغات",
      titleEn: "Remove All Ads Permanently",
      descFa: "خداحافظی با تمامی بنرهای تبلیغاتی پایین صفحه و ویدیوهای اجباری تپسل برای همیشه.",
      descEn: "Say goodbye to banner ads and interstitial rewarded video ads forever."
    },
    {
      icon: <Timer className="w-5 h-5 text-emerald-500" />,
      titleFa: "رفع محدودیت زمانی اسکن",
      titleEn: "No Scan Cooldown Timer",
      descFa: "دیگر نیازی به صبر کردن بین اسکن‌ها نیست؛ هر چقدر دوست دارید پی‌در‌پی هندوانه اسکن کنید.",
      descEn: "Remove the waiting time limit between scans. Analyze as many watermelons as you want."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-pink-500" />,
      titleFa: "موتور پردازش آفلاین فوق‌العاده سریع",
      titleEn: "Priority Local Offline Engine",
      descFa: "بهینه‌سازی حداکثری و افزایش فرکانس پردازش محلی تصاویر بدون نیاز به اینترنت؛ ایده‌آل برای استفاده در بازارهای میوه بدون آنتن‌دهی.",
      descEn: "Maximum optimization and enhanced local frame rate processing. Works entirely offline, ideal for fruit markets."
    }
  ];

  return (
    <div className="w-full space-y-6" id="upgrade-view-container">
      {/* Header card with glass effect */}
      <div 
        className="relative bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl text-center space-y-4"
        id="upgrade-hero-card"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center justify-center p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-amber-300 font-sans tracking-tight">
            ارتقای برنامه هندونه‌سنج هوشمند
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            با خرید نسخه کامل، تمامی محدودیت‌ها را بردارید و با دقت بی‌نظیر، رسیده بودن هندوانه را در مغازه‌ها بسنجید.
          </p>
        </div>

        {isPremium ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold text-xs">
            <Check className="w-4 h-4" />
            شما قبلاً این محصول را تهیه کرده‌اید و نسخه کامل برای شما فعال است.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="flex items-baseline gap-1.5 justify-center mb-1">
              <span className="text-2xl font-black text-amber-400">۱۹,۰۰۰</span>
              <span className="text-[11px] text-slate-400">تومان</span>
              <span className="text-xs text-slate-400 line-through mr-2">۲۹,۰۰۰</span>
            </div>
            <button
              onClick={handleUpgrade}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black rounded-2xl text-xs sm:text-sm shadow-[0_4px_20px_rgba(245,158,11,0.25)] transition-all transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 max-w-xs w-full"
              id="buy-full-version-btn"
            >
              <Zap className="w-4 h-4 fill-black" />
              خرید نسخه کامل برنامه (دائمی)
            </button>
            <p className="text-[10px] text-slate-500">پرداخت امن درون‌برنامه‌ای از طریق فروشگاه مایکت</p>
          </div>
        )}
      </div>

      {/* Grid of features */}
      <div className="space-y-3" id="premium-features-list">
        <h3 className="text-xs font-bold text-emerald-400/80 pr-2">امکانات فوق‌العاده نسخه کامل (Premium Full):</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((item, index) => (
            <div 
              key={index}
              className="bg-[#0B120F]/90 border border-emerald-950/30 p-5 rounded-2xl flex gap-4 transition-all hover:border-emerald-900/40"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/40">
                  {item.icon}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-200">{item.titleFa}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed leading-normal">{item.descFa}</p>
                <div className="text-[10px] text-slate-500 font-medium font-sans">{item.titleEn}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer warning info */}
      <div className="bg-[#050807] border border-emerald-950/40 rounded-2xl p-4 flex gap-3 text-slate-400">
        <ShieldAlert className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] space-y-1">
          <p className="font-bold text-slate-300">پشتیبانی و اصالت خرید</p>
          <p>
            خرید شما به صورت دائمی به حساب کاربری مایکت شما متصل خواهد شد. در صورت تغییر دستگاه یا پاک شدن برنامه، با همان حساب کاربری مایکت نسخه کامل به صورت رایگان بازیابی خواهد شد.
          </p>
        </div>
      </div>

      {/* Return button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onBack}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 px-4 py-2 border border-zinc-800 hover:border-zinc-700 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          برگشت به اسکنر هندوانه
        </button>
      </div>
    </div>
  );
}
