import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function DreamCard({
  date,
  content,
  interpretation,
  edited,
}: {
  date: string;
  content: string;
  interpretation: string;
  edited?: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-3xl p-6 sm:p-8"
    >
      <header className="flex items-center justify-between mb-5">
        <time className="text-xs uppercase tracking-[0.2em] text-dream-lavender">
          {formatDate(date)}
        </time>
        {edited && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            editado
          </span>
        )}
      </header>

      <p className="font-display text-lg sm:text-xl italic leading-relaxed text-foreground/90 mb-6">
        “{content}”
      </p>

      <div className="border-t border-white/10 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-dream-peach" />
          <span className="text-xs uppercase tracking-[0.2em] text-dream-peach">
            Leitura
          </span>
        </div>
        <div className="dream-prose text-[15px]">
          <ReactMarkdown>{interpretation}</ReactMarkdown>
        </div>
      </div>
    </motion.article>
  );
}

function formatDate(iso: string) {
  try {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return iso;
  }
}
