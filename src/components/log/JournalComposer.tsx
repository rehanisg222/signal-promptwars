import { ChangeEvent } from "react";

interface JournalComposerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function JournalComposer({
  value,
  onChange,
  error,
  disabled,
}: JournalComposerProps) {
  const charLimit = 1000;
  
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-mono font-bold text-signal-muted uppercase uppercase tracking-wider">
          Student Journal Entry <span className="text-signal-red">*</span>
        </label>
        <span
          className={`text-[10px] font-mono ${
            value.length >= 20 ? "text-signal-muted" : "text-signal-amber font-bold"
          }`}
        >
          {value.length} / {charLimit}
        </span>
      </div>

      <div className="relative" id="journal-composer-wrapper">
        <textarea
          id="journalText"
          value={value}
          onChange={handleTextChange}
          disabled={disabled}
          placeholder="Input stream of consciousness. Document revision friction, mock test scoring stress, exam day countdowns, sleeplessness, parental pressure, or avoidance thoughts... SIGNAL will trace the cognitive overload."
          className={`w-full h-40 p-4 text-base rounded-lg bg-signal-bg border focus:outline-none transition-all duration-300 resize-none font-sans placeholder:text-signal-muted/40 ${
            error
              ? "border-signal-red focus:border-signal-red focus:ring-2 focus:ring-signal-red/30"
              : "border-signal-border focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/40 focus:shadow-[0_0_15px_rgba(59,126,248,0.2)]"
          } ${disabled ? "opacity-60 cursor-not-allowed" : "text-signal-text"}`}
          autoComplete="off"
          spellCheck="false"
          aria-describedby={error ? "journal-error" : undefined}
          aria-required="true"
        />
        {value.length > 0 && value.length < 20 && (
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-signal-amber bg-signal-bg px-2 py-0.5 rounded border border-signal-border select-none uppercase">
            Min 20 chars ({20 - value.length} left)
          </div>
        )}
      </div>

      {error ? (
        <span id="journal-error" className="text-xs font-mono text-signal-red leading-relaxed select-none">
          ⚠️ {error}
        </span>
      ) : (
        <p className="text-[10px] font-mono text-signal-muted leading-relaxed select-none">
          Minimum 20 characters required. The more descriptive your entry, the cleaner your cognitive signal reads.
        </p>
      )}
    </div>
  );
}
