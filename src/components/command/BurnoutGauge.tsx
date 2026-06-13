import { useEffect, useState } from "react";
import { EntryAnalysis } from "../../types";

interface BurnoutGaugeProps {
  analysis: EntryAnalysis | null;
}

const BURNOUT_GAUGE_ANIMATION_MS = 600;

export default function BurnoutGauge({ analysis }: BurnoutGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // 1. Calculate burnout score based on spec formula
  let energy = 3;
  let riskFlag = "none";
  let targetScore = 0;

  if (analysis) {
    energy = analysis.energy;
    riskFlag = analysis.riskFlag;
    
    const riskScoreMap: Record<string, number> = {
      none: 0,
      low: 10,
      moderate: 25,
      high: 40,
      crisis: 60,
    };
    const riskScore = riskScoreMap[riskFlag] ?? 0;
    const rawScore = ((6 - energy) * 10) + riskScore;
    targetScore = Math.max(0, Math.min(100, rawScore));
  }

  useEffect(() => {
    if (!analysis) {
      setDisplayScore(0);
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / BURNOUT_GAUGE_ANIMATION_MS, 1);
      const currentScore = Math.floor(progress * (targetScore - startValue) + startValue);
      setDisplayScore(currentScore);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetScore, analysis]);

  // Determine ring color by score
  // 0-30: signal.teal
  // 31-60: signal.amber
  // 61-100: signal.red
  const getRingColorClass = (score: number) => {
    if (score <= 30) return "text-signal-teal";
    if (score <= 60) return "text-signal-amber";
    return "text-signal-red";
  };

  const getSubtitle = (flag: string) => {
    switch (flag) {
      case "none":
        return "Signal Clear";
      case "low":
        return "Low Stress";
      case "moderate":
        return "Moderate Strain";
      case "high":
        return "High Burnout";
      case "crisis":
        return "Crisis Detected";
      default:
        return "Signal Clear";
    }
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  if (!analysis) {
    return (
      <div id="burnout-gauge-null" className="bg-signal-raised border border-signal-border rounded-xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
          BURNOUT_GAUGE // SYS_X6
        </div>
        
        {/* Large circle skeleton */}
        <div className="w-48 h-48 rounded-full border-4 border-signal-border/40 border-t-signal-blue/20 animate-spin flex items-center justify-center text-signal-muted font-mono text-[10px] mt-4">
          [ DECODING CORE ]
        </div>
        
        <div className="mt-4 space-y-1">
          <h3 className="text-xs font-mono font-bold text-signal-muted uppercase tracking-wider">
            BURNOUT INDEX
          </h3>
          <p className="text-[10px] text-signal-muted/60 select-none">
            Calculating stress vectors...
          </p>
        </div>
      </div>
    );
  }

  const ringColor = getRingColorClass(displayScore);
  const subtitle = getSubtitle(riskFlag);

  return (
    <div id="burnout-gauge" className="bg-signal-raised border border-signal-border rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Background detail */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
        BURNOUT_GAUGE // SYS_X6
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center mt-4">
        {/* SVG gauge ring (200px equivalent) */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            className="stroke-signal-bg"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-100 ease-out ${ringColor}`}
          />
        </svg>

        {/* Floating details inside circle */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-5xl font-black font-sans leading-none tracking-tighter text-signal-text">
            {displayScore}%
          </span>
          <span className="text-[9px] font-mono text-signal-muted uppercase tracking-widest mt-1.5 select-none font-bold">
            stress Index
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-[10px] font-mono font-extrabold text-signal-muted uppercase tracking-widest">
          BURNOUT INDEX
        </h3>
        <p className={`text-lg font-black font-sans uppercase tracking-tight ${ringColor}`}>
          {subtitle}
        </p>
        <p className="text-[9px] font-mono text-signal-muted/80 leading-none select-none">
          Based on Gemini energy + risk analysis.
        </p>
      </div>

      {/* Stamina details footer */}
      <div className="w-full mt-5 pt-4 border-t border-signal-border/50 grid grid-cols-2 text-left font-mono text-[10px]">
        <div className="text-signal-muted">
          Mental Stamina:
        </div>
        <div className="text-right font-black text-signal-text">
          {energy} / 5
        </div>
        <div className="text-signal-muted">
          Risk Vector:
        </div>
        <div className={`text-right font-black uppercase ${
          riskFlag === "crisis" || riskFlag === "high" ? "text-signal-red animate-pulse" : "text-signal-muted"
        }`}>
          {riskFlag}
        </div>
      </div>
    </div>
  );
}
