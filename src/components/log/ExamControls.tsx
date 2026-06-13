import { ChangeEvent } from "react";
import { ExamType } from "../../types";
import { EXAM_TYPES } from "../../lib/constants";
import { cn } from "../../utils/cn";

interface ExamControlsProps {
  examType: ExamType | null;
  onExamTypeChange: (type: ExamType) => void;
  daysToExam: number | null;
  onDaysChange: (days: number | null) => void;
  city: string;
  onCityChange: (city: string) => void;
  examTypeError?: string;
  daysError?: string;
  cityError?: string;
  disabled?: boolean;
}

export default function ExamControls({
  examType,
  onExamTypeChange,
  daysToExam,
  onDaysChange,
  city,
  onCityChange,
  examTypeError,
  daysError,
  cityError,
  disabled,
}: ExamControlsProps) {
  const handleDaysChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onDaysChange(null);
    } else {
      const parsed = parseInt(val, 10);
      onDaysChange(isNaN(parsed) ? null : parsed);
    }
  };

  const handleCityChange = (e: ChangeEvent<HTMLInputElement>) => {
    onCityChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Exam Selection - 2x3 Button Grid */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono font-bold text-signal-muted uppercase tracking-wider">
          Target Competitive Exam <span className="text-signal-red">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2" id="exam-selector-grid">
          {EXAM_TYPES.map((exam) => {
            const isSelected = examType === exam.value;
            return (
              <button
                key={exam.value}
                type="button"
                disabled={disabled}
                onClick={() => onExamTypeChange(exam.value)}
                title={exam.fullName}
                aria-label={`Target exam: ${exam.fullName}`}
                aria-selected={isSelected ? "true" : "false"}
                className={cn(
                  "py-2.5 px-2 rounded-lg border transition-all duration-200 cursor-pointer font-mono text-center flex flex-col items-center justify-center outline-none focus:ring-1 focus:ring-signal-teal",
                  isSelected
                    ? "bg-signal-teal/15 border-signal-teal text-signal-text ring-1 ring-signal-teal shadow-sm shadow-signal-teal/10"
                    : "bg-signal-bg border-signal-border text-signal-muted hover:border-signal-muted hover:text-signal-text",
                  disabled && "opacity-60 cursor-not-allowed"
                )}
              >
                <span className="text-xs font-black tracking-wider">{exam.label}</span>
              </button>
            );
          })}
        </div>
        {examType && (
          <p className="text-[10px] font-mono text-signal-teal/80 italic">
            {EXAM_TYPES.find((e) => e.value === examType)?.description}
          </p>
        )}
        {examTypeError && (
          <span className="text-xs font-mono text-signal-red leading-relaxed select-none">
            ⚠️ {examTypeError}
          </span>
        )}
      </div>

      {/* Days & Location Side by Side */}
      <div className="grid grid-cols-2 gap-3" id="exam-details-grid">
        {/* Days remaining and safety hint */}
        <div className="flex flex-col gap-2">
          <label htmlFor="daysToExam" className="text-xs font-mono font-bold text-signal-muted uppercase tracking-wider">
            Days Left <span className="text-signal-red">*</span>
          </label>
          <input
            id="daysToExam"
            type="number"
            min="0"
            max="999"
            disabled={disabled}
            value={daysToExam === null ? "" : daysToExam}
            onChange={handleDaysChange}
            placeholder="e.g. 45"
            aria-label="Days Left to Competitive Exam"
            aria-required="true"
            className={cn(
              "p-2.5 text-sm rounded-lg bg-signal-bg border focus:outline-none transition-all duration-300 font-mono text-center",
              daysError
                ? "border-signal-red focus:border-signal-red focus:ring-2 focus:ring-signal-red/30"
                : "border-signal-border focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/40 focus:shadow-[0_0_10px_rgba(59,126,248,0.1)]",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          />
          {daysError && (
            <span className="text-xs font-mono text-signal-red select-none">
              ⚠️ {daysError}
            </span>
          )}
        </div>

        {/* City Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="cityInput" className="text-xs font-mono font-bold text-signal-muted uppercase tracking-wider">
            City <span className="text-signal-red">*</span>
          </label>
          <input
            id="cityInput"
            type="text"
            disabled={disabled}
            value={city}
            onChange={handleCityChange}
            placeholder="Kota"
            aria-label="Your Current City"
            aria-required="true"
            className={cn(
              "p-2.5 text-sm rounded-lg bg-signal-bg border focus:outline-none transition-all duration-300 font-mono text-center",
              cityError
                ? "border-signal-red focus:border-signal-red focus:ring-2 focus:ring-signal-red/30"
                : "border-signal-border focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/40 focus:shadow-[0_0_10px_rgba(59,126,248,0.1)]",
              disabled && "opacity-60 cursor-not-allowed"
            )}
            autoComplete="off"
            spellCheck="false"
          />
          {cityError && (
            <span className="text-xs font-mono text-signal-red select-none">
              ⚠️ {cityError}
            </span>
          )}
        </div>
      </div>
      <p className="text-[9px] font-mono text-signal-muted leading-tight border-l border-signal-border pl-2 select-none">
        City triggers geographic Wikipedia nearby points. Negative days are normalized on submission.
      </p>
    </div>
  );
}
