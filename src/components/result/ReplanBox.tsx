import { ChangeEvent, FormEvent } from "react";
import { cn } from "../../utils/cn";

interface ReplanBoxProps {
  value: string;
  onChange: (value: string) => void;
  onReplan: () => void;
  isReplanning: boolean;
}

export default function ReplanBox({
  value,
  onChange,
  onReplan,
  isReplanning,
}: ReplanBoxProps) {
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReplanning || value.trim() === "") return;
    onReplan();
  };

  return (
    <div className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden">
      {/* Absolute indicator badge */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
        COMMAND_INJECT // REPLAN_REVISE
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <h3 className="text-xs font-mono font-bold text-signal-muted uppercase tracking-wider mb-1 select-none">
            Adjust Active Constraints
          </h3>
          <p className="text-[10px] text-signal-muted leading-relaxed font-mono select-none">
            Inject new environmental or scheduling constraints directly back into the itinerary generator (e.g. "I only have 10 mins", "It is raining now").
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            disabled={isReplanning}
            value={value}
            onChange={handleTextChange}
            aria-label="New environmental or scheduling constraints"
            placeholder="e.g. 'I only have 15 minutes left'"
            className="flex-1 p-2 bg-signal-bg border border-signal-border focus:border-signal-teal focus:ring-1 focus:ring-signal-teal rounded-lg text-xs font-mono focus:outline-none placeholder:text-signal-muted/40 text-signal-text"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={isReplanning || value.trim() === ""}
            aria-label="Apply new constraint"
            className={cn(
              "px-4 py-2 bg-signal-teal hover:bg-[#159A9A] text-white font-mono text-[10px] font-bold uppercase rounded-lg cursor-pointer tracking-widest select-none shrink-0 transition-colors duration-200 focus:outline-none outline-none",
              (isReplanning || value.trim() === "") && "opacity-50 cursor-not-allowed bg-signal-raised text-signal-muted border-signal-border hover:bg-signal-raised"
            )}
          >
            {isReplanning ? "INJECTING..." : "REPLAN"}
          </button>
        </form>

        {/* Small, tappable command-shortcut styled chips */}
        <div className="pt-2 border-t border-signal-border/30 select-none">
          <span className="text-[8.5px] font-mono text-signal-muted block uppercase tracking-wide mb-1.5">
            Quick Command Constraints Shortcut:
          </span>
          <div className="flex flex-wrap gap-1.5" id="constraint-chips">
            {[
              { shortcut: "ALT+1", label: "I only have 10 mins", query: "I only have 10 mins" },
              { shortcut: "ALT+2", label: "Raining outside", query: "It is raining now" },
              { shortcut: "ALT+3", label: "Feeling exhausted", query: "Extreme brain fatigue" },
              { shortcut: "ALT+4", label: "Indoor only", query: "Study room indoor grounding only" },
            ].map((chip) => (
              <button
                key={chip.shortcut}
                type="button"
                disabled={isReplanning}
                onClick={() => onChange(chip.query)}
                className="px-2 py-1 bg-signal-bg border border-signal-border hover:border-signal-teal rounded text-[9.5px] font-mono text-signal-muted hover:text-signal-text transition-all duration-150 flex items-center gap-1 cursor-pointer"
                title={`Inject "${chip.query}"`}
              >
                <span className="text-[7.5px] bg-signal-raised px-1 py-0.2 rounded border border-signal-border font-bold text-signal-teal">
                  {chip.shortcut}
                </span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
