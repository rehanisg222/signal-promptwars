import { CognitiveDistortionType } from "../../types";
import { DISTORTION_LABELS } from "../../lib/constants";

interface DistortionChipsProps {
  cognitiveDistortions: CognitiveDistortionType[] | null;
  distortionExplanations?: Record<string, string> | null;
}

export default function DistortionChips({
  cognitiveDistortions,
  distortionExplanations,
}: DistortionChipsProps) {
  // Skeleton state
  if (cognitiveDistortions === null) {
    return (
      <div id="distortion-chips-skeleton" className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden space-y-3">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
          COGNITIVE_BIAS // LATCHING_CHIPS
        </div>
        <div className="h-4 w-1/3 rounded bg-signal-bg/50 animate-pulse mt-3"></div>
        <div className="flex gap-2 flex-wrap">
          <div className="h-6 w-24 rounded bg-signal-bg/50 animate-pulse"></div>
          <div className="h-6 w-32 rounded bg-signal-bg/50 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Empty state
  if (cognitiveDistortions.length === 0) {
    return (
      <div id="distortion-chips-empty" className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden select-none">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted">
          COGNITIVE_BIAS // DETECT_EMPTY
        </div>
        <div className="py-2 flex flex-col items-center text-center">
          <span className="text-xl">🛡️</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-tight uppercase bg-signal-teal/15 text-signal-teal border border-signal-teal/60 mt-3">
            No major distortion detected
          </span>
          <p className="text-[10px] text-signal-muted mt-2 leading-normal">
            Cognitive framing appears functional, logical, and grounded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="distortion-chips" className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
        COGNITIVE_BIAS // DETECT_ACTIVE
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-xs font-mono font-black text-signal-muted uppercase tracking-widest mb-3 select-none">
            COGNITIVE PATTERNS // BIAS VECTORS
          </h3>
          <div className="flex flex-wrap gap-2">
            {cognitiveDistortions.map((key) => {
              const label = DISTORTION_LABELS[key] || key;
              return (
                <div
                  key={key}
                  className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-signal-amber/10 text-signal-amber border border-signal-amber/40 select-none cursor-help transition-all duration-150 hover:bg-signal-amber/20 hover:border-signal-amber/60"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-amber animate-pulse"></span>
                  {label}

                  {/* Tooltip on hover */}
                  {distortionExplanations?.[key] && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-signal-surface border border-signal-amber/80 text-signal-text text-[10px] font-mono normal-case rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-250 z-30 leading-relaxed">
                      <span className="font-black text-signal-amber block uppercase tracking-wider mb-1.5 border-b border-signal-amber/30 pb-1">
                        DISTORTION SPEC //
                      </span>
                      {distortionExplanations[key]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Explanations */}
        {distortionExplanations && Object.keys(distortionExplanations).length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-signal-border/50">
            <h4 className="text-[10px] font-mono font-bold text-signal-muted uppercase select-none">
              Analysis Diagnostics (Hover / Read below)
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {cognitiveDistortions.map((key) => {
                const text = distortionExplanations[key];
                if (!text) return null;
                const label = DISTORTION_LABELS[key] || key;
                return (
                  <div key={key} className="p-2.5 bg-black/30 rounded-lg border border-signal-border font-mono text-[9.5px]">
                    <span className="text-signal-amber font-bold block mb-1 uppercase tracking-wider">
                      » {label}
                    </span>
                    <span className="text-signal-text/90 leading-relaxed block">
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
