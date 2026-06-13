import { FormEvent } from "react";
import { AppRunState, ExamType, MoodState } from "../../types";
import JournalComposer from "./JournalComposer";
import MoodSelector from "./MoodSelector";
import ExamControls from "./ExamControls";
import { cn } from "../../utils/cn";

export interface LogPanelProps {
  formData: {
    journalText: string;
    mood: MoodState | null;
    examType: ExamType | null;
    daysToExam: number | null;
    city: string;
  };
  onChange: (updates: Partial<LogPanelProps["formData"]>) => void;
  onDecode: () => void;
  validationErrors: Record<string, string>;
  runState: AppRunState;
  geminiConfigured: boolean;
}

export default function LogPanel({
  formData,
  onChange,
  onDecode,
  validationErrors,
  runState,
  geminiConfigured,
}: LogPanelProps) {
  const isDecoding = runState.startsWith("loading_");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isDecoding) return;
    onDecode();
  };

  const getButtonLabel = () => {
    switch (runState) {
      case "loading_geocode":
        return `Resolving City [${formData.city}]...`;
      case "loading_weather":
        return "Synchronizing Local Meteorology...";
      case "loading_places":
        return "Querying Geo Proximity Landmarks...";
      case "loading_analysis":
        return "Gemini Scanning Mental Vectors...";
      case "loading_itinerary":
        return "Tailoring Restorative Itinerary...";
      case "loading_recommendations":
        return "Structuring Cognitive Actions...";
      default:
        return "Decode Cognitive Signals";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-signal-surface border border-signal-border rounded-xl p-5 md:p-6 space-y-6 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-signal-border pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-signal-blue"></span>
          <h2 className="text-sm font-mono font-bold tracking-tight text-signal-text uppercase">
            01 / Patient Log Panel
          </h2>
        </div>
        <span className="text-[10px] font-mono text-signal-muted uppercase select-none">
          Input Console
        </span>
      </div>

      {/* Journal composer element */}
      <JournalComposer
        value={formData.journalText}
        onChange={(val) => onChange({ journalText: val })}
        error={validationErrors.journalText}
        disabled={isDecoding || !geminiConfigured}
      />

      {/* Mood category selector */}
      <MoodSelector
        selected={formData.mood}
        onSelect={(mood) => onChange({ mood })}
        error={validationErrors.mood}
        disabled={isDecoding || !geminiConfigured}
      />

      {/* Exam meta targets */}
      <ExamControls
        examType={formData.examType}
        onExamTypeChange={(eType) => onChange({ examType: eType })}
        daysToExam={formData.daysToExam}
        onDaysChange={(dLeft) => onChange({ daysToExam: dLeft })}
        city={formData.city}
        onCityChange={(cName) => onChange({ city: cName })}
        examTypeError={validationErrors.examType}
        daysError={validationErrors.daysToExam}
        cityError={validationErrors.city}
        disabled={isDecoding || !geminiConfigured}
      />

      {/* Deployment trigger action */}
      <div className="pt-4 border-t border-signal-border space-y-4" id="decode-action-block">
        {!geminiConfigured ? (
          <div className="p-4 bg-signal-red/10 border border-signal-red/30 rounded-lg text-xs leading-relaxed text-signal-red font-mono" id="hardware-lock-warning">
            <strong className="text-signal-red">HARDWARE LOCK:</strong> GOOGLE_GEMINI_API_KEY is missing. Setup authentication credentials to unlock SIGNAL analysis capability.
          </div>
        ) : (
          <button
            type="submit"
            disabled={isDecoding}
            aria-label="Decode your journal entry"
            className={cn(
              "w-full py-3.5 px-4 font-mono text-xs font-bold uppercase rounded-lg tracking-widest text-center cursor-pointer transition-all duration-300 transform active:scale-[0.98] outline-none",
              isDecoding
                ? "bg-gradient-to-r from-signal-blue to-signal-blue/80 border border-signal-blue/50 text-white animate-pulse-glow cursor-not-allowed"
                : "bg-gradient-to-r from-[#3B7EF8] to-[#2060D0] border border-signal-blue text-white hover:opacity-90 shadow-lg shadow-signal-blue/15 hover:shadow-signal-blue/25"
            )}
          >
            {getButtonLabel()}
          </button>
        )}

        {/* Live data source badges row */}
        <div className="flex items-center justify-between gap-1 pt-1 font-mono text-[9px]" id="live-telemetry-badges">
          <span 
            className={cn(
              "px-2 py-0.5 rounded border transition-colors duration-300 select-none",
              ["loading_places", "loading_analysis", "loading_itinerary", "loading_recommendations", "complete"].includes(runState)
                ? "border-signal-teal/30 bg-signal-teal/5 text-signal-teal font-bold"
                : "border-signal-border bg-signal-bg text-signal-muted"
            )}
          >
            ● OPEN-METEO
          </span>
          <span 
            className={cn(
              "px-2 py-0.5 rounded border transition-colors duration-300 select-none",
              ["loading_analysis", "loading_itinerary", "loading_recommendations", "complete"].includes(runState)
                ? "border-signal-teal/30 bg-signal-teal/5 text-signal-teal font-bold"
                : "border-signal-border bg-signal-bg text-signal-muted"
            )}
          >
            ● WIKIPEDIA
          </span>
          <span 
            className={cn(
              "px-2 py-0.5 rounded border transition-colors duration-300 select-none",
              runState === "error"
                ? "border-signal-red/30 bg-signal-red/5 text-signal-red font-bold"
                : ["loading_itinerary", "loading_recommendations", "complete"].includes(runState)
                ? "border-signal-blue/30 bg-signal-blue/5 text-signal-blue font-bold"
                : "border-signal-border bg-signal-bg text-signal-muted"
            )}
          >
            ● GEMINI AI
          </span>
        </div>

        {/* Step status line below decode actions while loading */}
        {isDecoding && (
          <div className="space-y-2 pt-1 select-none animate-crisis-fade-in" id="loading-telemetry-status">
            <div className="h-1 w-full bg-signal-raised rounded overflow-hidden">
              <div
                className={cn(
                  "h-full bg-signal-blue transition-all duration-500 rounded",
                  runState === "loading_geocode" && "w-1/6",
                  runState === "loading_weather" && "w-2/6",
                  runState === "loading_places" && "w-3/6",
                  runState === "loading_analysis" && "w-4/6",
                  runState === "loading_itinerary" && "w-5/6",
                  runState === "loading_recommendations" && "w-[98%]"
                )}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-signal-muted lowercase select-none">
              <span className="text-signal-blue font-bold">
                {runState === "loading_geocode" && "→ Finding city coordinates..."}
                {runState === "loading_weather" && "→ Reading weather telemetry..."}
                {runState === "loading_places" && "→ Mapping nearby landmarks..."}
                {runState === "loading_analysis" && "→ Decoding mental vectors with Gemini..."}
                {runState === "loading_itinerary" && "→ Generating wellbeing break plan..."}
                {runState === "loading_recommendations" && "→ Framing actionable coping guides..."}
              </span>
              <span className="text-[9px] uppercase tracking-wider bg-signal-raised px-1.5 py-0.2 rounded border border-signal-border">In-progress</span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
