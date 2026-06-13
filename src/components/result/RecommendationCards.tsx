import { Recommendation } from "../../types";
import { cn } from "../../utils/cn";

interface RecommendationCardsProps {
  recommendations: Recommendation[] | null;
}

export default function RecommendationCards({
  recommendations,
}: RecommendationCardsProps) {
  // Skeleton state
  if (recommendations === null) {
    return (
      <div id="recommendation-cards-skeleton" className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden space-y-4">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
          RECOMMEND_ACTIONS // DIAGNOSTIC_ADVICE
        </div>
        <div className="h-4 w-1/3 rounded bg-signal-bg/50 animate-pulse mt-3"></div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-3 bg-black/10 border border-signal-border/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 w-1/3 rounded bg-signal-bg/50 animate-pulse"></div>
                <div className="h-3 w-16 rounded bg-signal-bg/50 animate-pulse"></div>
              </div>
              <div className="h-3 w-5/6 rounded bg-signal-bg/50 animate-pulse"></div>
              <div className="h-3 w-2/3 rounded bg-signal-bg/50 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div id="recommendation-cards" className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
        RECOMMEND_ACTIONS // DIAGNOSTIC_ADVICE
      </div>

      <div className="mt-4 space-y-4">
        <h3 className="text-xs font-mono font-bold text-signal-muted uppercase tracking-wider mb-2 select-none">
          Actionable Daily Adjustments
        </h3>

        <div className="space-y-3">
          {recommendations.map((recommendation, idx) => (
            <div
              key={idx}
              className={cn(
                "p-4 bg-black/25 rounded-lg border border-signal-border/80 flex flex-col gap-2 font-mono hover:border-signal-blue/40 transition-all duration-200 shadow-sm",
                recommendation.effortLevel === "low" && "border-t-4 border-t-signal-teal",
                recommendation.effortLevel === "medium" && "border-t-4 border-t-signal-amber",
                recommendation.effortLevel !== "low" && recommendation.effortLevel !== "medium" && "border-t-4 border-t-signal-red"
              )}
            >
              <div className="flex items-center justify-between gap-2 select-none">
                <h4 className="text-xs font-black text-signal-text uppercase truncate">
                  » {recommendation.title}
                </h4>
                <span
                  className={cn(
                    "text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded border leading-none shrink-0",
                    recommendation.effortLevel === "low"
                      ? "bg-signal-teal/10 text-signal-teal border-signal-teal/20"
                      : recommendation.effortLevel === "medium"
                      ? "bg-signal-amber/10 text-signal-amber border-signal-amber/20"
                      : "bg-signal-red/10 text-signal-red border-signal-red/20"
                  )}
                >
                  {recommendation.effortLevel} Friction
                </span>
              </div>

              <div className="space-y-1.5 text-[10.5px]">
                <p className="text-signal-muted leading-relaxed select-none">
                  <span className="text-signal-blue font-bold">Diagnose:</span> {recommendation.why}
                </p>

                <p className="text-signal-text/90 leading-relaxed font-sans font-medium">
                  <span className="text-signal-teal font-mono text-[10.5px] font-bold">Action:</span> {recommendation.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
