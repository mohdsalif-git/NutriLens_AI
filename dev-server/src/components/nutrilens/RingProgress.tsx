export function RingProgress({
  value,
  max,
  size = 120,
  stroke = 10,
  color = "var(--sage-deep)",
  trackColor = "var(--mist)",
  label,
  sublabel,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}) {
  const pct = Math.min(value / Math.max(max, 1), 1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - pct * c;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          {label && <div className="text-xl sm:text-2xl font-semibold leading-none">{label}</div>}
          {sublabel && <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}
