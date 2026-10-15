import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Trash2, Flame, Utensils, Calendar, TrendingUp } from "lucide-react";
import { AuthGate } from "@/components/nutrilens/AuthGate";
import { AppShell } from "@/components/nutrilens/AppShell";
import { getHistory, deleteMeal } from "@/lib/meals.functions";
import bgDining from "@/assets/bg-dining.jpg";

export const Route = createFileRoute("/history")({ component: Page });
function Page() { return <AuthGate><AppShell><History /></AppShell></AuthGate>; }

function History() {
  const fetchHistory = useServerFn(getHistory);
  const del = useServerFn(deleteMeal);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["meals", "history"], queryFn: () => fetchHistory({ data: { limit: 200 } }) });

  const meals = q.data ?? [];

  const grouped = useMemo(() => {
    return meals.reduce<Record<string, any[]>>((acc, m) => {
      const d = new Date(m.eaten_at).toDateString();
      (acc[d] ||= []).push(m);
      return acc;
    }, {});
  }, [meals]);

  const stats = useMemo(() => {
    const days = Object.keys(grouped).length;
    const totalKcal = meals.reduce((a, x) => a + (x.calories ?? 0), 0);
    const avgPerDay = days ? Math.round(totalKcal / days) : 0;
    return { days, total: meals.length, avgPerDay };
  }, [grouped, meals]);

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meals"] }),
  });

  return (
    <div className="space-y-6">
      {/* Editorial header — real photography, warm overlay */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[2rem] overflow-hidden shadow-elevated isolate"
      >
        <img src={bgDining} alt="" className="absolute inset-0 h-full w-full object-cover scale-105" loading="eager" width={1600} height={900} />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(28,20,14,0.82)_0%,rgba(28,20,14,0.5)_55%,rgba(40,26,18,0.25)_100%)]" />
        <div className="relative p-6 sm:p-9">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/65">Your journey</p>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl font-semibold tracking-tight text-cream">Meal history</h1>
          <p className="mt-2 text-sm text-cream/75 max-w-md leading-relaxed">A quiet timeline of every plate you've shared — every choice, every ritual, every small win.</p>
        </div>
      </motion.section>


      {/* Stats strip */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} className="grid grid-cols-3 gap-3">
        <StatTile icon={Calendar} label="Active days" value={stats.days} accent="var(--sage-deep)" />
        <StatTile icon={Utensils} label="Meals logged" value={stats.total} accent="#c9a36a" />
        <StatTile icon={TrendingUp} label="Avg / day" value={`${stats.avgPerDay}`} suffix="kcal" accent="var(--ember)" />
      </motion.div>

      {q.isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="glass rounded-3xl h-32 animate-pulse" />)}
        </div>
      )}

      {!q.isLoading && meals.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong rounded-3xl p-12 text-center">
          <div className="text-5xl mb-3 animate-float">🍃</div>
          <h3 className="font-display text-xl font-semibold">No story yet</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">Snap your first meal from the dashboard — your timeline begins with one bite.</p>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical spine */}
        {Object.keys(grouped).length > 0 && (
          <div aria-hidden className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-[color-mix(in_oklch,var(--sage-deep)_50%,transparent)] via-[color-mix(in_oklch,var(--sage)_30%,transparent)] to-transparent" />
        )}

        <div className="space-y-5">
          {Object.entries(grouped).map(([day, dayMeals], idx) => {
            const tot = dayMeals.reduce((a, x) => a + (x.calories ?? 0), 0);
            const protein = dayMeals.reduce((a, x) => a + Number(x.protein ?? 0), 0);
            const carbs = dayMeals.reduce((a, x) => a + Number(x.carbs ?? 0), 0);
            const fat = dayMeals.reduce((a, x) => a + Number(x.fat ?? 0), 0);
            const isToday = day === new Date().toDateString();

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.3) }}
                className="relative pl-9 sm:pl-12"
              >
                {/* Node */}
                <div className="absolute left-0 top-5 h-7 w-7 grid place-items-center">
                  <span aria-hidden className={`absolute inset-0 rounded-full ${isToday ? "bg-[color-mix(in_oklch,var(--ember)_50%,transparent)] animate-ping" : ""}`} style={{ animationDuration: "2.4s" }} />
                  <span className={`relative h-3.5 w-3.5 rounded-full ring-4 ring-[var(--cream)] ${isToday ? "bg-[var(--ember)]" : "gradient-primary"}`} />
                </div>

                <div className="glass rounded-3xl p-5 sm:p-6 hover-lift overflow-hidden relative">
                  <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[color-mix(in_oklch,var(--sage)_25%,transparent)] blur-2xl pointer-events-none" />

                  <div className="relative flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-lg">
                          {isToday ? "Today" : formatDay(day)}
                        </h3>
                        {isToday && <span className="text-[10px] uppercase tracking-widest text-[var(--ember)] font-semibold">Live</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-1.5 glass-strong rounded-full px-3 py-1.5">
                      <Flame className="h-3.5 w-3.5 text-[var(--ember)]" />
                      <span className="text-sm font-semibold">{Math.round(tot)}</span>
                      <span className="text-[11px] text-muted-foreground">kcal · {dayMeals.length} meals</span>
                    </div>
                  </div>

                  {/* Macro mini-bar */}
                  <div className="relative mt-4 h-1.5 rounded-full overflow-hidden bg-[color-mix(in_oklch,var(--mist)_60%,transparent)]">
                    {(() => {
                      const total = Math.max(1, protein * 4 + carbs * 4 + fat * 9);
                      const pP = (protein * 4) / total * 100;
                      const pC = (carbs * 4) / total * 100;
                      const pF = (fat * 9) / total * 100;
                      return (
                        <div className="flex h-full w-full">
                          <span style={{ width: `${pP}%`, background: "#c9a36a" }} />
                          <span style={{ width: `${pC}%`, background: "var(--sage-deep)" }} />
                          <span style={{ width: `${pF}%`, background: "var(--ember)" }} />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="mt-1.5 flex gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span><span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ background: "#c9a36a" }} />P {Math.round(protein)}g</span>
                    <span><span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ background: "var(--sage-deep)" }} />C {Math.round(carbs)}g</span>
                    <span><span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ background: "var(--ember)" }} />F {Math.round(fat)}g</span>
                  </div>

                  <ul className="relative mt-5 divide-y divide-border/60">
                    {dayMeals.map((m) => (
                      <li key={m.id} className="py-3 flex items-center gap-3 group">
                        <span className="text-2xl drop-shadow-sm">{m.emoji ?? "🍽️"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{m.dish_name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {m.calories} kcal · P {Math.round(Number(m.protein))} / C {Math.round(Number(m.carbs))} / F {Math.round(Number(m.fat))}
                          </p>
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {new Date(m.eaten_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <button
                          onClick={() => delMut.mutate(m.id)}
                          className="ml-1 h-8 w-8 grid place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition opacity-60 group-hover:opacity-100"
                          aria-label="Delete meal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, suffix, accent }: { icon: any; label: string; value: string | number; suffix?: string; accent: string }) {
  return (
    <div className="relative glass rounded-2xl p-3.5 sm:p-4 overflow-hidden hover-lift">
      <span aria-hidden className="absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-50" style={{ background: accent }} />
      <div className="relative flex items-center gap-2">
        <span className="h-7 w-7 grid place-items-center rounded-full" style={{ background: `color-mix(in oklch, ${accent} 18%, transparent)`, color: accent }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="relative mt-2 text-2xl font-display font-semibold tabular-nums">
        {value}
        {suffix && <span className="text-xs font-normal text-muted-foreground ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

function formatDay(d: string) {
  const date = new Date(d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.setHours(0, 0, 0, 0)) / 86400000);
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
