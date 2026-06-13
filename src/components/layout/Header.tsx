import { AppRunState, LocationResult, WeatherContext, ExamType } from "../../types";

interface HeaderProps {
  runState: AppRunState;
  location: LocationResult | null;
  weather: WeatherContext | null;
  geminiConfigured: boolean;
  examType?: ExamType | null;
  daysToExam?: number | null;
}

export default function Header({
  runState,
  location,
  weather,
  geminiConfigured,
  examType,
  daysToExam,
}: HeaderProps) {
  // Check if form has been used/submitted
  const formUsed = runState === "complete" || runState === "error" || runState.startsWith("loading_");

  const getExamLabel = () => {
    if (!examType) return "NEET 2026";
    return examType.toUpperCase();
  };

  const getDaysLabel = () => {
    if (daysToExam === undefined || daysToExam === null) return "47 Days";
    return `${daysToExam} Days`;
  };

  return (
    <header id="header-bar" className="w-full h-14 border-b border-signal-border bg-signal-surface sticky top-0 z-50 px-6 flex items-center justify-between select-none">
      {/* Left section: SIGNAL wordmark */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-signal-blue animate-pulse" id="header-sigil"></span>
        <span className="text-lg font-black tracking-widest font-mono text-signal-text" id="header-wordmark">
          SIGNAL
        </span>
        <span className="hidden sm:inline-flex text-[9px] uppercase font-mono bg-signal-raised px-1.5 py-0.5 rounded border border-signal-border text-signal-muted tracking-wide" id="header-version">
          CORE CMD v1.0.0
        </span>
      </div>

      {/* Center/right section — persona badge */}
      {formUsed && (
        <div 
          id="persona-badge" 
          className="hidden md:flex items-center gap-1.5 text-xs font-mono text-signal-muted"
          aria-label="Student Persona Specimen Details"
        >
          <span className="text-signal-blue font-bold">» SPECIMEN:</span>
          <span>Aanya</span>
          <span className="text-signal-border">•</span>
          <span className="text-signal-teal font-black">{getExamLabel()}</span>
          <span className="text-signal-border">•</span>
          <span className="text-signal-amber font-bold">{getDaysLabel()}</span>
        </div>
      )}

      {/* Right widgets container */}
      <div className="flex items-center gap-4">
        {/* Weather chip at the far right of header */}
        {weather && location && (
          <div 
            id="header-weather-chip" 
            className="animate-crisis-fade-in flex items-center gap-2 bg-signal-raised border border-signal-teal/30 px-3 py-1 rounded-full text-xs font-mono text-signal-text"
            title={`Telemetry locked at ${location.name}`}
          >
            <span className="text-signal-teal font-bold">{location.name}</span>
            <span>{weather.weatherEmoji}</span>
            <span className="font-extrabold text-signal-text">{weather.temperatureCelsius}°C</span>
          </div>
        )}

        {/* Gemini status indicator */}
        <div 
          id="gemini-status-dot"
          className="group relative flex items-center"
          aria-label={geminiConfigured ? "Gemini API: Active" : "Gemini API: Not configured."}
        >
          <span 
            className={`w-2.5 h-2.5 rounded-full ${
              geminiConfigured ? "bg-signal-green" : "bg-signal-amber"
            }`}
          ></span>
          
          {/* Tooltip on hover */}
          <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-signal-raised border border-signal-border text-signal-text text-[10px] font-mono p-2 rounded whitespace-nowrap z-50 shadow-lg">
            {geminiConfigured ? "Gemini API: Active" : "Gemini API: Not configured."}
          </div>
        </div>
      </div>
    </header>
  );
}
