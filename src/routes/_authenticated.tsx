import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // Só checamos no client — no SSR não há localStorage e a sessão
    // viria sempre null, causando logout indevido após refresh.
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Outlet />
    </div>
  );
}
