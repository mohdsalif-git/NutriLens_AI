import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Flame, Beef, Wheat, Droplet, Leaf, Sparkles, Plus, Trash2, Flame as FireIcon } from "lucide-react";

import { AuthGate } from "@/components/nutrilens/AuthGate";
import { AppShell } from "@/components/nutrilens/AppShell";
import { UploadCard } from "@/components/nutrilens/UploadCard";
import bgThali from "@/assets/bg-hero-thali.jpg";
import bgIngredients from "@/assets/bg-ingredients.jpg";
import bgDining from "@/assets/bg-dining.jpg";
import { ResultBento } from "@/components/nutrilens/Bento";
import { RingProgress } from "@/components/nutrilens/RingProgress";
import { ConditionWarnings } from "@/components/nutrilens/ConditionWarnings";
import {
  DISHES, pickRandomDish, healthScore, warningsForDish, suggestNextMeal,
  type Dish, type Condition,
} from "@/lib/food-db";
import { getProfile } from "@/lib/profile.functions";
import { logMeal, getTodayMeals, deleteMeal } from "@/lib/meals.functions";
import { getAIInsight } from "@/lib/ai.functions";

export const Route = createFileRoute("/dashboard")({ component: Page });
function Page() { return <AuthGate><AppShell><Dashboard /></AppShell></AuthGate>; }

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const fetchToday = useServerFn(getTodayMeals);
  const log = useServerFn(logMeal);
  const del = useServerFn(deleteMeal);
  const aiFn = useServerFn(getAIInsight);

  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const todayQ = useQuery({ queryKey: ["meals", "today"], queryFn: () => fetchToday() });

  // Redirect to onboarding if needed
  useEffect(() => {
    if (profileQ.data && profileQ.data.onboarded === false) navigate({ to: "/onboarding" });
  }, [profileQ.data, navigate]);

  const profile = profileQ.data;
  const conditions = (profile?.conditions ?? []) as Condition[];
  const goal = profile?.daily_calorie_goal ?? 2000;

  const totals = useMemo(() => {
    const m = todayQ.data ?? [];
    return {
      calories: m.reduce((a, x) => a + (x.calories ?? 0), 0),
      protein: m.reduce((a, x) => a + Number(x.protein ?? 0), 0),
      carbs: m.reduce((a, x) => a + Number(x.carbs ?? 0), 0),
      fat: m.reduce((a, x) => a + Number(x.fat ?? 0), 0),
      fiber: m.reduce((a, x) => a + Number(x.fiber ?? 0), 0),
    };
  }, [todayQ.data]);

  // Detection state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dish, setDish] = useState<Dish | null>(null);
  const urlRef = useRef<string | null>(null);
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const onPick = (file: File) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file); urlRef.current = url;
    setImageUrl(url); setDish(null); setAnalyzing(true);
    const seed = [...file.name].reduce((a, c) => a + c.charCodeAt(0), 0);
    setTimeout(() => { const d = pickRandomDish(seed); setDish(d); setAnalyzing(false); toast.success(`Detected: ${d.name}`); }, 1300);
  };
  const onClear = () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); urlRef.current = null; setImageUrl(null); setDish(null); };

  const tryDemo = () => {
    setDish(null); setAnalyzing(true); setImageUrl("/placeholder.svg");
    setTimeout(() => { setDish(DISHES[0]); setAnalyzing(false); }, 900);
  };

  const logMutation = useMutation({
    mutationFn: (d: Dish) => log({
      data: {
        dish_id: d.id, dish_name: d.name, emoji: d.emoji,
        calories: d.calories, protein: d.protein, carbs: d.carbs, fat: d.fat, fiber: d.fiber,
        health_score: healthScore(d),
      },
    }),
    onSuccess: () => {
      toast.success("Meal logged");
      qc.invalidateQueries({ queryKey: ["meals"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      onClear();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not log meal"),
  });

  const delMutation = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meals"] }),
  });

  const dishWarnings = dish ? warningsForDish(dish, conditions) : [];

  // AI insight (refreshes when totals change significantly)
  const aiQ = useQuery({
    queryKey: ["ai-insight", goal, conditions.join(","), Math.round(totals.calories / 100), (todayQ.data ?? []).length],
    queryFn: () => aiFn({
      data: {
        conditions, dailyGoal: goal, consumed: totals,
        recentDishes: (todayQ.data ?? []).map((m) => m.dish_name).slice(0, 5),
      },
    }),
    enabled: !!profile,
    staleTime: 60_000,
  });

  const suggestion = useMemo(
    () => suggestNextMeal(conditions, Math.max(150, goal - totals.calories)),
    [conditions, goal, totals.calories],
  );

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Cinematic hero — greeting + intake */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[2rem] overflow-hidden shadow-elevated isolate"
      >
        <div className="absolute inset-0 -z-10">
          <img src={bgThali} alt="" className="h-full w-full object-cover scale-105" />
          {/* Warm editorial overlay — natural shadow, no synthetic glow */}
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(28,20,14,0.82)_0%,rgba(28,20,14,0.55)_45%,rgba(40,26,18,0.35)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(15,10,6,0.55),transparent_60%)]" />
        </div>

        <div className="relative p-6 sm:p-9">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/60">{greeting()} · {new Date().toLocaleDateString(undefined, { weekday: "long" })}</p>
              <h1 className="mt-2 font-display text-3xl sm:text-5xl font-semibold tracking-tight text-cream">
                Hi {firstName} <span className="inline-block animate-float">🌿</span>
              </h1>
              <p className="mt-2 text-sm text-cream/70 max-w-md">Your nutrition intelligence is ready. Here's where today stands.</p>
            </div>
            <div className="glass-strong rounded-full pl-3 pr-4 py-2 flex items-center gap-2 bg-white/10 border-white/20 text-cream">
              <span className="h-6 w-6 grid place-items-center rounded-full bg-[color-mix(in_oklch,var(--ember)_45%,transparent)]">
                <FireIcon className="h-3.5 w-3.5 text-[var(--ember)]" />
              </span>
              <span className="text-sm font-semibold">{profile?.streak_days ?? 0}</span>
              <span className="text-xs text-cream/70">day streak</span>
            </div>
          </div>

          <div className="mt-7 grid sm:grid-cols-[1.1fr_1fr] gap-6 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-cream/55">Today's intake</p>
              <h2 className="mt-1 text-4xl sm:text-5xl font-display font-semibold text-cream">
                {Math.round(totals.calories)}
                <span className="text-base font-normal text-cream/60"> / {goal} kcal</span>
              </h2>
              <p className="text-xs text-cream/60 mt-1">
                {Math.max(0, goal - Math.round(totals.calories))} kcal remaining today
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                <DarkStat icon={Beef} label="Protein" value={`${Math.round(totals.protein)}g`} />
                <DarkStat icon={Wheat} label="Carbs" value={`${Math.round(totals.carbs)}g`} />
                <DarkStat icon={Droplet} label="Fat" value={`${Math.round(totals.fat)}g`} />
                <DarkStat icon={Leaf} label="Fiber" value={`${Math.round(totals.fiber)}g`} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 place-items-center">
              <RingProgress value={totals.calories} max={goal} label={`${Math.round((totals.calories / goal) * 100)}%`} sublabel="Calories" color="var(--sage)" trackColor="rgba(255,255,255,0.12)" />
              <RingProgress value={totals.protein} max={Math.max(60, Math.round((goal * 0.25) / 4))} label={`${Math.round(totals.protein)}`} sublabel="Protein g" color="#e8b07a" trackColor="rgba(255,255,255,0.12)" />
              <RingProgress value={totals.fiber} max={28} label={`${Math.round(totals.fiber)}`} sublabel="Fiber g" color="#a8d8a0" trackColor="rgba(255,255,255,0.12)" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* AI Insight + Suggestion */}
      <div className="grid sm:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="sm:col-span-3 relative glass rounded-3xl p-5 sm:p-6 hover-lift overflow-hidden">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <div className="relative flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-6 w-6 grid place-items-center rounded-full gradient-primary text-primary-foreground">
              <Sparkles className="h-3 w-3" />
            </span>
            AI Coach
          </div>
          <p className="relative mt-3 text-base sm:text-lg leading-relaxed">
            {aiQ.isLoading ? <span className="text-muted-foreground">Thinking about your day…</span> : aiQ.data?.text ?? "Keep going, you're doing great."}
          </p>
          {aiQ.data?.source === "ai" && (
            <span className="relative mt-3 inline-block text-[10px] uppercase tracking-widest text-primary">Powered by Lovable AI</span>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="sm:col-span-2 glass rounded-3xl p-5 sm:p-6 hover-lift">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" /> Next meal
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="text-4xl drop-shadow-sm">{suggestion.emoji}</div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{suggestion.name}</p>
              <p className="text-xs text-muted-foreground">{suggestion.calories} kcal · {suggestion.servingLabel}</p>
            </div>
          </div>
          <button onClick={() => logMutation.mutate(suggestion)} className="mt-4 w-full rounded-full gradient-primary text-primary-foreground text-xs font-medium px-3 py-2.5 inline-flex items-center justify-center gap-1 hover-lift">
            <Plus className="h-3.5 w-3.5" /> Log this meal
          </button>
        </motion.div>
      </div>


      {/* Editorial ingredients strip — warm, organic, breaks the dashboard grid */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7 }}
        className="relative grid sm:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-5"
      >
        <figure className="relative rounded-[2rem] overflow-hidden shadow-elevated group">
          <img src={bgIngredients} alt="Whole spices and ingredients on a walnut table" loading="lazy" width={1600} height={900} className="h-56 sm:h-72 w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(22,14,8,0.78)_100%)]" />
          <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cream/70">Whole · Unprocessed · Yours</p>
            <p className="mt-1.5 font-display text-xl sm:text-2xl text-cream leading-snug max-w-md">
              Real food, recognised. From turmeric root to tempered ghee — every ingredient on your plate, understood.
            </p>
          </figcaption>
        </figure>
        <figure className="relative rounded-[2rem] overflow-hidden shadow-elevated group">
          <img src={bgDining} alt="A shared Indian meal in warm afternoon light" loading="lazy" width={1600} height={900} className="h-56 sm:h-72 w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,14,8,0.15)_0%,rgba(22,14,8,0.85)_100%)]" />
          <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cream/70">A quiet ritual</p>
            <p className="mt-1.5 font-display text-base sm:text-lg text-cream/95 italic leading-relaxed">
              "Eating well isn't restriction — it's remembering what nourishment feels like."
            </p>
          </figcaption>
        </figure>
      </motion.section>

      {/* Upload */}
      <UploadCard imageUrl={imageUrl} analyzing={analyzing} onPick={onPick} onClear={onClear} />
      {!imageUrl && !dish && (
        <button onClick={tryDemo} className="text-sm font-medium text-primary hover:underline">
          Try a sample meal →
        </button>
      )}

      {dish && (
        <div className="space-y-4">
          <ResultBento dish={dish} />
          {dishWarnings.length > 0 && <ConditionWarnings warnings={dishWarnings} />}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => logMutation.mutate(dish)}
              disabled={logMutation.isPending}
              className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {logMutation.isPending ? "Logging…" : "Log this meal"}
            </button>
            <button onClick={onClear} className="rounded-full border px-5 py-2.5 text-sm">Discard</button>
          </div>
        </div>
      )}

      {/* Today's meals */}
      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Today's meals</h3>
          <span className="text-xs text-muted-foreground">{(todayQ.data ?? []).length} logged</span>
        </div>
        {todayQ.isLoading && <p className="text-sm text-muted-foreground mt-3">Loading…</p>}
        {(todayQ.data ?? []).length === 0 && !todayQ.isLoading && (
          <p className="text-sm text-muted-foreground mt-3">No meals yet — snap your first plate above.</p>
        )}
        <ul className="mt-4 divide-y divide-border">
          {(todayQ.data ?? []).map((m) => (
            <li key={m.id} className="py-3 flex items-center gap-3">
              <span className="text-2xl">{m.emoji ?? "🍽️"}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{m.dish_name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.calories} kcal · P {Math.round(Number(m.protein))} / C {Math.round(Number(m.carbs))} / F {Math.round(Number(m.fat))}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(m.eaten_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <button onClick={() => delMutation.mutate(m.id)} className="ml-2 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-mist/50 px-3 py-1.5 text-xs">
      <Icon className="h-3 w-3" /> <span className="text-muted-foreground">{label}</span> <span className="font-semibold">{value}</span>
    </div>
  );
}

function DarkStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur px-3 py-1.5 text-xs text-cream">
      <Icon className="h-3 w-3 text-[color:var(--sage)]" /> <span className="text-cream/65">{label}</span> <span className="font-semibold">{value}</span>
    </div>
  );
}
void MiniStat;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// avoid unused import lint
void Flame;
