import { AppRunState, SignalRunResult } from "../../types";
import BurnoutGauge from "./BurnoutGauge";
import TriggerRadar from "./TriggerRadar";
import DistortionChips from "./DistortionChips";
import InsightCard from "./InsightCard";
import WeatherCard from "./WeatherCard";
import PlacesStrip from "./PlacesStrip";

interface CommandDeckProps {
  runState: AppRunState;
  result: SignalRunResult | null;
}

export default function CommandDeck({ runState, result }: CommandDeckProps) {
  const isLoading = runState.startsWith("loading_");
  const isComplete = runState === "complete" && result !== null;

  // Render Idle Console State
  if (runState === "idle" || runState === "setup_required") {
    return (
      <div id="command-deck-idle" className="col-span-12 md:col-span-6 lg:col-span-4 space-y-6">
        <div className="bg-signal-surface border border-signal-border rounded-xl p-6 flex flex-col justify-center items-center text-center min-h-[60vh] relative overflow-hidden select-none">
          {/* Subtle frame accents */}
          <span className="absolute top-4 left-4 font-mono text-[9px] text-signal-muted uppercase">System Deck Ready</span>
          <span className="absolute top-4 right-4 font-mono text-[9px] text-signal-muted uppercase">Online</span>

          <div className="w-16 h-16 bg-signal-raised border border-signal-border rounded-full flex items-center justify-center mb-4 text-signal-muted">
            <span className="text-2xl">⚡</span>
          </div>

          <h2 className="text-base font-bold font-sans tracking-tight text-signal-text mb-2 uppercase">
            02 / Awaiting Decode Core Signal Sequence
          </h2>
          <p className="text-xs text-signal-muted max-w-sm leading-relaxed mb-6">
            Enter your journal text, initial mood, remaining test dates, and locale on the left panel to trigger full-stack signal analysis and weather-aware itinerary building.
          </p>

          <div className="flex flex-col gap-2 max-w-xs w-full text-left font-mono text-[10px] p-4 bg-signal-raised rounded-lg border border-signal-border/50 text-signal-muted">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-signal-blue rounded-full"></span>
              <span>Gemini LLM semantic analysis active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-signal-teal rounded-full"></span>
              <span>Open-Meteo local weather check fully ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-signal-amber rounded-full"></span>
              <span>Wikipedia proximity coordinates active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Loading States
  if (isLoading) {
    return (
      <div id="command-deck-loading" className="col-span-12 md:col-span-6 lg:col-span-4 space-y-6">
        {/* Loading Shell Indicator */}
        <div className="bg-signal-surface border border-signal-border rounded-xl p-5 space-y-6 relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-signal-border pb-3">
            <div className="flex items-center gap-2 select-none">
              <span className="w-2 h-2 rounded-full bg-signal-blue animate-ping"></span>
              <h2 className="text-sm font-mono font-bold text-signal-text uppercase">
                02 / Decoding Signal Inputs...
              </h2>
            </div>
            <span className="text-[10px] font-mono text-signal-muted uppercase animate-pulse select-none">
              Securing Vectors
            </span>
          </div>

          {/* Skeleton Loaders matching standard structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Circular Progress Gauge skeleton */}
            <BurnoutGauge analysis={null} />

            {/* Radar Polygon grid skeleton */}
            <TriggerRadar triggerDomains={null} />
          </div>

          {/* Primary Insight card skeleton */}
          <InsightCard primaryInsight={null} primaryStressor={null} emotions={null} />

          {/* Cognitive Distortion Skeleton */}
          <DistortionChips cognitiveDistortions={null} />

          {/* Weather status indicator skeleton */}
          <div className="p-5 bg-signal-raised border border-signal-border rounded-xl space-y-3">
            <div className="h-4 w-1/3 rounded-md skeleton"></div>
            <div className="h-8 w-2/3 rounded-md skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render Completed Dashboard
  if (isComplete) {
    // 1. Lockdown Crisis Design: Hide decorative data and coordinates, suppress coping coaching tips.
    if (result.isCrisis || result.analysis.riskFlag === "crisis") {
      return (
        <div id="command-deck-lockdown" className="col-span-12 md:col-span-6 lg:col-span-4 space-y-6">
          <div className="bg-signal-surface border-2 border-signal-red/60 rounded-xl p-5 md:p-6 space-y-6 animate-pulse-slow">
            <div className="flex justify-between items-center border-b border-signal-red/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-signal-red animate-ping"></span>
                <h2 className="text-sm font-mono font-bold text-signal-red uppercase">
                  COGNITIVE_OVERLOAD // RISK_LOCKDOWN
                </h2>
              </div>
              <span className="text-[10px] font-mono text-signal-red uppercase select-none font-bold">
                Safety Mode
              </span>
            </div>

            <div className="p-4 bg-signal-red/5 border border-signal-red/20 rounded-lg font-mono text-[11px] leading-relaxed text-signal-text">
              ⛔ SYSTEM CONTROL BLOCKED. Standard meteorological metrics, tourist mapping grids, cognitive biases, and physical study advice have been suppressed according to clinical safety fallback standards.
            </div>

            <div className="grid grid-cols-1 gap-4">
              <BurnoutGauge analysis={result.analysis} />
              
              <InsightCard
                primaryInsight={result.analysis.primaryInsight}
                primaryStressor={result.analysis.primaryStressor}
                emotions={result.analysis.emotions}
              />
            </div>
          </div>
        </div>
      );
    }

    // 2. Standard Diagnostics View
    return (
      <div id="command-deck-complete" className="col-span-12 md:col-span-6 lg:col-span-4 space-y-6">
        {/* Core Deck Grid */}
        <div className="bg-signal-surface border border-signal-border rounded-xl p-5 md:p-6 space-y-6">
          {/* Deck Title */}
          <div className="flex justify-between items-center border-b border-signal-border pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal-green"></span>
              <h2 className="text-sm font-mono font-bold text-signal-text uppercase">
                02 / Diagnostic Console
              </h2>
            </div>
            <span className="text-[10px] font-mono text-signal-green uppercase select-none font-bold">
              Scan Connected
            </span>
          </div>

          {/* Double column for summary layout blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dynamic circular Burnout Indicator */}
            <BurnoutGauge analysis={result.analysis} />

            {/* Intensity Radar Matrix */}
            <TriggerRadar triggerDomains={result.analysis.triggerDomains} />
          </div>

          {/* Cognitive Distortion Amber Tags */}
          <DistortionChips
            cognitiveDistortions={result.analysis.cognitiveDistortions}
            distortionExplanations={result.analysis.distortionExplanations}
          />

          {/* Dynamic Insight Card from Gemini model summary */}
          <InsightCard
            emotions={result.analysis.emotions}
            primaryStressor={result.analysis.primaryStressor}
            primaryInsight={result.analysis.primaryInsight}
          />

          {/* Meteorology details */}
          <WeatherCard weather={result.weather} />

          {/* Proximity local horizontal landmark cards */}
          <PlacesStrip places={result.places} />
        </div>
      </div>
    );
  }

  return null;
}
