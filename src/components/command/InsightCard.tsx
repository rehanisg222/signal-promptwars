interface InsightCardProps {
  primaryInsight: string | null;
  primaryStressor: string | null;
  emotions: string[] | null;
}

export default function InsightCard({
  primaryInsight,
  primaryStressor,
  emotions,
}: InsightCardProps) {
  // Skeleton state
  if (primaryInsight === null) {
    return (
      <div id="insight-card-skeleton" className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden space-y-4">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
          DECODER_TRANSCRIPT // COGNITIVE_INSIGHT
        </div>
        <div className="h-4 w-1/4 rounded bg-signal-bg/50 animate-pulse mt-3"></div>
        <div className="h-16 w-full rounded bg-signal-bg/50 animate-pulse"></div>
        <div className="h-5 w-1/2 rounded bg-signal-bg/50 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div id="insight-card" className="bg-signal-raised border border-signal-border border-l-4 border-l-signal-blue rounded-xl p-6 relative overflow-hidden transition-all duration-300 shadow-lg shadow-signal-blue/5">
      <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
        DECODER_TRANSCRIPT // COGNITIVE_INSIGHT
      </div>

      <div className="mt-4 space-y-5">
        {/* Core dynamic insights readout text */}
        <div>
          <h3 className="text-xs font-mono font-bold text-signal-muted uppercase tracking-wider mb-2 select-none">
            Primary Signal Insight
          </h3>
          <p className="font-sans text-base tracking-wide text-signal-text leading-relaxed font-semibold bg-black/20 p-5 rounded-lg border border-signal-border/50 shadow-inner">
            {primaryInsight || "Narrative diagnostic scans complete."}
          </p>
        </div>

        {/* Emotion markers and main stressor values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-signal-border/50 font-mono text-[10px]">
          <div>
            <span className="text-signal-muted block uppercase tracking-wider mb-1.5 select-none">
              Primary Stressor:
            </span>
            <span className="text-signal-blue font-bold tracking-tight text-xs bg-signal-blue/5 border border-signal-blue/20 px-2 py-1 rounded block truncate">
              🚨 {primaryStressor || "Undefined"}
            </span>
          </div>

          <div>
            <span className="text-signal-muted block uppercase tracking-wider mb-1.5 select-none">
              Detected Emotion Matrix:
            </span>
            <div className="flex flex-wrap gap-1.5 leading-none">
              {emotions && emotions.length > 0 ? (
                emotions.map((emotion, idx) => (
                  <span
                    key={idx}
                    className="bg-signal-bg px-2 py-1 rounded text-signal-text border border-signal-border uppercase text-[9px] tracking-tight font-black transition-all hover:border-signal-blue"
                  >
                    {emotion}
                  </span>
                ))
              ) : (
                <span className="text-signal-muted text-[9px]">None detected</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
