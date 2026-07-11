import React from "react";
import { motion } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles
} from "lucide-react";

// @ts-ignore
import GuideIllustration from "../assets/images/watermelon_scan_guide_1783758869837.jpg";

export default function AccuracyGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="space-y-6 text-right"
      dir="rtl"
      id="accuracy-guide-container"
    >
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E1612] to-[#070D0A] border border-emerald-500/20 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              راهنمای دستیابی به دقت ۹۹٪ در آنالیز نوری
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-emerald-50 leading-tight">
              چگونه هندوانه‌ها را مانند یک کارشناس با تجربه اسکن کنیم؟
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              سیستم پردازش تصویر و بینایی ماشین این برنامه، ویژگی‌های بیولوژیکی و فیزیکی پوسته هندوانه را با دقت بسیار بالا تحلیل می‌کند. برای جلوگیری از خطای سنسورها و دریافت نتایجی کاملاً منطبق بر واقعیت، کافیست چند نکته ساده زیر را رعایت فرمایید.
            </p>
          </div>
          <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden border border-emerald-500/15 shadow-inner shrink-0">
            <img 
              src={GuideIllustration} 
              alt="راهنمای اسکن هندوانه" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Checklist / Do & Don't */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Do's (سبز) */}
        <div className="bg-[#0B120F] border border-emerald-500/10 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-950">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-100">بایدهای اسکن موفق (بهترین عملکرد)</h3>
              <p className="text-[10px] text-emerald-500/60">رعایت این موارد دقت را به حداکثر می‌رساند</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong className="text-emerald-300">برش دقیق هندوانه:</strong> حتماً هندوانه را دقیقاً در مرکز کادر بیضی شکل (چه در دوربین و چه در بخش برش گالری) قرار دهید تا فضای خالی و پس‌زمینه کاملاً حذف شود.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong className="text-emerald-300">نور طبیعی و یکنواخت:</strong> عکس را در محیطی با نور مناسب (نور خورشید یا لامپ‌های سفید قوی) بگیرید. سایه‌های شدید باعث به هم ریختن رنگ‌سنجی پوست می‌شوند.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong className="text-emerald-300">نمایش لکه زرد زیرین:</strong> اگر لکه زرد یا کرمی (محل تماس با زمین) را روی پوست مشاهده می‌کنید، هندوانه را به گونه‌ای بچرخانید که این لکه کاملاً در عکس مشخص باشد. این لکه حیاتی‌ترین فاکتور سنجش میزان قند است!
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong className="text-emerald-300">عکس واضح و بدون لرزش:</strong> تاری تصویر باعث مخدوش شدن نوارهای تیره و روشن می‌شود. گوشی را ثابت نگه داشته و روی پوسته فوکوس کنید.
              </p>
            </div>
          </div>
        </div>

        {/* Don'ts (قرمز) */}
        <div className="bg-[#120B0B] border border-rose-500/10 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 pb-2 border-b border-rose-950">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-rose-100">نبایدهای اسکن (موانع پردازش)</h3>
              <p className="text-[10px] text-rose-500/60">این موارد باعث بروز خطای محاسباتی می‌شوند</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong className="text-rose-300">وجود شاخ، برگ و ریشه مزاحم:</strong> جلوی هندوانه نباید برگ، شاخه بوته، یا گِل و لای ضخیم باشد. این موارد سنسور بینایی را به اشتباه می‌اندازند.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong className="text-rose-300">پوشش‌های پلاستیکی و توری:</strong> قبل از عکاسی، حتماً هندوانه را از توری‌های پلاستیکی سفید/قرمز یا سلفون‌های براق خارج کنید؛ انعکاس نور روی سلفون مانع تحلیل طیف رنگی پوست می‌شود.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong className="text-rose-300">فاصله خیلی دور یا نزدیک:</strong> هندوانه نباید آنقدر دور باشد که فقط ۱۰٪ تصویر را بگیرد، یا آنقدر نزدیک که نوارهای آن اصلاً دیده نشوند. کادربندی به اندازه کادر بیضی مناسب است.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong className="text-rose-300">عکاسی از میوه‌های متفرقه:</strong> الگوریتم‌های برنامه منحصراً برای هندوانه کامل یا قاچ‌شده آموزش دیده‌اند و برای خربزه، طالبی یا آناناس نتایج نادرست بازمی‌گردانند.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
