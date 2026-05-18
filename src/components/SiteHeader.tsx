import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md border-b border-white/5 bg-dream-plum/40">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Moon className="h-5 w-5 text-dream-lavender group-hover:rotate-12 transition-transform" />
          <span className="font-display text-xl font-semibold tracking-tight">
            Sonhário
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {signedIn ? (
            <>
              <Link
                to="/diario"
                className="px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors"
                activeProps={{ className: "px-3 py-2 text-sm rounded-lg bg-white/10 text-dream-lavender" }}
              >
                Diário
              </Link>
              <Link
                to="/historico"
                className="px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors"
                activeProps={{ className: "px-3 py-2 text-sm rounded-lg bg-white/10 text-dream-lavender" }}
              >
                Histórico
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm rounded-full bg-gradient-dream text-primary-foreground font-medium hover:shadow-glow transition-all"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
