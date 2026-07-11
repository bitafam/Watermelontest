import React, { useState } from "react";
import { 
  User, 
  Mail, 
  MessageSquare, 
  Send, 
  Copy, 
  ExternalLink, 
  Code, 
  Sparkles, 
  Check, 
  Globe, 
  Gamepad2, 
  Phone,
  Layers,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ContactUsProps {
  onBack?: () => void;
}

export default function ContactUs({ onBack }: ContactUsProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [subject, setSubject] = useState("پیشنهاد و انتقاد");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedType, setCopiedType] = useState<"email" | "text" | null>(null);

  const developerEmail = "salarybusines@gmail.com";

  const handleMyketClick = () => {
    // Standard Myket developer page intent scheme
    // We open using window.open which supports custom schemes on Android device/webview
    const myketScheme = "myket://developer/com.apps.wmqd";
    const myketWebUrl = "https://myket.ir/developer/com.apps.wmqd";
    
    // Attempt to open custom protocol, fallback to web URL
    const start = Date.now();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = myketScheme;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      document.body.removeChild(iframe);
      if (Date.now() - start < 1500) {
        window.open(myketWebUrl, "_blank");
      }
    }, 1000);
  };

  const handleCopyText = (text: string, type: "email" | "text") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setIsSubmitted(true);
  };

  const triggerMailto = () => {
    const formattedSubject = encodeURIComponent(`پیام از طرف ${name} - موضوع: ${subject}`);
    const formattedBody = encodeURIComponent(
      `فرستنده: ${name}\n` +
      `اطلاعات تماس: ${contact || "وارد نشده"}\n` +
      `موضوع: ${subject}\n\n` +
      `متن پیام:\n${message}`
    );
    window.location.href = `mailto:${developerEmail}?subject=${formattedSubject}&body=${formattedBody}`;
  };

  const getStructuredMessage = () => {
    return `فرستنده: ${name}\n` +
           `اطلاعات تماس: ${contact || "وارد نشده"}\n` +
           `موضوع: ${subject}\n\n` +
           `متن پیام:\n${message}`;
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
      {/* Developer Profile Section (Amirhossein Salari) */}
      <div className="bg-[#0E1612] border border-emerald-900/50 rounded-2xl overflow-hidden shadow-xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10b981]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Developer Avatar Mockup */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)] border border-emerald-400/30">
                <Code className="w-10 h-10 text-emerald-50" />
              </div>
              <span className="absolute -bottom-2 -left-2 bg-emerald-500 text-[#050807] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#0E1612]">
                توسعه‌دهنده
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-right space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h2 className="text-xl font-bold text-emerald-50">امیرحسین سالاری</h2>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block self-center md:self-auto">
                  برنامه‌نویس و طراح وب‌سایت
                </span>
              </div>
              
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
                سلام! من امیرحسین سالاری هستم. نزدیک به <strong className="text-emerald-300 font-semibold">۶ سال</strong> است که به عنوان برنامه‌نویس فعالیت دارم. شور و اشتیاق بی‌نهایتی به نوشتن کدهای تمیز، حل مسائل پیچیده و خلق محصولات کاربردی دارم. تجربه توسعه برنامه‌های اندرویدی، پیاده‌سازی وب‌سایت‌های حرفه‌ای و طراحی سیستم‌های تعاملی را در کارنامه خود دارم.
              </p>

              {/* Technologies Chips */}
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1">
                <span className="text-[10px] bg-[#14231B] text-emerald-300 border border-emerald-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  جاوا (Java)
                </span>
                <span className="text-[10px] bg-[#14231B] text-emerald-300 border border-emerald-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  پایتون (Python)
                </span>
                <span className="text-[10px] bg-[#14231B] text-emerald-300 border border-emerald-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  طراحی وب‌سایت
                </span>
                <span className="text-[10px] bg-[#14231B] text-emerald-300 border border-emerald-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Gamepad2 className="w-3 h-3 text-emerald-400" />
                  بازی‌سازی علاقمند
                </span>
              </div>
            </div>
          </div>

          {/* Features / Achievements */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-emerald-900/30">
            <div className="bg-[#090F0D] p-3 rounded-xl border border-emerald-900/20 text-center md:text-right">
              <span className="text-[10px] text-slate-500 block mb-1">سابقه برنامه‌نویسی</span>
              <span className="text-sm font-bold text-emerald-200">نزدیک به ۶ سال</span>
            </div>
            <div className="bg-[#090F0D] p-3 rounded-xl border border-emerald-900/20 text-center md:text-right">
              <span className="text-[10px] text-slate-500 block mb-1">تخصص اصلی</span>
              <span className="text-sm font-bold text-emerald-200">Java & Python & Web</span>
            </div>
            <div className="col-span-2 md:col-span-1 bg-[#090F0D] p-3 rounded-xl border border-emerald-900/20 text-center md:text-right">
              <span className="text-[10px] text-slate-500 block mb-1">محصولات منتشر شده</span>
              <span className="text-sm font-bold text-emerald-200">برنامه‌های کاربردی متعدد</span>
            </div>
          </div>

          {/* Other Apps on Myket Button - Beautiful Action */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#14231B]/30 p-4 rounded-xl border border-emerald-500/10">
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="text-xs font-bold text-emerald-300">دیگر برنامه‌های امیرحسین سالاری را دیده‌اید؟</h4>
              <p className="text-[10px] text-slate-400">می‌توانید تمام آثار، ابزارها و بازی‌های دیگر من را در مارکت مایکت بررسی کنید.</p>
            </div>
            <button
              onClick={handleMyketClick}
              className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-[#050807] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>دیگر برنامه‌های ما (مایکت)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Form Section */}
      <div className="bg-[#0E1612] border border-emerald-900/50 rounded-2xl overflow-hidden shadow-xl relative">
        <div className="p-4 border-b border-emerald-900/30 bg-[#0B120F]/60 flex items-center justify-between">
          <span className="font-medium text-sm flex items-center gap-2 text-emerald-100">
            <Mail className="w-4 h-4 text-emerald-400" />
            فرم ارسال پیام مستقیم
          </span>
          <span className="text-[10px] text-emerald-500/60 font-mono">salarybusines@gmail.com</span>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  نام و نام خانوادگی <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: علی محمدی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050807] border border-emerald-900/40 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none transition-colors"
                />
              </div>

              {/* Email / Contact Info */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  ایمیل یا شماره تماس
                </label>
                <input 
                  type="text"
                  placeholder="مثال: salary@example.com یا 09123456789"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-[#050807] border border-emerald-900/40 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none transition-colors left-to-right"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Message Subject */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                موضوع پیام
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["پیشنهاد و انتقاد", "گزارش خطا / باگ", "همکاری تجاری", "سوال عمومی"].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className={`p-2 rounded-xl text-[11px] font-bold transition-all border text-center cursor-pointer ${
                      subject === sub
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                        : "bg-[#050807] border-emerald-900/30 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                متن پیام شما <span className="text-rose-500">*</span>
              </label>
              <textarea 
                required
                rows={5}
                placeholder="متن پیام خود را بنویسید..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#050807] border border-emerald-900/40 focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-100 outline-none transition-colors resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>پیام شما مستقیم به ایمیل امیرحسین سالاری ارسال خواهد شد</span>
                <span>{message.length} کاراکتر</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!name.trim() || !message.trim()}
                className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  name.trim() && message.trim()
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#050807] shadow-lg shadow-emerald-500/10 active:scale-95"
                    : "bg-emerald-900/10 border border-emerald-950/40 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>ثبت و آماده‌سازی پیام</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal Sheet */}
      <AnimatePresence>
        {isSubmitted && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-[#0B120F] border-t sm:border border-emerald-900/50 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-4 border-b border-emerald-900/30 bg-[#090F0D] flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <Check className="w-5 h-5 bg-emerald-500/10 p-0.5 rounded-full" />
                  پیام شما آماده ارسال است!
                </span>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <XIcon />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed font-light text-center">
                  پیش‌نویس پیام شما با موفقیت در ساختار استاندارد آماده شده است. به دلیل محدودیت‌های سیستم‌عامل، لطفا یکی از روش‌های زیر را جهت تحویل نهایی به ایمیل <span className="text-emerald-400 font-bold font-mono">salarybusines@gmail.com</span> انتخاب کنید:
                </p>

                <div className="space-y-2.5">
                  {/* Option 1: Open Email app */}
                  <button
                    onClick={triggerMailto}
                    className="w-full p-4 bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-bold rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <div className="text-right">
                        <span className="block text-xs font-bold">روش اول: ارسال از برنامه ایمیل گوشی</span>
                        <span className="block text-[10px] text-slate-400 font-normal">کلیک کنید تا برنامه ایمیل گوشی باز شود</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 transform rotate-180 text-emerald-400" />
                  </button>

                  {/* Option 2: Copy message body */}
                  <button
                    onClick={() => handleCopyText(getStructuredMessage(), "text")}
                    className="w-full p-4 bg-[#141F1A] hover:bg-[#1C2C24] border border-emerald-900/40 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Copy className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform" />
                      <div className="text-right">
                        <span className="block text-xs font-bold">روش دوم: کپی کردن متن آماده شده</span>
                        <span className="block text-[10px] text-slate-400 font-normal">می‌توانید کپی کرده و خودتان دستی بفرستید</span>
                      </div>
                    </div>
                    {copiedType === "text" ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> کپی شد!
                      </span>
                    ) : (
                      <ArrowRight className="w-4 h-4 transform rotate-180 text-slate-400" />
                    )}
                  </button>

                  {/* Option 3: Copy email only */}
                  <button
                    onClick={() => handleCopyText(developerEmail, "email")}
                    className="w-full p-3 bg-[#090F0D] hover:bg-[#121E19] border border-emerald-950 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <span className="text-xs">کپی کردن آدرس ایمیل توسعه‌دهنده</span>
                    {copiedType === "email" ? (
                      <span className="text-[10px] text-emerald-400">کپی شد!</span>
                    ) : (
                      <span className="text-xs font-mono font-normal text-slate-500">salarybusines@gmail.com</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#090F0D] border-t border-emerald-900/20 flex justify-end gap-2">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 bg-emerald-900/20 border border-emerald-900/50 hover:bg-emerald-900/40 text-emerald-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  بستن پنجره
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Simple internal X icon
function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
