import { AppRunState, SignalRunResult } from "../../types";
import ResetItineraryCard from "./ResetItineraryCard";
import RecommendationCards from "./RecommendationCards";
import ReplanBox from "./ReplanBox";
import CrisisSafetyPanel from "./CrisisSafetyPanel";

interface ResultPanelProps {
  runState: AppRunState;
  result: SignalRunResult | null;
  replanConstraint: string;
  onReplanConstraintChange: (value: string) => void;
  onReplan: () => void;
  isReplanning: boolean;
}

export default function ResultPanel({
  runState,
  result,
  replanConstraint,
  onReplanConstraintChange,
  onReplan,
  isReplanning,
}: ResultPanelProps) {
  const isLoading = runState.startsWith("loading_");
  const isComplete = runState === "complete" && result !== null;

  // 1. Idle or missing key state
  if (runState === "idle" || runState === "setup_required") {
    return (
      <div className="col-span-12 md:col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-signal-surface border border-signal-border rounded-xl p-5 md:p-6 text-center select-none font-sans min-h-[40vh] flex flex-col justify-center items-center relative overflow-hidden">
          <span className="absolute top-4 left-4 font-mono text-[9px] text-signal-muted uppercase">Companion Deck</span>
          
          <div className="w-12 h-12 bg-signal-raised border border-signal-border rounded-full flex items-center justify-center mb-3 text-signal-muted text-lg">
            🗺️
          </div>
          <h3 className="text-xs font-mono font-bold text-signal-text uppercase tracking-tight">
            03 / Wellbeing Action Deck
          </h3>
          <p className="text-[11px] text-signal-muted mt-1 leading-relaxed max-w-[200px]">
            Awaiting local diagnostic scan before outputting safe break structures and constraints.
          </p>
        </div>
      </div>
    );
  }

  // 2. Skeletons for Loading phases
  if (isLoading) {
    return (
      <div className="col-span-12 md:col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-signal-surface border border-signal-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-signal-border pb-3">
            <span className="w-2 h-2 rounded-full bg-signal-teal animate-pulse"></span>
            <h3 className="text-xs font-mono font-bold text-signal-text uppercase">
              03 / Assembling Resets...
            </h3>
          </div>

          <div className="bg-signal-raised border border-signal-border rounded-xl p-4 space-y-3">
            <div className="h-5 w-1/3 skeleton rounded-md"></div>
            <div className="h-20 w-full skeleton rounded-md"></div>
            <div className="h-10 w-full skeleton rounded-md"></div>
          </div>

          <div className="bg-signal-raised border border-signal-border rounded-xl p-4 space-y-3">
            <div className="h-5 w-1/4 skeleton rounded-md"></div>
            <div className="h-12 w-full skeleton rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Complete Result Display
  if (isComplete) {
    return (
      <div className="col-span-12 md:col-span-12 lg:col-span-4 space-y-6">
        {result.isCrisis ? (
          // Critical Safety Floor Active - strictly show helplines only, suppress clinical coping guidelines
          <CrisisSafetyPanel />
        ) : (
          // Standard Well-being dashboard components
          <div className="space-y-6">
            {/* Main Title Bar */}
            <div className="bg-signal-surface border border-signal-border rounded-xl px-5 py-3 flex items-center justify-between font-mono select-none">
              <span className="text-xs font-bold text-signal-text uppercase">
                03 / Wellness Companion
              </span>
              <span className="text-[9px] text-signal-green font-bold uppercase bg-signal-green/10 px-1.5 py-0.5 rounded border border-signal-green/15 leading-none">
                Resolved
              </span>
            </div>

            {/* Sequence steps plan itinerary */}
            <ResetItineraryCard itinerary={result.itinerary} />

            {/* Actionable recommendations lists */}
            <RecommendationCards recommendations={result.recommendations} />

            {/* Custom replan injection card boxes */}
            <ReplanBox
              value={replanConstraint}
              onChange={onReplanConstraintChange}
              onReplan={onReplan}
              isReplanning={isReplanning}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}
