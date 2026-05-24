import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-3xl p-10">
        <h1 className="text-7xl font-display text-gradient-dream">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Talvez esteja em outro sonho. Vamos voltar ao início.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-dream px-5 py-2.5 text-sm font-medium text-primary-foreground hover:shadow-glow transition-all"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-3xl p-10">
        <h1 className="text-xl font-semibold">Esta página não carregou</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo se perdeu na névoa. Você pode tentar novamente.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-gradient-dream px-5 py-2 text-sm font-medium text-primary-foreground hover:shadow-glow transition-all"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sonhário · Diário de sonhos com interpretação por IA" },
      {
        name: "description",
        content:
          "Anote seus sonhos ao acordar e receba uma interpretação acolhedora. Um espaço sereno para cultivar o hábito do autoconhecimento onírico.",
      },
      { name: "author", content: "Sonhário" },
      { property: "og:title", content: "Sonhário · Diário de sonhos com interpretação por IA" },
      {
        property: "og:description",
        content:
          "Cultive o hábito de observar seus sonhos. Uma IA gentil oferece uma leitura simbólica e reflexiva.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Sonhário · Diário de sonhos com interpretação por IA" },
      { name: "description", content: "Sonhario encoraja o registro dos sonhos e provê AI-powered interpretação da sua visão única" },
      { property: "og:description", content: "Sonhario encoraja o registro dos sonhos e provê AI-powered interpretação da sua visão única" },
      { name: "twitter:description", content: "Sonhario encoraja o registro dos sonhos e provê AI-powered interpretação da sua visão única" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/be14c889-f325-425f-b04b-86b5c60752d7/id-preview-7bb5c933--bcdbff02-3c12-43d1-b818-dccd70c39a02.lovable.app-1779154799206.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/be14c889-f325-425f-b04b-86b5c60752d7/id-preview-7bb5c933--bcdbff02-3c12-43d1-b818-dccd70c39a02.lovable.app-1779154799206.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <Outlet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
