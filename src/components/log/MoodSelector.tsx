import { MoodState } from "../../types";
import { MOOD_STATES } from "../../lib/constants";
import { cn } from "../../utils/cn";

interface MoodSelectorProps {
  selected: MoodState | null;
  onSelect: (mood: MoodState) => void;
  error?: string;
  disabled?: boolean;
}

export default function MoodSelector({
  selected,
  onSelect,
  error,
  disabled,
}: MoodSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-mono font-bold text-signal-muted uppercase tracking-wider">
          Initial Mood State <span className="text-signal-red">*</span>
        </label>
        {selected && (
          <span className="text-[10px] font-mono text-signal-blue uppercase font-bold">
            {selected}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" id="mood-selector-grid">
        {MOOD_STATES.map((mood) => {
          const isSelected = selected === mood.value;
          return (
            <button
              key={mood.value}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(mood.value)}
              title={mood.description}
              aria-label={`Select mood: ${mood.label}. ${mood.description}`}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-all duration-150 cursor-pointer font-sans text-center outline-none focus:ring-1 focus:ring-signal-blue",
                isSelected
                  ? "bg-signal-blue/15 border-signal-blue text-signal-text ring-1 ring-signal-blue shadow-md"
                  : "bg-signal-bg border-signal-border text-signal-muted hover:border-signal-muted hover:text-signal-text",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              <span className="text-2xl mb-1 filter drop-shadow select-none">{mood.emoji}</span>
              <span className="text-[10px] font-mono font-bold tracking-tight uppercase">{mood.label}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="text-[10px] font-mono text-signal-blue/80 italic">
          "{MOOD_STATES.find((m) => m.value === selected)?.description}"
        </p>
      )}

      {error && (
        <span className="text-xs font-mono text-signal-red leading-relaxed select-none">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
}
