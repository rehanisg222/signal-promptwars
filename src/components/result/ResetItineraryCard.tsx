import { ResetItinerary } from "../../types";

interface ResetItineraryCardProps {
  itinerary: ResetItinerary | null;
}

export default function ResetItineraryCard({
  itinerary,
}: ResetItineraryCardProps) {
  if (!itinerary) {
    return (
      <div className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden select-none">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted">
          ITINERARY // LOAD_FAILED
        </div>
        <div className="py-4 text-center">
          <span className="text-xl">⚠️</span>
          <h4 className="text-xs font-mono font-bold text-signal-red mt-2 uppercase">
            Itinerary Unavailable
          </h4>
          <p className="text-[10px] text-signal-muted mt-1 leading-normal">
            Failed to construct wellbeing break schedule from generative models. Please select retry to build plan.
          </p>
        </div>
      </div>
    );
  }

  // Calculate sum total of minutes
  const totalMinutes = itinerary.steps.reduce((sum, step) => sum + step.durationMinutes, 0);

  return (
    <div className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
        ITINERARY // HEALTH_RESET_PLAN
      </div>

      <div className="mt-4 space-y-4">
        {/* Title elements */}
        <div>
          <span className="text-[8.5px] font-mono text-signal-blue font-black uppercase tracking-widest bg-signal-blue/10 px-2 py-0.5 rounded border border-signal-blue/25 select-none">
            {totalMinutes} Minute Reset Break
          </span>
          <h3 className="text-sm font-bold font-sans text-signal-text tracking-tight mt-2 uppercase">
            {itinerary.title}
          </h3>
          <p className="text-xs text-signal-muted font-sans font-medium mt-1 select-none">
            {itinerary.summary}
          </p>
        </div>

        {/* Dynamic Sequenced Step Items */}
        <div className="space-y-6 pt-2" id="itinerary-steps-timeline">
          {itinerary.steps.map((step, idx) => (
            <div 
              key={idx} 
              className="relative pl-8 border-l-2 border-signal-teal/25 animate-step-appear"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Sequential Indicator dot badge */}
              <div className="absolute -left-[13px] top-0.5 w-6 h-6 rounded-full bg-signal-raised border-2 border-signal-teal flex items-center justify-center font-mono text-[10px] font-bold text-signal-teal shadow-md select-none">
                {idx + 1}
              </div>

               {/* Step info row */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1 select-none">
                  <h4 className="text-sm font-sans font-black text-signal-text uppercase tracking-tight">
                    {step.label}
                  </h4>
                  <span className="text-[10px] font-mono font-extrabold text-signal-teal bg-signal-teal/20 px-2 py-0.5 rounded-full shadow-sm">
                    ⏱️ {step.durationMinutes}m
                  </span>
                </div>

                <p className="text-xs text-signal-text/90 leading-relaxed font-sans">
                  {step.action}
                </p>

                <p className="text-[10.5px] font-mono text-signal-muted select-none">
                  <span className="text-signal-blue font-bold">REASON FOR INCLUSION //</span> {step.reason}
                </p>

                {step.placeTitle && (
                  <div className="pt-1 select-none">
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black text-signal-blue uppercase bg-signal-blue/10 border border-signal-blue/20 px-2 py-0.5 rounded-full shadow-sm">
                      📍 LANDMARK SPEC: {step.placeTitle}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Weather aware reference notes */}
        {itinerary.weatherAwareNote && (
          <div className="p-3 bg-black/20 rounded-lg border border-signal-border/60 select-none">
            <span className="text-[9px] font-mono text-signal-muted block uppercase font-bold tracking-wider mb-1">
              Weather Integration Log
            </span>
            <p className="text-[10.5px] font-mono text-signal-muted leading-relaxed">
              ⛅ {itinerary.weatherAwareNote}
            </p>
          </div>
        )}

        {/* Closing motivational message */}
        <p className="text-xs font-mono font-bold text-signal-green text-center select-none pt-2">
          🍀 {itinerary.encouragement}
        </p>
      </div>
    </div>
  );
}
