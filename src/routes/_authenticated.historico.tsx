import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { listDreams } from "@/lib/dreams.functions";
import { DreamCard } from "@/components/DreamCard";

export const Route = createFileRoute("/_authenticated/historico")({
  component: HistoricoPage,
  head: () => ({ meta: [{ title: "Histórico · Sonhário" }] }),
});

function HistoricoPage() {
  const list = useServerFn(listDreams);
  const { data, isLoading } = useQuery({
    queryKey: ["dreams"],
    queryFn: () => list(),
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-10"
      >
        <BookOpen className="h-6 w-6 text-dream-peach mb-3" />
        <h1 className="font-display text-4xl">Seu histórico</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada noite, uma carta sua para você. Reler é descobrir padrões.
        </p>
      </motion.header>

      {isLoading ? (
        <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
          Carregando...
        </div>
      ) : !data?.dreams.length ? (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-muted-foreground mb-5">
            Você ainda não registrou nenhum sonho.
          </p>
          <Link
            to="/diario"
            className="inline-block rounded-full bg-gradient-dream px-6 py-2.5 text-sm font-medium text-primary-foreground hover:shadow-glow transition-all"
          >
            Anotar o primeiro
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {data.dreams.map((d) => (
            <DreamCard
              key={d.id}
              date={d.dream_date}
              content={d.content}
              interpretation={d.interpretation}
              edited={!!d.last_edit_date}
            />
          ))}
        </div>
      )}
    </div>
  );
}
