import React, { useEffect, useState } from "react";
import {
  BANNER_DEBUG,
  subscribeBannerDiagnostic,
  getBannerDiagnosticState,
  triggerBannerDebugRequest,
  triggerBannerDebugRemove,
  clearBannerDebugLogs,
  BannerDiagnosticState
} from "../utils/adivery";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Tv,
  X
} from "lucide-react";

export const BannerDebugOverlay: React.FC = () => {
  if (!BANNER_DEBUG) {
    return null;
  }

  const [state, setState] = useState<BannerDiagnosticState>(getBannerDiagnosticState());
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "view" | "events">("overview");

  useEffect(() => {
    const unsubscribe = subscribeBannerDiagnostic((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Visible":
        return {
          bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          dot: "bg-emerald-400 animate-pulse"
        };
      case "Loaded":
      case "Attached":
        return {
          bg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          dot: "bg-cyan-400"
        };
      case "Request Started":
      case "Loading":
      case "Initializing":
        return {
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          dot: "bg-amber-400 animate-ping"
        };
      case "Retrying":
        return {
          bg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          dot: "bg-purple-400 animate-bounce"
        };
      case "Failed":
        return {
          bg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          dot: "bg-rose-500"
        };
      case "Removed":
      default:
        return {
          bg: "bg-slate-500/20 text-slate-300 border-slate-500/40",
          dot: "bg-slate-400"
        };
    }
  };

  const badgeStyle = getStatusBadge(state.status);

  return (
    <>
      {/* Floating Toggle Button */}
      <div
        id="adivery-banner-debug-floating-trigger"
        className="fixed top-2.5 left-2.5 z-50 flex items-center gap-1.5 font-sans"
        dir="ltr"
      >
        <button
          id="btn-toggle-banner-debug"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md transition-all active:scale-95 text-xs font-mono font-medium ${
            badgeStyle.bg
          } ${isOpen ? "ring-2 ring-emerald-400/50" : ""}`}
        >
          <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
          <span className="font-semibold tracking-wide">ADIVERY BANNER</span>
          <span className="opacity-90 font-bold uppercase">{state.status}</span>
          {state.nextRetrySeconds !== null && state.nextRetrySeconds > 0 && (
            <span className="text-[10px] bg-rose-950/60 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800/40">
              {state.nextRetrySeconds}s
            </span>
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Diagnostic Modal / Drawer */}
      {isOpen && (
        <div
          id="adivery-banner-debug-modal"
          className="fixed inset-x-2 top-12 z-50 max-w-xl mx-auto rounded-2xl bg-slate-950/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl text-slate-100 overflow-hidden font-sans text-xs transition-all animate-in fade-in slide-in-from-top-2"
          dir="ltr"
          style={{ maxHeight: isMinimized ? "68px" : "85vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  Adivery Banner Debugger
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase ${badgeStyle.bg}`}>
                    {state.status}
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="btn-minimize-banner-debug"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                id="btn-close-banner-debug"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col h-full max-h-[calc(85vh-50px)] overflow-hidden">
              {/* Quick Action Bar */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-900/50 border-b border-slate-800/80">
                <button
                  id="btn-request-banner"
                  onClick={() => triggerBannerDebugRequest()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl shadow transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  REQUEST BANNER
                </button>
                <button
                  id="btn-remove-banner"
                  onClick={() => triggerBannerDebugRemove()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-rose-300 hover:text-rose-200 border border-slate-700 font-bold rounded-xl transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  REMOVE BANNER
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950 px-2 pt-1 gap-1">
                <button
                  id="tab-debug-overview"
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1.5 rounded-t-lg font-medium transition-all ${
                    activeTab === "overview"
                      ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Overview & State
                </button>
                <button
                  id="tab-debug-view"
                  onClick={() => setActiveTab("view")}
                  className={`px-3 py-1.5 rounded-t-lg font-medium transition-all ${
                    activeTab === "view"
                      ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Native View Telemetry
                </button>
                <button
                  id="tab-debug-events"
                  onClick={() => setActiveTab("events")}
                  className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === "events"
                      ? "bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Event Logs
                  {state.events.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                      {state.events.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Content Panels */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono">
                {/* TAB 1: OVERVIEW & STATE */}
                {activeTab === "overview" && (
                  <div className="space-y-3">
                    {/* Error Banner Alert */}
                    {state.lastError && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-400">
                          <AlertCircle className="w-4 h-4" />
                          Last Error:
                        </div>
                        <div className="text-xs break-all pl-5 text-rose-100 font-semibold bg-rose-900/30 p-1.5 rounded border border-rose-800/40">
                          {state.lastError}
                        </div>
                        {state.nextRetrySeconds !== null && (
                          <div className="text-[11px] text-amber-300 pl-5 flex items-center gap-1 pt-0.5">
                            <RotateCcw className="w-3 h-3 animate-spin" />
                            Retry #{state.retryAttempt}: Automatic retry scheduled in{" "}
                            <span className="font-bold underline">{state.nextRetrySeconds} seconds</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status & Check Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
                        <span className="text-xs font-bold text-emerald-400">{state.status}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Request</span>
                        <span className={`text-xs font-bold ${state.requestState === "SUCCESS" ? "text-emerald-400" : state.requestState === "FAILED" ? "text-rose-400" : "text-amber-400"}`}>
                          {state.requestState}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Loaded</span>
                        <span className={`text-xs font-bold ${state.isLoaded ? "text-emerald-400" : "text-slate-500"}`}>
                          {state.isLoaded ? "YES" : "NO"}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Visible</span>
                        <span className={`text-xs font-bold ${state.isVisible ? "text-emerald-400" : "text-rose-400"}`}>
                          {state.isVisible ? "YES" : "NO"}
                        </span>
                      </div>
                    </div>

                    {/* Zone & Spec Details */}
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-400">Zone ID:</span>
                        <span className="text-slate-200 font-semibold select-all">{state.zoneId}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-400">Position:</span>
                        <span className="text-cyan-400 font-semibold">{state.position}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-400">Target Size (dp):</span>
                        <span className="text-amber-400 font-semibold">{state.size}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-400">Target Size (px):</span>
                        <span className="text-slate-200 font-semibold">
                          {state.targetWidthPx}px × {state.targetHeightPx}px (density: {state.density.toFixed(2)}x)
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400">Auto Refresh Cycle:</span>
                        <span className="text-slate-300">Every 60s (Active)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: NATIVE VIEW TELEMETRY */}
                {activeTab === "view" && (
                  <div className="space-y-3 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-xs pb-1 border-b border-slate-800">
                        <Layers className="w-3.5 h-3.5" />
                        Android Native View Inspection:
                      </div>

                      <div className="flex justify-between items-start py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-400">View Class:</span>
                        <span className="text-emerald-400 font-bold text-right text-[10px] break-all max-w-[240px]">
                          {state.viewClass}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-400">Measured Dimensions:</span>
                        <span className="text-slate-100 font-bold">
                          {state.viewWidthPx > 0 || state.viewHeightPx > 0
                            ? `${state.viewWidthPx}px × ${state.viewHeightPx}px`
                            : "0px × 0px (Pending layout)"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-400">View Visibility:</span>
                        <span className={`font-bold ${state.viewVisibility === "VISIBLE" ? "text-emerald-400" : "text-rose-400"}`}>
                          {state.viewVisibility}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-400">Parent ViewGroup:</span>
                        <span className={`font-bold ${state.parentExists ? "text-emerald-400" : "text-rose-400"}`}>
                          {state.parentExists ? "YES (Attached)" : "NO (Detached)"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-400">Parent Child Count:</span>
                        <span className="text-slate-200 font-bold">{state.parentChildCount}</span>
                      </div>

                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400">Root Window Size:</span>
                        <span className="text-slate-200 font-semibold">
                          {state.rootWidth > 0 ? `${state.rootWidth}px × ${state.rootHeight}px` : "Reading..."}
                        </span>
                      </div>
                    </div>

                    {/* Visibility Verification Explanation */}
                    <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800 text-[10px] space-y-1 text-slate-300">
                      <div className="font-bold text-slate-200">Visibility Evaluation Rule:</div>
                      <div className="flex items-center gap-1">
                        <span className={state.viewWidthPx > 0 ? "text-emerald-400" : "text-slate-500"}>
                          ✓ Width &gt; 0
                        </span>
                        <span>•</span>
                        <span className={state.viewHeightPx > 0 ? "text-emerald-400" : "text-slate-500"}>
                          ✓ Height &gt; 0
                        </span>
                        <span>•</span>
                        <span className={state.viewVisibility === "VISIBLE" ? "text-emerald-400" : "text-slate-500"}>
                          ✓ Visibility == VISIBLE
                        </span>
                        <span>•</span>
                        <span className={state.isAttached ? "text-emerald-400" : "text-slate-500"}>
                          ✓ Attached == TRUE
                        </span>
                      </div>
                      <div className="pt-1 text-slate-400">
                        Result: <span className="font-bold text-white uppercase">{state.isVisible ? "VISIBLE (Confirmed On Screen)" : "NOT VISIBLE YET"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: EVENT LOGS */}
                {activeTab === "events" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last 20 Adivery Events:
                      </span>
                      <button
                        id="btn-clear-banner-logs"
                        onClick={() => clearBannerDebugLogs()}
                        className="text-[10px] text-slate-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear Logs
                      </button>
                    </div>

                    {state.events.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No events logged yet. Tap "REQUEST BANNER" to start.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                        {state.events.map((evt) => (
                          <div
                            key={evt.id}
                            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] space-y-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-mono">[{evt.time}]</span>
                              <span className={`px-1.5 py-0.2 rounded font-semibold text-[9px] ${
                                evt.type.toLowerCase().includes("fail") || evt.type.toLowerCase().includes("error")
                                  ? "bg-rose-950 text-rose-300 border border-rose-800/50"
                                  : evt.type.toLowerCase().includes("load") || evt.type.toLowerCase().includes("attach")
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                                  : "bg-slate-800 text-slate-300"
                              }`}>
                                {evt.type}
                              </span>
                            </div>
                            <div className="text-slate-200 break-words pl-1 font-sans">
                              {evt.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Footer Note */}
              <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Toggle: <code className="text-emerald-400 font-mono">BANNER_DEBUG = false</code> to disable</span>
                <span className="text-slate-500 font-mono">Rewarded: UNTOUCHED</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
