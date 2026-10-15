import { cn } from "@/lib/utils";
import type { Dish } from "@/lib/food-db";
import { healthScore, scoreLabel } from "@/lib/food-db";
import { Flame, Beef, Wheat, Droplet, Leaf, Heart } from "lucide-react";

export function ResultBento({ dish }: { dish: Dish }) {
  const score = healthScore(dish);
  const { label, tone } = scoreLabel(score);
  const macros = [
    { key: "protein", label: "Protein", value: dish.protein, color: "var(--sage-deep)", icon: Beef },
    { key: "carbs", label: "Carbs", value: dish.carbs, color: "#c9a36a", icon: Wheat },
    { key: "fat", label: "Fat", value: dish.fat, color: "#c47e6c", icon: Droplet },
  ];
  const total = dish.protein + dish.carbs + dish.fat;

  return (
    <div className="grid grid-cols-6 gap-3 sm:gap-4">
      {/* Dish name */}
      <div className="col-span-6 glass rounded-3xl p-5 sm:p-6 flex items-center gap-4">
        <div className="text-4xl sm:text-5xl">{dish.emoji}</div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Detected</p>
          <h2 className="text-xl sm:text-2xl font-semibold truncate">{dish.name}</h2>
          <p className="text-sm text-muted-foreground">{dish.servingLabel}</p>
        </div>
        <div className="ml-auto hidden sm:flex flex-wrap gap-1.5 justify-end max-w-[40%]">
          {dish.tags.map((t) => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-mist/70 text-foreground/80">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Calories - large */}
      <div className="col-span-6 sm:col-span-3 glass rounded-3xl p-5 sm:p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Flame className="h-4 w-4" /> Calories
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl sm:text-6xl font-display font-semibold tracking-tight">
            {dish.calories}
          </span>
          <span className="text-sm text-muted-foreground">kcal</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">per {dish.servingLabel}</p>
        <div
          aria-hidden
          className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full opacity-40"
          style={{ background: "radial-gradient(closest-side, var(--sage), transparent)" }}
        />
      </div>

      {/* Health Score */}
      <div className="col-span-6 sm:col-span-3 glass rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Heart className="h-4 w-4" /> Health Score
        </div>
        <div className="mt-2 flex items-center gap-5">
          <ScoreRing score={score} tone={tone} />
          <div>
            <div className="text-2xl sm:text-3xl font-semibold">{label}</div>
            <p className="text-sm text-muted-foreground max-w-[14rem]">
              Based on macro balance, fiber and calorie density.
            </p>
          </div>
        </div>
      </div>

      {/* Macro breakdown */}
      <div className="col-span-6 glass rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Macro breakdown</h3>
          <span className="text-xs text-muted-foreground">grams per serving</span>
        </div>
        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-mist/60">
          {macros.map((m) => (
            <div
              key={m.key}
              style={{ width: `${(m.value / total) * 100}%`, background: m.color }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {macros.map((m) => (
            <div key={m.key} className="rounded-2xl bg-cream/60 border border-border/60 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                {m.label}
              </div>
              <div className="mt-1.5 text-xl sm:text-2xl font-semibold">
                {m.value}<span className="text-sm font-normal text-muted-foreground">g</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fiber */}
      <div className="col-span-3 glass rounded-3xl p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Leaf className="h-4 w-4" /> Fiber
        </div>
        <div className="mt-2 text-3xl font-semibold">
          {dish.fiber}<span className="text-sm font-normal text-muted-foreground">g</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Daily goal: 25–30g</p>
      </div>

      {/* AI Note */}
      <div className="col-span-3 glass rounded-3xl p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">AI Insight</p>
        <p className="mt-1.5 text-sm leading-relaxed">{dish.notes}</p>
      </div>
    </div>
  );
}

function ScoreRing({ score, tone }: { score: number; tone: "good" | "ok" | "watch" }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const stroke =
    tone === "good" ? "var(--sage-deep)" : tone === "ok" ? "#c9a36a" : "#c47e6c";
  return (
    <div className="relative h-[88px] w-[88px] shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} stroke="var(--mist)" strokeWidth="8" fill="none" />
        <circle
          cx="40" cy="40" r={r}
          stroke={stroke} strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-xl font-semibold">{score}</span>
      </div>
    </div>
  );
}

export function EmptyState() {
  const items = [
    { label: "Calories", icon: Flame },
    { label: "Protein", icon: Beef },
    { label: "Carbs", icon: Wheat },
    { label: "Health Score", icon: Heart },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {items.map(({ label, icon: Icon }) => (
        <div key={label} className="glass rounded-3xl p-5 min-h-[120px] flex flex-col justify-between opacity-70">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Icon className="h-4 w-4" /> {label}
          </div>
          <div className="text-2xl font-display font-semibold text-muted-foreground/60">— —</div>
        </div>
      ))}
    </div>
  );
}
