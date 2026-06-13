interface ErrorStateProps {
  error: {
    code: string;
    message: string;
  };
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-signal-surface border border-signal-red/30 rounded-xl p-5 md:p-6 space-y-4 relative overflow-hidden select-none">
      {/* Absolute diagnostic title */}
      <div className="flex items-center gap-2 border-b border-signal-red/20 pb-3">
        <span className="text-lg">⚙️</span>
        <div>
          <h3 className="text-xs font-mono font-bold text-signal-red uppercase tracking-wider">
            OPERATION_LOAD_FAILED // DIAGNOSTIC_FAULT
          </h3>
          <span className="text-[8.5px] font-mono text-signal-muted uppercase uppercase tracking-wider">
            Execution Interrupted
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="p-3 bg-signal-red/5 border border-signal-red/25 rounded-lg font-mono text-xs text-signal-red leading-relaxed">
          <strong>ERROR_CODE:</strong> {error.code || "CORE_EXCEPTION"}
        </div>
        <p className="text-xs text-signal-text/90 font-mono leading-relaxed">
          {error.message || "An unexpected network or gateway interruption halted the diagnostic flow. Please verify credentials or connection settings and try again."}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full py-2.5 px-4 font-mono text-xs font-bold uppercase rounded-lg tracking-wider text-center border border-signal-red/40 text-signal-red hover:bg-signal-red/10 cursor-pointer transition-all duration-200"
        >
          🔄 RETRIGGER COGNITIVE SCAN
        </button>
      )}
    </div>
  );
}
