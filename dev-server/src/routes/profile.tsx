import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LogOut, Check, User as UserIcon, Target, HeartPulse, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/nutrilens/AuthGate";
import { AppShell } from "@/components/nutrilens/AppShell";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { CONDITION_META, calculateDailyCalories, type Condition } from "@/lib/food-db";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profile")({ component: Page });
function Page() { return <AuthGate><AppShell><Profile /></AppShell></AuthGate>; }

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getProfile);
  const update = useServerFn(updateProfile);
  const q = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });

  const [name, setName] = useState(""); const [age, setAge] = useState(30);
  const [sex, setSex] = useState<"male" | "female" | "other">("male");
  const [weight, setWeight] = useState(70); const [height, setHeight] = useState(170);
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (q.data) {
      setName(q.data.full_name ?? "");
      setAge(q.data.age ?? 30);
      setSex((q.data.sex as any) ?? "male");
      setWeight(Number(q.data.weight_kg ?? 70));
      setHeight(Number(q.data.height_cm ?? 170));
      setGoal((q.data.goal as any) ?? "maintain");
      setConditions((q.data.conditions ?? []) as Condition[]);
    }
  }, [q.data]);

  const toggle = (c: Condition) => setConditions((cs) => cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]);

  const save = async () => {
    setBusy(true);
    try {
      const daily = calculateDailyCalories({ age, sex, weight_kg: weight, height_cm: height, goal });
      await update({ data: { full_name: name, age, sex, weight_kg: weight, height_cm: height, goal, conditions, daily_calorie_goal: daily } });
      toast.success("Profile updated");
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setBusy(false); }
  };

  const daily = calculateDailyCalories({ age, sex, weight_kg: weight, height_cm: height, goal });
  const bmi = weight && height ? (weight / Math.pow(height / 100, 2)) : 0;
  const initial = (name || user?.email || "U").trim().charAt(0).toUpperCase();

  const goalCopy: Record<typeof goal, { label: string; sub: string }> = {
    lose: { label: "Lean down", sub: "Calorie deficit of ~15%" },
    maintain: { label: "Maintain", sub: "Balance with your daily burn" },
    gain: { label: "Build up", sub: "Calorie surplus of ~15%" },
  };

  return (
    <div className="space-y-6">
      {/* Hero identity card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative glass-strong rounded-[2rem] p-5 sm:p-7 overflow-hidden">
        <div aria-hidden className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[color-mix(in_oklch,var(--sage)_45%,transparent)] blur-3xl" />
        <div aria-hidden className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[color-mix(in_oklch,var(--ember)_24%,transparent)] blur-3xl" />

        <div className="relative flex items-center gap-4 sm:gap-5 flex-wrap">
          <div className="relative">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl gradient-primary grid place-items-center text-primary-foreground font-display font-semibold text-3xl sm:text-4xl shadow-glow">
              {initial}
            </div>
            <span aria-hidden className="absolute -inset-1.5 rounded-3xl bg-[color-mix(in_oklch,var(--sage)_40%,transparent)] blur-xl opacity-50 -z-10" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
            <h1 className="mt-1 text-2xl sm:text-4xl font-display font-semibold tracking-tight truncate">
              {name || "Hello, friend"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          <Pill label="Daily target" value={`${daily}`} suffix="kcal" />
          <Pill label="BMI" value={bmi ? bmi.toFixed(1) : "—"} suffix={bmi ? bmiLabel(bmi) : ""} />
          <Pill label="Conditions" value={`${conditions.length}`} suffix={conditions.length === 1 ? "tracked" : "tracked"} />
        </div>
      </motion.div>

      {/* Personal */}
      <Section icon={UserIcon} title="Personal" delay={0.06}>
        <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age"><input type="number" className="input" value={age} onChange={(e) => setAge(+e.target.value)} /></Field>
          <Field label="Sex">
            <select className="input" value={sex} onChange={(e) => setSex(e.target.value as any)}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </Field>
          <Field label="Weight (kg)"><input type="number" className="input" value={weight} onChange={(e) => setWeight(+e.target.value)} /></Field>
          <Field label="Height (cm)"><input type="number" className="input" value={height} onChange={(e) => setHeight(+e.target.value)} /></Field>
        </div>
      </Section>

      {/* Goal */}
      <Section icon={Target} title="What's the goal?" delay={0.1}>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(["lose", "maintain", "gain"] as const).map((g) => {
            const on = goal === g;
            return (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`relative rounded-2xl p-3 sm:p-4 text-left overflow-hidden transition group ${on ? "shadow-glow" : "border border-border bg-white/40 hover:bg-white/60"}`}
                style={on ? { background: "var(--gradient-primary)", color: "var(--primary-foreground)" } : undefined}
              >
                <p className="text-[10px] uppercase tracking-widest opacity-80">{g}</p>
                <p className={`mt-1 font-display font-semibold ${on ? "" : "text-foreground"}`}>{goalCopy[g].label}</p>
                <p className={`text-[10px] mt-1 leading-snug ${on ? "opacity-85" : "text-muted-foreground"}`}>{goalCopy[g].sub}</p>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-[color-mix(in_oklch,var(--sage)_12%,transparent)] px-3.5 py-2.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs text-muted-foreground">Daily target updates to <span className="font-semibold text-foreground">{daily} kcal</span></p>
        </div>
      </Section>

      {/* Conditions */}
      <Section icon={HeartPulse} title="Health conditions" delay={0.14}>
        <div className="grid sm:grid-cols-2 gap-2">
          {(Object.keys(CONDITION_META) as Condition[]).map((c) => {
            const on = conditions.includes(c); const meta = CONDITION_META[c];
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`flex items-center gap-3 rounded-2xl p-3 transition ${on ? "bg-primary/10 border border-primary/40 shadow-glow" : "border border-border bg-white/40 hover:bg-white/60"}`}
              >
                <span className="h-9 w-9 grid place-items-center rounded-2xl text-white text-base" style={{ background: meta.color }}>{meta.emoji}</span>
                <span className="flex-1 text-left text-sm font-medium">{meta.label}</span>
                {on && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-5 w-5 grid place-items-center rounded-full gradient-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-24 sm:static z-30 flex gap-3 flex-wrap">
        <button
          onClick={save}
          disabled={busy}
          className="flex-1 sm:flex-none rounded-full gradient-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-glow disabled:opacity-60 hover-lift"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={async () => { await signOut(); navigate({ to: "/" }); }}
          className="rounded-full glass-strong px-5 py-3 text-sm inline-flex items-center gap-2 hover-lift"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <style>{`.input{width:100%;border-radius:0.85rem;border:1px solid var(--border);background:color-mix(in oklch,var(--card) 60%,transparent);padding:0.7rem 0.95rem;font-size:0.875rem;outline:none;transition:border-color .2s,box-shadow .2s}.input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklch,var(--primary) 20%,transparent)}`}</style>
    </div>
  );
}

function Section({ icon: Icon, title, children, delay = 0 }: { icon: any; title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-3xl p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 grid place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="font-display font-semibold text-base">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function Pill({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="rounded-2xl bg-[color-mix(in_oklch,var(--card)_70%,transparent)] backdrop-blur px-3 py-2.5 border border-border/60">
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display font-semibold tabular-nums">
        {value}
        {suffix && <span className="text-[10px] font-normal text-muted-foreground ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "low";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "high";
  return "very high";
}
