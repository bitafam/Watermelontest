import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, Zap, AlertTriangle } from "lucide-react";

interface RateLimitOverlayProps {
  timeLeft: number; // in milliseconds
  type: "cooldown" | "penalty";
  onUpgradeClick: () => void;
  onExpire: () => void;
}

export function RateLimitOverlay({ timeLeft, type, onUpgradeClick, onExpire }: RateLimitOverlayProps) {
  const [remaining, setRemaining] = useState(timeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onExpire]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0A100D] border border-emerald-900/50 p-6 sm:p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl shadow-emerald-900/20"
      >
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-rose-500" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">
          {type === "cooldown" ? "لطفاً کمی صبر کنید" : "محدودیت استفاده رایگان"}
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {type === "cooldown" 
            ? "برای انجام آنالیز بعدی لطفاً منتظر بمانید تا تبلیغات جایزه‌ای جدید برای شما آماده شود."
            : "شما در ۵ دقیقه گذشته بیش از ۴ بار از سیستم آنالیز استفاده کرده‌اید. برای حفظ کیفیت خدمات، لطفاً منتظر بمانید."}
        </p>
        
        <div className="text-4xl font-mono font-bold text-emerald-400 mb-8 bg-emerald-950/30 py-4 rounded-2xl border border-emerald-900/30">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>

        <button 
          onClick={onUpgradeClick}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Zap className="w-5 h-5" />
          خرید نسخه بدون محدودیت
        </button>
      </motion.div>
    </div>
  );
}
