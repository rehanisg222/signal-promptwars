import { CRISIS_HELPLINES } from "../../utils/helplines";

export default function CrisisSafetyPanel() {
  return (
    <div 
      className="bg-[#1C1212] border border-signal-red/30 border-l-8 border-l-signal-red rounded-xl p-6 md:p-8 space-y-6 animate-crisis-fade-in shadow-xl shadow-signal-red/5"
      id="critical-helpline-panel"
      role="alert"
      aria-live="assertive"
    >
      {/* Absolute Emergency Header */}
      <div className="flex items-center gap-3 border-b border-signal-red/20 pb-4">
        <span className="text-3xl select-none" aria-hidden="true">🚨</span>
        <div>
          <h2 className="text-xs font-mono font-black text-signal-red uppercase tracking-widest">
            CRITICAL EMERGENCY DECK // LOCKED SYSTEM FLOW
          </h2>
          <span className="text-[10px] font-mono text-signal-muted uppercase select-none">
            Cognitive Distress Level Over Capacity
          </span>
        </div>
      </div>

      {/* Hero headline message */}
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-sans font-black text-signal-text tracking-tight uppercase leading-tight" id="crisis-banner-title">
          You don't have to carry this alone.
        </h1>
        <p className="text-sm text-signal-text/90 leading-relaxed font-sans">
          SIGNAL has identified severe distress indicators or sensitive crisis markers in your log. We have locked all standard scheduling features to prioritize your safety and immediate care.
        </p>
        <div className="p-4 bg-signal-red/10 border border-signal-red/30 rounded-lg text-xs leading-relaxed text-signal-red font-mono font-bold">
          ⚠️ STATEMENT OF DISCLOSURE: SIGNAL is automated software and is NOT a crisis intervention service. SIGNAL does not provide clinical counseling, psychiatric therapy, or emergency triage.
        </div>
      </div>

      {/* Real verified Indian emergency contacts list */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-mono font-black text-signal-muted uppercase tracking-wider select-none">
          Immediate Emergency Support Helplines (India)
        </h3>
        
        <div className="grid grid-cols-1 gap-3" id="helplines-button-grid">
          {CRISIS_HELPLINES.map((helpline) => (
            <div
              key={helpline.name}
              className="bg-signal-bg border border-signal-border p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono transition-all duration-300 hover:border-signal-red/50 hover:bg-signal-raised"
            >
              <div className="space-y-1">
                <span className="text-sm font-black text-signal-text block uppercase tracking-wide">
                  {helpline.name}
                </span>
                <span className="text-[10px] text-signal-muted block select-none uppercase">
                  ACTIVE: {helpline.available}
                </span>
              </div>
              <a
                href={`tel:${helpline.number}`}
                aria-label={`Call ${helpline.name} crisis helpline at ${helpline.number}`}
                className="text-base font-sans font-black bg-signal-red hover:bg-[#D03030] text-white py-2.5 px-5 rounded-lg text-center cursor-pointer transition-all duration-200 select-all shadow-md shadow-signal-red/20 outline-none focus:ring-2 focus:ring-white shrink-0"
              >
                CALL {helpline.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Supporting non-therapeutic instructions or guidelines */}
      <div className="pt-4 border-t border-signal-border/50 text-xs font-sans text-signal-muted leading-relaxed space-y-2 select-none">
        <p className="font-bold">Immediate safety actions recommended:</p>
        <ul className="list-disc pl-5 space-y-1 text-signal-muted">
          <li>Close your study books, papers, and exam preparation material.</li>
          <li>Step outside of your active studying area or room immediately.</li>
          <li>Inform a parent, trusted sibling, close friend, or nearby guardian of how you are feeling.</li>
          <li>You are highly valued and support is available at any hour of the day.</li>
        </ul>
      </div>
    </div>
  );
}
