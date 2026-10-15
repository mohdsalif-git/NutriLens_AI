import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, ShieldCheck, Sparkles, Utensils } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import bgThali from "@/assets/bg-hero-thali.jpg";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: name || email.split("@")[0] },
            emailRedirectTo: window.location.origin + "/onboarding",
          },
        });
        if (error) throw error;
        toast.success("Account created — check your email to confirm.");
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/onboarding" });
    if (res.error) { toast.error((res.error as any)?.message ?? "Google sign-in failed"); setBusy(false); return; }
    if (res.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] relative overflow-hidden">
      {/* Cinematic left panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 text-cream overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={bgThali} alt="" className="h-full w-full object-cover scale-105" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,18,14,0.85)_0%,rgba(8,18,14,0.55)_50%,rgba(20,12,8,0.78)_100%)]" />
          <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-[color-mix(in_oklch,var(--sage)_40%,transparent)] blur-3xl animate-float" />
          <div className="absolute bottom-0 -right-20 h-72 w-72 rounded-full bg-[color-mix(in_oklch,var(--ember)_30%,transparent)] blur-3xl" />
        </div>

        <Link to="/" className="flex items-center gap-2.5 group w-fit">
          <div className="h-11 w-11 grid place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-display font-semibold text-lg">NutriLens AI</span>
        </Link>

        <div className="space-y-6 max-w-md">
          <p className="text-[10px] uppercase tracking-[0.32em] text-cream/60">Indian nutrition intelligence</p>
          <h1 className="font-display text-5xl xl:text-6xl font-semibold leading-[1.05]">
            Eat with <em className="italic font-normal text-[color:var(--sage)]">clarity.</em>
          </h1>
          <p className="text-base text-cream/75 leading-relaxed">
            Point your camera at any thali. Our AI reads the plate, decodes the macros, and personalises every bite to your conditions.
          </p>
          <ul className="space-y-3 pt-2">
            {[
              { icon: Sparkles, t: "200+ Indian dishes detected in real time" },
              { icon: ShieldCheck, t: "Conditions-aware warnings & swaps" },
              { icon: Utensils, t: "Daily AI coaching tuned to your goals" },
            ].map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-3 text-sm text-cream/80">
                <span className="h-8 w-8 grid place-items-center rounded-full bg-white/10 border border-white/15 backdrop-blur">
                  <Icon className="h-4 w-4 text-[color:var(--sage)]" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-cream/45">© NutriLens AI · Built for Indian kitchens</p>
      </aside>

      {/* Right form panel */}
      <section className="relative grain-bg grid place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 grid place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-display font-semibold text-lg">NutriLens AI</span>
          </Link>

          <div className="glass-strong rounded-[2rem] p-6 sm:p-8 relative overflow-hidden">
            <span aria-hidden className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[color-mix(in_oklch,var(--sage)_30%,transparent)] blur-3xl" />
            <span aria-hidden className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-[color-mix(in_oklch,var(--ember)_22%,transparent)] blur-3xl" />

            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{mode === "signin" ? "Welcome back" : "Get started"}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">
                {mode === "signin" ? "Sign in to NutriLens" : "Create your account"}
              </h2>

              <div className="mt-5 flex bg-mist/60 rounded-full p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 text-sm rounded-full transition ${mode === m ? "gradient-primary text-primary-foreground shadow-glow" : "text-foreground/60"}`}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-5 space-y-3">
                {mode === "signup" && (
                  <input className="w-full rounded-xl border bg-white/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
                )}
                <input type="email" required className="w-full rounded-xl border bg-white/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
                <input type="password" required minLength={6} className="w-full rounded-xl border bg-white/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} />
                <button disabled={busy} className="w-full rounded-xl gradient-primary text-primary-foreground py-3 text-sm font-medium disabled:opacity-60 shadow-glow hover:scale-[1.01] transition">
                  {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create my account"}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" />
              </div>

              <button onClick={google} disabled={busy} className="w-full rounded-xl border bg-white py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/80 transition disabled:opacity-60">
                <GoogleIcon /> Continue with Google
              </button>

              <p className="mt-5 text-center text-xs text-muted-foreground">
                By continuing you agree to NutriLens AI's friendly use of your meal data — to help you eat better.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6 29.2 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C40.9 35.6 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
  );
}
