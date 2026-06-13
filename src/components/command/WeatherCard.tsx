import { WeatherContext } from "../../types";

interface WeatherCardProps {
  weather: WeatherContext | null;
}

export default function WeatherCard({ weather }: WeatherCardProps) {
  if (!weather) {
    return (
      <div className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden select-none">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted">
          WEATHER_SENSORS // OFFLINE
        </div>
        <div className="py-4 text-center">
          <span className="text-xl">⚠️</span>
          <h4 className="text-xs font-mono font-bold text-signal-muted mt-2 uppercase">
            Weather Stream Offline
          </h4>
          <p className="text-[10px] text-signal-muted mt-1 leading-normal">
            Failed to connect to meteorology sensors. Reset plans default to indoor grounding safely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-signal-raised border border-signal-border rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
        WEATHER_SENSORS // LOCAL_METEOROLOGY
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        {/* Left main descriptor values */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-signal-muted uppercase select-none">Current Atmosphere</span>
          <h4 className="text-base font-bold font-sans tracking-tight text-signal-text leading-tight">
            {weather.weatherDescription}
          </h4>
          <div className="pt-1">
            {weather.isIndoorWeather ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9.5px] font-mono font-black uppercase bg-signal-amber/15 text-signal-amber border border-signal-amber/35 shadow-sm">
                🔒 INDOOR-WEATHER ONLY
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9.5px] font-mono font-black uppercase bg-signal-teal/15 text-signal-teal border border-signal-teal/35 shadow-sm">
                🔓 OUTDOOR-OK
              </span>
            )}
          </div>
        </div>

        {/* Right giant visual representation units */}
        <div className="flex items-center gap-2">
          <span className="text-3xl filter drop-shadow select-none">{weather.weatherEmoji}</span>
          <div className="text-right">
            <span className="text-2xl font-black font-sans text-signal-text tracking-tighter block leading-none">
              {weather.temperatureCelsius}°C
            </span>
            <span className="text-[8.5px] font-mono text-signal-muted block select-none">
              Feels: {weather.apparentTemperatureCelsius}°C
            </span>
          </div>
        </div>
      </div>

      {/* Grid weather stats details */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-signal-border/50 font-mono text-[9px] select-none">
        <div>
          <span className="text-signal-muted block uppercase">Humidity</span>
          <span className="font-bold text-signal-text">{weather.humidity}%</span>
        </div>
        <div>
          <span className="text-signal-muted block uppercase">Rain/Precip</span>
          <span className="font-bold text-signal-text">{weather.precipitation} mm</span>
        </div>
        <div>
          <span className="text-signal-muted block uppercase">Wind Speed</span>
          <span className="font-bold text-signal-text">{weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}
