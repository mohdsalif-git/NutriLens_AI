import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Leaf, Sparkles, Camera, Activity, ShieldCheck, ArrowRight,
  Flame, Heart, ScanLine, Brain, Trophy, Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import heroThali from "@/assets/bg-hero-thali.jpg";
import bgAiScan from "@/assets/bg-ai-scan.jpg";
import bgLifestyle from "@/assets/bg-lifestyle.jpg";
import bgHealth from "@/assets/bg-health.jpg";

export const Route = createFileRoute("/")({ component: Landing });

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } }),
};

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);
  const heroImgScale = useTransform(heroScroll, [0, 1], [1.05, 1.15]);
  const heroContentY = useTransform(heroScroll, [0, 1], ["0%", "-12%"]);
  const heroFade = useTransform(heroScroll, [0, 0.8], [1, 0.3]);

  return (
    <main className="min-h-screen overflow-hidden relative bg-[color:var(--ink)]">

      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col">
        {/* Background image with parallax */}
        <motion.div
          aria-hidden
          style={{ y: heroImgY, scale: heroImgScale }}
          className="absolute inset-0 -z-10"
        >
          <img
            src={heroThali}
            alt=""
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        </motion.div>
        {/* Cinematic overlays */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[color:var(--ink)]/40 via-[color:var(--ink)]/55 to-[color:var(--ink)]/95" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_20%_20%,transparent,oklch(0.22_0.02_140/0.85))]" />
        {/* Ambient glows */}
        <div aria-hidden className="pointer-events-none absolute top-1/4 -left-32 h-[420px] w-[420px] rounded-full bg-[color:var(--sage)]/30 blur-[120px] animate-float" />
        <div aria-hidden className="pointer-events-none absolute bottom-1/4 -right-32 h-[420px] w-[420px] rounded-full bg-[color:var(--ember)]/25 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />

        {/* Header */}
        <header className="relative mx-auto w-full max-w-6xl px-5 sm:px-8 pt-6 sm:pt-8 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-2.5">
            <div className="h-10 w-10 grid place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-semibold text-base tracking-tight text-on-dark">NutriLens AI</p>
              <p className="text-[11px] text-on-dark-muted -mt-0.5">Indian food intelligence</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Link to="/auth" className="text-sm rounded-full px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 text-on-dark font-medium hover:bg-white/20 transition">Sign in</Link>
          </motion.div>
        </header>

        {/* Hero content */}
        <motion.div style={{ y: heroContentY, opacity: heroFade }} className="relative flex-1 mx-auto w-full max-w-6xl px-5 sm:px-8 mt-14 sm:mt-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center pb-20">
          <div>
            <motion.span variants={fadeUp} initial="hidden" animate="show" custom={0} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-on-dark">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--sage)] opacity-70 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--sage)]" />
              </span>
              Live AI · trained on 200+ Indian dishes
            </motion.span>

            <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1} className="mt-5 text-[2.6rem] sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] text-on-dark">
              Eat smarter,<br />
              <span className="bg-gradient-to-r from-[color:var(--sage)] via-[color:var(--cream)] to-[color:var(--ember)] bg-clip-text text-transparent">condition by</span><br />
              <span className="italic font-display">condition.</span>
            </motion.h1>

            <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2} className="mt-5 text-base sm:text-lg text-on-dark-muted max-w-xl leading-relaxed">
              Snap any Indian meal. Get instant calories, macros and personalised guidance for diabetes,
              BP, cholesterol and more — in under two seconds.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" className="group inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow hover-lift">
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/25 px-6 py-3.5 text-sm font-medium text-on-dark hover:bg-white/20 transition">
                I have an account
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-8 flex items-center gap-4 text-xs text-on-dark-muted">
              <div className="flex -space-x-2">
                {["🥗", "🍛", "🥘"].map((e, i) => (
                  <div key={i} className="h-7 w-7 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 grid place-items-center text-sm">{e}</div>
                ))}
              </div>
              <span>Loved by 12,000+ mindful eaters in India</span>
            </motion.div>
          </div>

          {/* Phone preview */}
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} className="relative">
            <div className="relative aspect-[4/5] sm:aspect-square w-full max-w-md mx-auto">
              <div className="absolute inset-0 rounded-[2.5rem] bg-[color:var(--cream)]/95 backdrop-blur-2xl border border-white/30 shadow-elevated p-5 sm:p-6 overflow-hidden">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>9:41</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-primary" /> NutriLens</span>
                </div>
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 rounded-2xl gradient-primary text-primary-foreground p-4 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                  <p className="text-[11px] uppercase tracking-widest opacity-80">Detected</p>
                  <p className="text-xl font-semibold mt-0.5">Paneer Butter Masala 🍛</p>
                  <div className="mt-3 flex items-end gap-4">
                    <div>
                      <p className="text-3xl font-display font-semibold">462</p>
                      <p className="text-[11px] opacity-80">kcal · 1 bowl</p>
                    </div>
                    <div className="ml-auto h-12 w-12 rounded-full bg-white/15 grid place-items-center text-sm font-semibold">82</div>
                  </div>
                </motion.div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { l: "Protein", v: "18g", c: "var(--ember)" },
                    { l: "Carbs", v: "32g", c: "var(--sage-deep)" },
                    { l: "Fiber", v: "6g", c: "var(--sage)" },
                  ].map((s, i) => (
                    <motion.div key={s.l} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.75 + i * 0.08 }} className="rounded-xl bg-white/80 p-2.5">
                      <p className="text-[10px] text-muted-foreground">{s.l}</p>
                      <p className="text-sm font-semibold" style={{ color: s.c }}>{s.v}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="mt-3 rounded-xl glass p-3 flex gap-2.5">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed">Try whole-wheat roti instead of naan to cut 90 kcal — friendlier for diabetes.</p>
                </motion.div>
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.15 }} className="mt-3 flex items-center gap-2 rounded-xl bg-mist/60 px-3 py-2">
                  <Flame className="h-4 w-4 text-[#c47e6c]" />
                  <span className="text-xs font-medium">7-day mindful streak</span>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="hidden sm:flex absolute -left-6 top-16 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl px-3 py-2 items-center gap-2 shadow-elevated animate-float">
                <Camera className="h-4 w-4 text-[color:var(--sage)]" />
                <span className="text-xs font-medium text-on-dark">Scanned in 1.2s</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.35 }} className="hidden sm:flex absolute -right-4 bottom-24 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl px-3 py-2 items-center gap-2 shadow-elevated animate-float" style={{ animationDelay: "1.2s" }}>
                <ShieldCheck className="h-4 w-4 text-[color:var(--sage)]" />
                <span className="text-xs font-medium text-on-dark">Diabetes-safe</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============ AI SCANNING SECTION ============ */}
      <ParallaxImageSection
        image={bgAiScan}
        eyebrow="AI Vision"
        title={<>Point. Scan. <span className="italic font-display">Understand.</span></>}
        body="Our computer-vision engine recognises 200+ Indian dishes in real time — biryani, thali, chaat, sweets — and renders live nutrition holograms tuned to your conditions."
        bullets={[
          { icon: ScanLine, text: "Real-time camera detection" },
          { icon: Brain, text: "Conditions-aware AI" },
          { icon: Zap, text: "Sub-2-second response" },
        ]}
        align="right"
      />

      {/* ============ DISEASE AWARENESS ============ */}
      <section className="relative py-24 sm:py-32 bg-[color:var(--cream)]">
        <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_50%_at_50%_50%,black,transparent)] bg-[radial-gradient(50%_30%_at_20%_20%,color-mix(in_oklch,var(--sage)_25%,transparent),transparent),radial-gradient(50%_30%_at_80%_80%,color-mix(in_oklch,var(--ember)_18%,transparent),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">A coach for your condition</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
              Food is medicine,<br />when it knows your body.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              From diabetes to PCOS, NutriLens turns every meal into a quiet, personal decision.
            </p>
          </motion.div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { name: "Diabetes", emoji: "🩸", tone: "Lower-GI swaps, fiber-first plates." },
              { name: "Heart & BP", emoji: "❤️", tone: "Sodium awareness, oil-light cooking." },
              { name: "PCOS", emoji: "🌸", tone: "Inflammation-friendly, hormone-aware." },
              { name: "Cholesterol", emoji: "💧", tone: "Saturated-fat ceilings, fibre nudges." },
              { name: "Fatty liver", emoji: "🌿", tone: "Refined-carb tracking, micro-meals." },
              { name: "Obesity", emoji: "⚖️", tone: "Calorie forecasting, portion intelligence." },
            ].map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06, duration: 0.55 }}
                className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-border p-6 hover-lift"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[color:var(--sage)]/15 blur-2xl group-hover:bg-[color:var(--sage)]/25 transition" />
                <div className="relative flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[color:var(--sage)]/15 grid place-items-center text-2xl">{c.emoji}</div>
                  <div>
                    <p className="font-display font-semibold text-lg">{c.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{c.tone}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Inline health photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-14 relative rounded-[2rem] overflow-hidden border border-border shadow-elevated"
          >
            <img src={bgHealth} alt="A glucose monitor next to a fresh moong dal bowl" className="w-full h-64 sm:h-80 object-cover" loading="lazy" width={1920} height={1080} />
            <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--cream)]/95 via-[color:var(--cream)]/60 to-transparent" />
            <div className="absolute inset-0 flex items-center p-6 sm:p-12">
              <div className="max-w-md">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Real outcomes</p>
                <p className="mt-2 text-2xl sm:text-3xl font-display font-semibold tracking-tight leading-tight">
                  "My sugar levels finally stopped spiking after dinner."
                </p>
                <p className="mt-3 text-sm text-muted-foreground">— Anjali, Bengaluru · Type 2 diabetes</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURES BENTO ============ */}
      <section className="relative py-24 sm:py-32 bg-[color:var(--ink)]">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(50%_50%_at_50%_0%,color-mix(in_oklch,var(--sage-deep)_40%,transparent),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--sage)] font-medium">A health OS in your pocket</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-on-dark">
              Everything works together.
            </h2>
          </motion.div>

          <div className="mt-12 grid sm:grid-cols-6 gap-3 sm:gap-4">
            {[
              { icon: Camera, title: "Snap your plate", text: "AI recognises thali, biryani, dosa & 200+ Indian dishes.", span: "sm:col-span-3" },
              { icon: Activity, title: "Live nutrition", text: "Calories, macros and fibre tracked across your day.", span: "sm:col-span-3" },
              { icon: ShieldCheck, title: "Condition-aware", text: "Warnings tuned for diabetes, BP, cholesterol & fatty liver.", span: "sm:col-span-2" },
              { icon: Sparkles, title: "AI coach", text: "Personal nudges that learn what you actually eat.", span: "sm:col-span-2" },
              { icon: Trophy, title: "Streaks & rewards", text: "Mindful eating becomes a daily ritual you'll crave.", span: "sm:col-span-2" },
            ].map(({ icon: Icon, title, text, span }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                className={`rounded-3xl p-5 sm:p-6 hover-lift bg-white/[0.04] backdrop-blur-xl border border-white/10 ${span}`}
              >
                <div className="h-10 w-10 grid place-items-center rounded-2xl bg-[color:var(--sage)]/15 text-[color:var(--sage)]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 font-semibold text-base text-on-dark">{title}</p>
                <p className="mt-1 text-sm text-on-dark-muted leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LIFESTYLE / CTA ============ */}
      <section className="relative min-h-[80svh] flex items-center overflow-hidden">
        <img src={bgLifestyle} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--ink)] via-[color:var(--ink)]/60 to-[color:var(--ink)]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_30%,color-mix(in_oklch,var(--ember)_25%,transparent),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--sage)] font-medium">Built for the way India eats</p>
            <h2 className="mt-3 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02] text-on-dark">
              Your family,<br />healthier together.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-on-dark-muted leading-relaxed max-w-lg">
              From your grandma's sambar to your gym-day protein bowl — one app that understands every plate on the table.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" className="group inline-flex items-center gap-2 rounded-full gradient-primary px-7 py-4 text-base font-medium text-primary-foreground shadow-glow hover-lift">
                Start your journey
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { v: "12k+", l: "Mindful eaters" },
                { v: "200+", l: "Indian dishes" },
                { v: "1.2s", l: "Avg scan time" },
              ].map((s) => (
                <div key={s.l} className="text-on-dark">
                  <p className="text-3xl font-display font-semibold bg-gradient-to-r from-[color:var(--sage)] to-[color:var(--ember)] bg-clip-text text-transparent">{s.v}</p>
                  <p className="text-xs text-on-dark-muted mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="relative bg-[color:var(--ink)] py-10 text-center text-xs text-on-dark-muted border-t border-white/10">
        NutriLens AI · Smart nutrition for healthier Indian eating
      </footer>
    </main>
  );
}

/* ----------------- Reusable parallax image section ----------------- */
function ParallaxImageSection({
  image, eyebrow, title, body, bullets, align = "left",
}: {
  image: string;
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  bullets: { icon: React.ComponentType<{ className?: string }>; text: string }[];
  align?: "left" | "right";
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.2]);

  return (
    <section ref={ref} className="relative min-h-[90svh] flex items-center overflow-hidden bg-[color:var(--ink)]">
      <motion.img
        src={image}
        alt=""
        style={{ y, scale }}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--ink)]/70 via-[color:var(--ink)]/55 to-[color:var(--ink)]/90" />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(60% 50% at ${align === "right" ? "80%" : "20%"} 50%, transparent, oklch(0.22 0.02 140 / 0.7))` }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`max-w-xl ${align === "right" ? "ml-auto text-left" : ""}`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--sage)] font-medium">{eyebrow}</p>
          <h2 className="mt-3 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02] text-on-dark">
            {title}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-on-dark-muted leading-relaxed">{body}</p>
          <ul className="mt-8 space-y-3">
            {bullets.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                className="flex items-center gap-3 text-sm text-on-dark"
              >
                <span className="h-9 w-9 grid place-items-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-[color:var(--sage)]">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
