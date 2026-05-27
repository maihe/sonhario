import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { BookOpen, Cloud } from "lucide-react";
import { useMemo, useState } from "react";
import { DayButton } from "react-day-picker";
import { listDreams } from "@/lib/dreams.functions";
import { DreamCard } from "@/components/DreamCard";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/historico")({
  component: HistoricoPage,
  head: () => ({ meta: [{ title: "Histórico · Sonhário" }] }),
});

type Dream = {
  id: string;
  dream_date: string;
  content: string;
  interpretation: string | null;
  last_edit_date: string | null;
  is_draft?: boolean;
};

function isoFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateFromIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function HistoricoPage() {
  const list = useServerFn(listDreams);
  const { data, isLoading } = useQuery({
    queryKey: ["dreams"],
    queryFn: () => list(),
  });

  const [selected, setSelected] = useState<Dream | null>(null);

  const dreamMap = useMemo(() => {
    const map = new Map<string, Dream>();
    (data?.dreams ?? [])
      .filter((d: Dream) => !d.is_draft)
      .forEach((d: Dream) => map.set(d.dream_date, d));
    return map;
  }, [data]);

  const dreamDates = useMemo(
    () => Array.from(dreamMap.keys()).map(dateFromIso),
    [dreamMap],
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-10"
      >
        <BookOpen className="h-6 w-6 text-dream-peach mb-3" />
        <h1 className="font-display text-4xl">Seu histórico</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada nuvem é uma noite registrada. Toque em um dia para reler o sonho.
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-3xl p-6 sm:p-10 w-full"
        >
          <Calendar
            mode="single"
            onSelect={(d) => {
              if (!d) return;
              const dream = dreamMap.get(isoFromDate(d));
              if (dream) setSelected(dream);
            }}
            modifiers={{ hasDream: dreamDates }}
            disabled={(d) => !dreamMap.has(isoFromDate(d))}
            showOutsideDays={false}
            className="pointer-events-auto w-full [--cell-size:3.25rem] sm:[--cell-size:4rem] lg:[--cell-size:4.5rem]"
            classNames={{ root: "w-full", table: "w-full" }}
            components={{
              DayButton: (props: React.ComponentProps<typeof DayButton>) => {
                const iso = isoFromDate(props.day.date);
                const hasDream = dreamMap.has(iso);
                return (
                  <button
                    {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
                    className="relative flex h-full w-full flex-col items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <span>{props.day.date.getDate()}</span>
                    {hasDream && (
                      <Cloud className="absolute -top-1 -right-1 h-3.5 w-3.5 fill-dream-peach/30 text-dream-peach" />
                    )}
                  </button>
                );
              },
            }}
          />
        </motion.div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl border-white/10 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Sonho registrado</DialogTitle>
          {selected && (
            <DreamCard
              date={selected.dream_date}
              content={selected.content}
              interpretation={selected.interpretation}
              edited={!!selected.last_edit_date}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
