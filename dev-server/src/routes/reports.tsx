import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine,
} from "recharts";
import { AuthGate } from "@/components/nutrilens/AuthGate";
import { AppShell } from "@/components/nutrilens/AppShell";
import { getAnalytics } from "@/lib/meals.functions";
import { getProfile } from "@/lib/profile.functions";
import { getAIInsight } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  Flame, Sparkles, TrendingUp, Utensils, Activity, Radio,
} from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Analytics — NutriLens" },
      { name: "description", content: "Real-time nutrition analytics for your last 30 days." },
    ],
  }),
  component: Page,
});

function Page() {
  return <AuthGate><AppShell><Analytics /></AppShell></AuthGate>;
}

type Range = 7 | 14 | 30;

function Analytics() {
  const [range, setRange] = useState<Range>(30);
  const qc = useQueryClient();
  const { user } = useAuth();

  const analyticsFn = useServerFn(getAnalytics);
  const profileFn = useServerFn(getProfile);
  const insightFn = useServerFn(getAIInsight);

  const analytics = useQuery({
    queryKey: ["analytics", range],
    queryFn: () => analyticsFn({ data: { days: range } }),
  });
  const prof = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });

  // Realtime: refresh on any meal_logs change for this user
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`meal_logs:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meal_logs", filter: `user_id=eq.${user.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["analytics"] });
          qc.invalidateQueries({ queryKey: ["meals"] });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, qc]);

  const rows = analytics.data ?? [];
  const goal = prof.data?.daily_calorie_goal ?? 2000;

  // Build daily buckets
  const days = useMemo(() => {
    const out: {
      date: string; label: string; short: string;
      kcal: number; protein: number; carbs: number; fat: number; fiber: number;
      score: number; meals: number;
    }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400_000);
      d.setHours(0, 0, 0, 0);
      const key = d.toDateString();
      const dayRows = rows.filter((m) => new Date(m.eaten_at).toDateString() === key);
      out.push({
        date: key,
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        short: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
        kcal: dayRows.reduce((a, x) => a + (x.calories ?? 0), 0),
        protein: dayRows.reduce((a, x) => a + Number(x.protein ?? 0), 0),
        carbs: dayRows.reduce((a, x) => a + Number(x.carbs ?? 0), 0),
        fat: dayRows.reduce((a, x) => a + Number(x.fat ?? 0), 0),
        fiber: dayRows.reduce((a, x) => a + Number(x.fiber ?? 0), 0),
        score: dayRows.length
          ? Math.round(dayRows.reduce((a, x) => a + (x.health_score ?? 60), 0) / dayRows.length)
          : 0,
        meals: dayRows.length,
      });
    }
    return out;
  }, [rows, range]);

  const activeDays = days.filter((d) => d.meals > 0);
  const avgKcal = activeDays.length ? Math.round(activeDays.reduce((a, x) => a + x.kcal, 0) / activeDays.length) : 0;
  const avgScore = activeDays.length ? Math.round(activeDays.reduce((a, x) => a + x.score, 0) / activeDays.length) : 0;
  const totalMeals = rows.length;
  const avgProtein = activeDays.length ? Math.round(activeDays.reduce((a, x) => a + x.protein, 0) / activeDays.length) : 0;

  // Macro distribution (kcal-weighted)
  const macroTotals = rows.reduce(
    (a, x) => ({
      protein: a.protein + Number(x.protein ?? 0),
      carbs: a.carbs + Number(x.carbs ?? 0),
      fat: a.fat + Number(x.fat ?? 0),
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );
  const macroPie = [
    { name: "Protein", value: Math.round(macroTotals.protein * 4), color: "var(--sage-deep)" },
    { name: "Carbs", value: Math.round(macroTotals.carbs * 4), color: "#c9a36a" },
    { name: "Fat", value: Math.round(macroTotals.fat * 9), color: "#c47e6c" },
  ];

  // Top dishes
  const topDishes = useMemo(() => {
    const m = new Map<string, { name: string; emoji: string; count: number; kcal: number }>();
    for (const r of rows) {
      const k = r.dish_name;
      const prev = m.get(k) ?? { name: k, emoji: r.emoji ?? "🍽", count: 0, kcal: 0 };
      prev.count += 1;
      prev.kcal += r.calories ?? 0;
      m.set(k, prev);
    }
    return [...m.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [rows]);

  // AI insight (today's snapshot)
  const todayKey = new Date().toDateString();
  const todayRows = rows.filter((r) => new Date(r.eaten_at).toDateString() === todayKey);
  const consumed = todayRows.reduce(
    (a, x) => ({
      calories: a.calories + (x.calories ?? 0),
      protein: a.protein + Number(x.protein ?? 0),
      carbs: a.carbs + Number(x.carbs ?? 0),
      fat: a.fat + Number(x.fat ?? 0),
      fiber: a.fiber + Number(x.fiber ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
  const insight = useQuery({
    queryKey: ["insight", todayKey, Math.round(consumed.calories)],
    queryFn: () => insightFn({
      data: {
        conditions: prof.data?.conditions ?? [],
        dailyGoal: goal,
        consumed,
        recentDishes: todayRows.map((r) => r.dish_name),
      },
    }),
    enabled: !!prof.data,
    staleTime: 60_000,
  });

  // Streak heatmap (last 12 weeks)
  const heat = useMemo(() => {
    const weeks = 12;
    const cells: { date: string; meals: number; kcal: number; intensity: number }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    // start at the Sunday of (today - weeks*7 + 1)
    const start = new Date(today.getTime() - (weeks * 7 - 1) * 86400_000);
    start.setDate(start.getDate() - start.getDay());
    const max = Math.max(1, ...rows.map((r) => r.calories ?? 0));
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start.getTime() + i * 86400_000);
      const key = d.toDateString();
      const dayRows = rows.filter((m) => new Date(m.eaten_at).toDateString() === key);
      const kcal = dayRows.reduce((a, x) => a + (x.calories ?? 0), 0);
      cells.push({
        date: key,
        meals: dayRows.length,
        kcal,
        intensity: Math.min(1, kcal / (goal || max)),
      });
    }
    return cells;
  }, [rows, goal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" /> Live · last {range} days
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Your nutrition story</h1>
        </div>
        <div className="glass-strong rounded-full p-1 flex text-sm">
          {[7, 14, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as Range)}
              className={`px-4 py-1.5 rounded-full transition ${
                range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={TrendingUp} label="Avg calories" value={avgKcal} unit="kcal/day" tone="sage" />
        <Kpi icon={Sparkles} label="Health score" value={avgScore} unit="/ 100" tone="gold" />
        <Kpi icon={Flame} label="Streak" value={prof.data?.streak_days ?? 0} unit="days" tone="ember" />
        <Kpi icon={Utensils} label="Meals logged" value={totalMeals} unit="total" tone="slate" />
      </div>

      {/* Calories area chart */}
      <Card title="Calories vs. goal" subtitle={`Daily intake against your ${goal} kcal target`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={days} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="kcalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--sage-deep)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--sage-deep)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={range === 30 ? 4 : range === 14 ? 1 : 0} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={48} />
              <Tooltip content={<ChartTip unit="kcal" />} />
              <ReferenceLine y={goal} stroke="#c47e6c" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="kcal" stroke="var(--sage-deep)" strokeWidth={2.5} fill="url(#kcalGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Macros + Pie */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card title="Macro split per day" subtitle="Protein · Carbs · Fat (grams)">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={days} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={range === 30 ? 4 : range === 14 ? 1 : 0} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<ChartTip unit="g" />} />
                  <Bar dataKey="protein" stackId="m" fill="var(--sage-deep)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="carbs" stackId="m" fill="#c9a36a" />
                  <Bar dataKey="fat" stackId="m" fill="#c47e6c" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Legend items={[
              { color: "var(--sage-deep)", label: `Protein · avg ${avgProtein}g` },
              { color: "#c9a36a", label: "Carbs" },
              { color: "#c47e6c", label: "Fat" },
            ]} />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Energy mix" subtitle="Share of calories by macro">
            <div className="h-60 grid place-items-center">
              {macroPie.every((m) => m.value === 0) ? (
                <p className="text-sm text-muted-foreground">Log meals to see your mix.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={macroPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} stroke="none">
                      {macroPie.map((m) => <Cell key={m.name} fill={m.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTip unit="kcal" />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-3 text-xs">
              {macroPie.map((m) => (
                <span key={m.name} className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} /> {m.name}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* AI insight */}
      <Card
        title="AI insight for today"
        subtitle={insight.data?.source === "ai" ? "Personalised by NutriLens AI" : "Smart suggestion"}
        accent
      >
        <div className="flex gap-4 items-start">
          <div className="h-11 w-11 rounded-2xl grid place-items-center shrink-0"
            style={{ background: "linear-gradient(135deg, var(--sage-deep), #c9a36a)" }}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <p className="text-base sm:text-lg leading-relaxed">
            {insight.isLoading ? "Thinking through your day…" : insight.data?.text ?? "Log a meal to unlock your first insight."}
          </p>
        </div>
      </Card>

      {/* Heatmap + Top dishes */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card title="Consistency map" subtitle="12 weeks · darker = closer to goal">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <div className="grid grid-rows-7 gap-1 text-[10px] text-muted-foreground pr-1 pt-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="h-3 leading-3">{i % 2 ? d : ""}</span>
                ))}
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {heat.map((c, i) => (
                  <div
                    key={i}
                    title={`${c.date} · ${c.meals} meals · ${c.kcal} kcal`}
                    className="h-3 w-3 rounded-[3px] transition"
                    style={{
                      background: c.meals === 0
                        ? "color-mix(in oklch, var(--muted) 70%, transparent)"
                        : `color-mix(in oklch, var(--sage-deep) ${20 + c.intensity * 75}%, transparent)`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              {[0.15, 0.35, 0.55, 0.8, 1].map((v) => (
                <span key={v} className="h-3 w-3 rounded-[3px]"
                  style={{ background: `color-mix(in oklch, var(--sage-deep) ${20 + v * 75}%, transparent)` }} />
              ))}
              <span>More</span>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Top dishes" subtitle="What you reach for most">
            {topDishes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nothing logged yet.</p>
            ) : (
              <ul className="space-y-2">
                {topDishes.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/40 transition">
                    <span className="h-9 w-9 grid place-items-center rounded-xl bg-muted text-lg">{d.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.count}× · {Math.round(d.kcal / d.count)} kcal avg</p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">#{i + 1}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Score trend */}
      <Card title="Health score trend" subtitle="Higher is better">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={days} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a36a" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#c9a36a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={range === 30 ? 4 : range === 14 ? 1 : 0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={36} />
              <Tooltip content={<ChartTip unit="/ 100" />} />
              <Area type="monotone" dataKey="score" stroke="#c9a36a" strokeWidth={2.5} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* ---------- UI bits ---------- */

function Kpi({ icon: Icon, label, value, unit, tone }: {
  icon: any; label: string; value: string | number; unit: string;
  tone: "sage" | "gold" | "ember" | "slate";
}) {
  const bg = { sage: "var(--sage-deep)", gold: "#c9a36a", ember: "#c47e6c", slate: "#5b6470" }[tone];
  return (
    <div className="glass rounded-3xl p-4 sm:p-5 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10" style={{ background: bg }} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-7 w-7 grid place-items-center rounded-lg text-white" style={{ background: bg }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-2 text-2xl sm:text-3xl font-semibold tabular-nums">
        {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children, accent }: {
  title: string; subtitle?: string; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <section className={`glass rounded-3xl p-5 sm:p-6 ${accent ? "ring-1 ring-[color:var(--sage-deep)]/30" : ""}`}>
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {accent && <Activity className="h-4 w-4 text-[color:var(--sage-deep)]" />}
      </div>
      {children}
    </section>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} /> {i.label}
        </span>
      ))}
    </div>
  );
}

function ChartTip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-elevated">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey ?? p.name} className="flex items-center gap-2 tabular-nums">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}</span>
          <span className="font-semibold">{Math.round(p.value)} {unit}</span>
        </p>
      ))}
    </div>
  );
}


