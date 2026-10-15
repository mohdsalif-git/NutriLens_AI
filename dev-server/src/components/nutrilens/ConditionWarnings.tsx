import { CONDITION_META, type Condition, type Warning } from "@/lib/food-db";
import { AlertTriangle, Check } from "lucide-react";

export function ConditionWarnings({ warnings }: { warnings: Warning[] }) {
  if (!warnings.length) return null;
  return (
    <div className="space-y-2">
      {warnings.map((w, i) => {
        const meta = CONDITION_META[w.condition as Condition];
        const isWarn = w.level === "warn";
        return (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl p-3 border"
            style={{
              background: isWarn ? "color-mix(in oklch, #c47e6c 14%, transparent)" : "color-mix(in oklch, var(--sage) 18%, transparent)",
              borderColor: isWarn ? "color-mix(in oklch, #c47e6c 30%, transparent)" : "color-mix(in oklch, var(--sage-deep) 30%, transparent)",
            }}
          >
            <div className="mt-0.5 h-7 w-7 rounded-full grid place-items-center shrink-0" style={{ background: meta.color, color: "white" }}>
              {isWarn ? <AlertTriangle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </div>
            <div className="text-sm leading-relaxed">
              <span className="font-medium">{meta.label}: </span>
              <span className="text-foreground/80">{w.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
