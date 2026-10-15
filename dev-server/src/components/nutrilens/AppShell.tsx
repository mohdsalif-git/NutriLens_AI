import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Leaf, LogOut, Home, History, TrendingUp, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/dashboard", label: "Today", icon: Home },
  { to: "/coach", label: "Coach", icon: Sparkles },
  { to: "/history", label: "History", icon: History },
  { to: "/reports", label: "Reports", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onCoach = pathname.startsWith("/coach");

  return (
    <div className="min-h-screen grain-bg pb-32 sm:pb-12 relative overflow-hidden">
      {/* Subtle warm editorial wash — softer than synthetic glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.55]" style={{ background: "radial-gradient(60% 45% at 85% 0%, color-mix(in oklch, var(--sage) 18%, transparent), transparent 60%), radial-gradient(50% 40% at 0% 35%, color-mix(in oklch, var(--ember) 12%, transparent), transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />


      <header className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-5 sm:pt-8 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative h-11 w-11 grid place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow group-hover:scale-105 transition">
            <Leaf className="h-5 w-5" />
            <span aria-hidden className="absolute -inset-1 rounded-2xl bg-[color-mix(in_oklch,var(--sage)_40%,transparent)] blur-md opacity-60 -z-10" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-base tracking-tight">NutriLens AI</p>
            <p className="text-[11px] text-muted-foreground -mt-0.5 max-w-[180px] truncate">{user?.email ?? "Indian food intelligence"}</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 glass-strong rounded-full px-1.5 py-1.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-3.5 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition ${active ? "text-primary-foreground" : "text-foreground/65 hover:text-foreground"}`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill-desktop"
                    className="absolute inset-0 rounded-full gradient-primary shadow-glow"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}
            className="ml-1 h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:text-foreground hover:bg-white/40 transition"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </nav>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 sm:px-6 mt-6">{children}</main>

      {/* Floating AI Coach FAB (hidden on coach page) */}
      <AnimatePresence>
        {!onCoach && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="fixed bottom-24 right-5 sm:bottom-8 sm:right-8 z-50"
          >
            <Link
              to="/coach"
              className="group relative h-14 w-14 grid place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition"
              aria-label="Open AI Coach"
            >
              <span aria-hidden className="absolute inset-0 rounded-full bg-[color-mix(in_oklch,var(--sage)_50%,transparent)] blur-xl opacity-70 -z-10 animate-float" />
              <Sparkles className="h-5 w-5" />
              <span aria-hidden className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--ember)] ring-2 ring-[var(--cream)] animate-pulse" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-4 left-4 right-4 glass-strong rounded-[2rem] px-2 py-2 flex justify-around z-40 shadow-elevated">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl text-[10px] transition min-w-[52px] ${active ? "text-primary-foreground" : "text-foreground/55"}`}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill-mobile"
                  className="absolute inset-0 rounded-2xl gradient-primary shadow-glow"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex flex-col items-center gap-0.5">
                <Icon className="h-[18px] w-[18px]" />
                <span className="font-medium tracking-wide">{label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
