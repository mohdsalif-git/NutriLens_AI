import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Leaf, Check, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/nutrilens/AuthGate";
import { updateProfile } from "@/lib/profile.functions";
import { CONDITION_META, calculateDailyCalories, type Condition } from "@/lib/food-db";
import bgLifestyle from "@/assets/bg-lifestyle.jpg";

export const Route = createFileRoute("/onboarding")({ component: Page });

function Page() {
  return <AuthGate><Onboarding /></AuthGate>;
}

function Onboarding() {
  const navigate = useNavigate();
  const update = useServerFn(updateProfile);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(30);
  const [sex, setSex] = useState<"male" | "female" | "other">("male");
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [busy, setBusy] = useState(false);

  const toggleCond = (c: Condition) =>
    setConditions((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const finish = async () => {
    setBusy(true);
    try {
      const daily = calculateDailyCalories({ age, sex, weight_kg: weight, height_cm: height, goal });
      await update({
        data: {
          full_name: name || undefined,
          age, sex, weight_kg: weight, height_cm: height, goal,
          conditions, daily_calorie_goal: daily, onboarded: true,
        },
      });
      toast.success("All set — let's start tracking!");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't save profile");
    } finally {
      setBusy(false);
    }
  };

  const steps = ["You", "Body", "Goals", "Health"];

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10 relative overflow-hidden">
      {/* Cinematic backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <img src={bgLifestyle} alt="" className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.78)_0%,rgba(8,18,14,0.55)_50%,rgba(20,12,8,0.78)_100%)]" />
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-[color-mix(in_oklch,var(--sage)_38%,transparent)] blur-3xl animate-float" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[color-mix(in_oklch,var(--ember)_28%,transparent)] blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-6 justify-center text-cream">
          <div className="h-10 w-10 grid place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow"><Leaf className="h-5 w-5" /></div>
          <span className="font-display font-semibold">NutriLens AI</span>
        </div>

        <div className="text-center mb-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/60 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[color:var(--sage)]" /> Step {step + 1} of {steps.length} · {steps[step]}
          </p>
        </div>

        <div className="flex gap-2 mb-5">
          {steps.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "gradient-primary shadow-glow" : "bg-white/15"}`} />
          ))}
        </div>

        <div className="glass-strong rounded-[2rem] p-6 sm:p-8 min-h-[360px] relative overflow-hidden">
          <span aria-hidden className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[color-mix(in_oklch,var(--sage)_28%,transparent)] blur-3xl" />
          <span aria-hidden className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-[color-mix(in_oklch,var(--ember)_22%,transparent)] blur-3xl" />
          <div className="relative">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-semibold">Hi there 👋</h2>
              <p className="text-sm text-muted-foreground mt-1">What should we call you?</p>
              <input className="mt-5 w-full rounded-xl border bg-white/60 px-4 py-3 text-sm" placeholder="Your name"
                value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold">A bit about you</h2>
              <p className="text-sm text-muted-foreground mt-1">We use this for personalised calorie goals.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Field label="Age"><input type="number" min={5} max={110} className="input" value={age} onChange={(e) => setAge(+e.target.value)} /></Field>
                <Field label="Sex">
                  <select className="input" value={sex} onChange={(e) => setSex(e.target.value as any)}>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Weight (kg)"><input type="number" min={20} max={300} className="input" value={weight} onChange={(e) => setWeight(+e.target.value)} /></Field>
                <Field label="Height (cm)"><input type="number" min={80} max={250} className="input" value={height} onChange={(e) => setHeight(+e.target.value)} /></Field>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold">What's your goal?</h2>
              <p className="text-sm text-muted-foreground mt-1">We'll tune your daily calorie target.</p>
              <div className="mt-5 grid grid-cols-1 gap-2">
                {([
                  { v: "lose", t: "Lose weight", d: "~400 kcal deficit" },
                  { v: "maintain", t: "Maintain", d: "Eat for energy" },
                  { v: "gain", t: "Gain muscle", d: "~300 kcal surplus" },
                ] as const).map((o) => (
                  <button key={o.v} onClick={() => setGoal(o.v)} className={`text-left rounded-2xl p-4 border transition ${goal === o.v ? "border-primary bg-primary/5" : "border-border bg-white/40"}`}>
                    <div className="font-medium">{o.t}</div>
                    <div className="text-xs text-muted-foreground">{o.d}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold">Any health conditions?</h2>
              <p className="text-sm text-muted-foreground mt-1">We'll tailor warnings & suggestions. Pick any that apply.</p>
              <div className="mt-5 grid grid-cols-1 gap-2">
                {(Object.keys(CONDITION_META) as Condition[]).map((c) => {
                  const meta = CONDITION_META[c];
                  const on = conditions.includes(c);
                  return (
                    <button key={c} onClick={() => toggleCond(c)} className={`flex items-center gap-3 rounded-2xl p-3.5 border transition ${on ? "border-primary bg-primary/5" : "border-border bg-white/40"}`}>
                      <span className="h-9 w-9 grid place-items-center rounded-full text-white text-lg" style={{ background: meta.color }}>{meta.emoji}</span>
                      <span className="flex-1 text-left font-medium text-sm">{meta.label}</span>
                      {on && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="rounded-full border border-white/25 bg-white/10 backdrop-blur text-cream px-5 py-2.5 text-sm hover:bg-white/15 transition">Back</button>}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="ml-auto rounded-full gradient-primary text-primary-foreground px-6 py-2.5 text-sm font-medium shadow-glow hover:scale-[1.02] transition">Continue</button>
          ) : (
            <button onClick={finish} disabled={busy} className="ml-auto rounded-full gradient-primary text-primary-foreground px-6 py-2.5 text-sm font-medium disabled:opacity-60 shadow-glow hover:scale-[1.02] transition">
              {busy ? "Saving…" : "Finish"}
            </button>
          )}
        </div>
      </div>
      <style>{`.input{width:100%;border-radius:0.75rem;border:1px solid var(--border);background:rgba(255,255,255,0.6);padding:0.65rem 0.85rem;font-size:0.875rem;outline:none}`}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
