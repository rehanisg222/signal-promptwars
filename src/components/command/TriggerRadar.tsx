import { useEffect, useState, useRef } from "react";
import { TRIGGER_DOMAIN_LABELS } from "../../lib/constants";
import { TriggerDomains } from "../../types";

interface TriggerRadarProps {
  triggerDomains: TriggerDomains | null;
}

const TRIGGER_RADAR_ANIMATION_MS = 600;

export default function TriggerRadar({ triggerDomains }: TriggerRadarProps) {
  // Center coordinates and radar radius
  const cx = 100;
  const cy = 100;
  const r = 60;

  // Axes definition in circular order
  const axes: (keyof TriggerDomains)[] = [
    "pre_test_dread",
    "sleep_disruption",
    "social_pressure",
    "academic_shame",
    "avoidance",
    "existential_dread",
  ];

  // Store previous scores to animate from them on update
  const prevScoresRef = useRef<number[]>([0, 0, 0, 0, 0, 0]);
  const [animatedScores, setAnimatedScores] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const targetScores = axes.map((key) =>
    triggerDomains ? (triggerDomains[key] ?? 0) : 0
  );

  useEffect(() => {
    const startValues = [...prevScoresRef.current];
    const endValues = targetScores;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / TRIGGER_RADAR_ANIMATION_MS, 1);
      
      const current = startValues.map((start, idx) => {
        const end = endValues[idx];
        return start + progress * (end - start);
      });

      setAnimatedScores(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        prevScoresRef.current = [...endValues];
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [triggerDomains]);

  // Calculate coordinates for a specific value scale (0 to 10) along axis index i
  const getCoordinates = (index: number, score: number) => {
    // 6 axes, spacing is 60 degrees (Math.PI / 3)
    // Starting straight up: -Math.PI / 2
    const angle = -Math.PI / 2 + index * (Math.PI / 3);
    const distance = (score / 10) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  // Outer labels alignment helper
  const getLabelAnchor = (index: number) => {
    if (index === 0 || index === 3) return "middle";
    if (index === 1 || index === 2) return "start";
    return "end";
  };

  const getLabelYOffset = (index: number) => {
    if (index === 0) return -8;
    if (index === 3) return 14;
    return 4;
  };

  // Generate background hexagon path strings
  const generateHexagonPoints = (scale: number) => {
    const points = axes.map((_, i) => {
      const { x, y } = getCoordinates(i, scale);
      return `${x},${y}`;
    });
    return points.join(" ");
  };

  // Generate the active path points based on animated scores
  const activePoints = axes
    .map((_, i) => {
      const score = animatedScores[i] ?? 0;
      const { x, y } = getCoordinates(i, score);
      return `${x},${y}`;
    })
    .join(" ");

  if (!triggerDomains) {
    return (
      <div id="trigger-radar-null" className="bg-signal-raised border border-signal-border rounded-xl p-5 flex flex-col items-center justify-center relative overflow-hidden min-h-[280px]">
        <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
          TRIGGER_RADAR // INTENSITY_MATRIX
        </div>
        <div className="w-[180px] h-[180px] flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible opacity-35">
            {/* Hexagon concentric grids */}
            {[2, 4, 6, 8, 10].map((scale) => (
              <polygon
                key={scale}
                points={generateHexagonPoints(scale)}
                className="fill-none stroke-signal-border"
                strokeWidth="0.75"
                strokeDasharray="2,2"
              />
            ))}
            {/* Radial lines */}
            {axes.map((_, i) => {
              const outer = getCoordinates(i, 10);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  className="stroke-signal-border"
                  strokeWidth="0.75"
                />
              );
            })}
          </svg>
        </div>
        <span className="text-[10px] font-mono text-signal-muted mt-2 select-none">
          No signal data yet
        </span>
      </div>
    );
  }

  return (
    <div id="trigger-radar" className="bg-signal-raised border border-signal-border rounded-xl p-5 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-2 left-2 text-[8px] font-mono text-signal-muted select-none">
        TRIGGER_RADAR // INTENSITY_MATRIX
      </div>

      <div className="w-full max-w-[280px] aspect-square mt-4" id="radar-container-box">
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          {/* Hexagon concentric grids */}
          {[2, 4, 6, 8, 10].map((scale) => (
            <polygon
              key={scale}
              points={generateHexagonPoints(scale)}
              className="fill-none stroke-signal-border/40"
              strokeWidth="0.75"
              strokeDasharray={scale === 10 ? "none" : "3,3"}
            />
          ))}

          {/* Radial Axis line grids */}
          {axes.map((_, i) => {
            const outer = getCoordinates(i, 10);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                className="stroke-signal-border/40"
                 strokeWidth="0.75"
              />
            );
          })}

          {/* Core Score Polygon Area with Pulsing Scale animation */}
          <polygon
            points={activePoints}
            className="fill-signal-teal/25 stroke-signal-teal/80 origin-center animate-radar-pulse"
            strokeWidth="2.5"
            id="radar-polygon-overlay"
          />

          {/* Little bullet pins on points */}
          {axes.map((_, i) => {
            const score = animatedScores[i] ?? 0;
            const { x, y } = getCoordinates(i, score);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3.5"
                className="fill-signal-teal stroke-signal-raised"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Axis Labels */}
          {axes.map((key, i) => {
            const labelCoord = getCoordinates(i, 11.5); // place slightly further out
            const words = TRIGGER_DOMAIN_LABELS[key]?.split(" ") || [key];
            return (
              <text
                key={key}
                x={labelCoord.x}
                y={labelCoord.y + getLabelYOffset(i)}
                textAnchor={getLabelAnchor(i)}
                className="text-[6.5px] font-mono fill-signal-muted uppercase tracking-tight select-none"
              >
                {words.map((word, wordIdx) => (
                  <tspan
                    key={wordIdx}
                    x={labelCoord.x}
                    dy={wordIdx > 0 ? "8" : "0"}
                  >
                    {word}
                  </tspan>
                ))}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Domain score legends */}
      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5 mt-5 font-mono text-[9px] pt-4 border-t border-signal-border/50 select-none">
        {axes.map((key, i) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-signal-muted flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 bg-signal-teal/60 rounded-full shrink-0"></span>
              {TRIGGER_DOMAIN_LABELS[key]}
            </span>
            <span className="text-signal-text font-black shrink-0">
              {triggerDomains[key] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
