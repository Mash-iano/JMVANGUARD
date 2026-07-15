import { useEffect, useState } from "react";

// 2027 Kenyan General Election: 10 August 2027, 06:00 EAT (UTC+3)
const ELECTION_TS = Date.UTC(2027, 7, 10, 3, 0, 0);

function diff(now: number) {
  const ms = Math.max(0, ELECTION_TS - now);
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function Countdown({ compact = false }: { compact?: boolean }) {
  // Hydration-safe: start static, then tick.
  const [t, setT] = useState(() => diff(ELECTION_TS));
  useEffect(() => {
    setT(diff(Date.now()));
    const id = setInterval(() => setT(diff(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  const units: [string, number][] = [
    ["Days", t.days],
    ["Hours", t.hours],
    ["Minutes", t.minutes],
    ["Seconds", t.seconds],
  ];

  return (
    <div
      className={
        compact
          ? "flex items-stretch gap-2"
          : "grid grid-cols-4 gap-3 sm:gap-4"
      }
      role="timer"
      aria-label="Countdown to the 2027 Kenyan General Election"
    >
      {units.map(([label, value]) => (
        <div
          key={label}
          className="solid-card px-3 py-3 sm:px-5 sm:py-4 text-center border-2"
        >
          <div className="font-display text-2xl sm:text-4xl font-bold text-amber tabular-nums">
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
