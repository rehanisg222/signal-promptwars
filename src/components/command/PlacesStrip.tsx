import { PlaceResult } from "../../types";

interface PlacesStripProps {
  places: PlaceResult[] | null;
}

export default function PlacesStrip({ places }: PlacesStripProps) {
  // Skeleton state
  if (places === null) {
    return (
      <div id="places-strip-skeleton" className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden space-y-3">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
          GEO_TARGETS // INITIALIZING_STREAM
        </div>
        <div className="h-4 w-1/3 rounded bg-signal-bg/50 animate-pulse mt-3"></div>
        <div className="flex gap-3 overflow-x-auto pb-1.5 max-w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-[190px] max-w-[210px] bg-black/10 border border-signal-border/50 p-3 rounded-lg flex flex-col justify-between gap-4 grow shrink-0 font-mono"
            >
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-signal-bg/50 animate-pulse"></div>
                <div className="h-10 w-full rounded bg-signal-bg/50 animate-pulse"></div>
              </div>
              <div className="h-3 w-1/2 rounded bg-signal-bg/50 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (places.length === 0) {
    return (
      <div id="places-strip-empty" className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden select-none">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted">
          GEO_TARGETS // EMPTY
        </div>
        <div className="py-4 text-center">
          <span className="text-xl">📍</span>
          <h4 className="text-xs font-mono font-bold text-signal-muted mt-2 uppercase">
            Proximity Landmarks Sparse
          </h4>
          <p className="text-[10px] text-signal-muted mt-1 leading-normal">
            No Wikipedia landmarks detected within a 5km radius of the resolved target. Reset planning defaults to home micro-grounding.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="places-strip" className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
        GEO_TARGETS // LOCAL_PROXIMITY_PINS
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center select-none">
          <h3 className="text-xs font-mono font-bold text-signal-muted uppercase tracking-wider">
            Detected Locale Geographies ({places.length})
          </h3>
          <span className="text-[9px] font-mono text-signal-teal font-extrabold uppercase bg-signal-teal/10 px-1.5 py-0.5 rounded border border-signal-teal/20">
            5km Radius Active
          </span>
        </div>

        {/* Scrollable list container */}
        <div className="flex gap-3 overflow-x-auto pb-1.5 pr-1 max-w-full scrollbar-thin scrollbar-thumb-signal-border scrollbar-track-transparent">
          {places.map((place, idx) => (
            <div
              key={idx}
              className="min-w-[190px] max-w-[210px] bg-black/30 border border-signal-border p-3 rounded-lg flex flex-col justify-between gap-2 grow shrink-0 font-mono transition-colors duration-200 hover:border-signal-teal/50"
            >
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-signal-text truncate uppercase" title={place.title}>
                  {place.title}
                </h4>
                <p className="text-[9.5px] leading-relaxed text-signal-muted line-clamp-3 select-none">
                  {place.description || "Historical Wikipedia locale marker pin recorded near city reference coordinates."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-signal-border/50 text-[8.5px]">
                <a
                  href={place.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-signal-blue font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Wiki Reference ↗
                </a>
                <span className="text-signal-muted">
                  GP_WP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
