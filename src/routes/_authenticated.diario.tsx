import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Pencil, Moon, Send } from "lucide-react";
import { createDream, editDream, listDreams } from "@/lib/dreams.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DreamCard } from "@/components/DreamCard";
import { StarField } from "@/components/StarField";

export const Route = createFileRoute("/_authenticated/diario")({
  component: DiarioPage,
  head: () => ({ meta: [{ title: "Diário · Sonhário" }] }),
});

function DiarioPage() {
  const list = useServerFn(listDreams);
  const create = useServerFn(createDream);
  const edit = useServerFn(editDream);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dreams"],
    queryFn: () => list(),
  });

  const todayDream = data?.dreams.find((d) => d.dream_date === data.today);
  const canEditToday = todayDream && todayDream.last_edit_date !== data?.today;

  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (todayDream && editing) setContent(todayDream.content);
  }, [editing, todayDream]);

  const createMut = useMutation({
    mutationFn: (c: string) => create({ data: { content: c } }),
    onSuccess: () => {
      toast.success("Sonho registrado. Boa jornada hoje.");
      setContent("");
      qc.invalidateQueries({ queryKey: ["dreams"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editMut = useMutation({
    mutationFn: (vars: { id: string; content: string }) => edit({ data: vars }),
    onSuccess: () => {
      toast.success("Sonho atualizado.");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["dreams"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy = createMut.isPending || editMut.isPending;

  return (
    <div className="relative">
      <StarField count={40} />
      <div className="relative mx-auto max-w-2xl px-6 py-12 sm:py-20">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Moon className="h-7 w-7 text-dream-lavender mx-auto mb-4" />
          <h1 className="font-display text-4xl sm:text-5xl">
            {todayDream && !editing
              ? "O sonho de hoje"
              : "Bom dia. O que você sonhou?"}
          </h1>
          <p className="mt-3 text-muted-foreground text-sm">
            {todayDream && !editing
              ? "Volte amanhã para anotar o próximo."
              : "Escreva enquanto a memória ainda está fresca."}
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className="glass rounded-3xl p-10 text-center text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Carregando...
            </motion.div>
          ) : todayDream && !editing ? (
            <motion.div
              key="today"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <DreamCard
                date={todayDream.dream_date}
                content={todayDream.content}
                interpretation={todayDream.interpretation}
                edited={todayDream.last_edit_date === data?.today}
              />
              {canEditToday ? (
                <Button
                  variant="ghost"
                  onClick={() => setEditing(true)}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar (você pode editar uma vez por dia)
                </Button>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  Edição diária já utilizada.
                </p>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                if (editing && todayDream) {
                  editMut.mutate({ id: todayDream.id, content });
                } else {
                  createMut.mutate(content);
                }
              }}
              className="glass rounded-3xl p-6 sm:p-8"
            >
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Eu estava em um lugar..."
                rows={10}
                maxLength={4000}
                className="bg-white/5 border-white/10 text-base leading-relaxed resize-none focus-visible:ring-dream-lavender/40"
                required
              />
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{content.length} / 4000</span>
                <span>Um sonho por dia · uma edição por dia</span>
              </div>
              <div className="mt-5 flex gap-2">
                {editing && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditing(false);
                      setContent("");
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={busy || content.trim().length < 20}
                  className="flex-1 bg-gradient-dream text-primary-foreground hover:shadow-glow transition-all"
                >
                  {busy ? (
                    "Interpretando..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {editing ? "Reinterpretar" : "Registrar sonho"}
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
