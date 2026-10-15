import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Leaf } from "lucide-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grain-bg grid place-items-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-12 w-12 rounded-2xl bg-primary grid place-items-center text-primary-foreground">
            <Leaf className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">Loading NutriLens…</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
