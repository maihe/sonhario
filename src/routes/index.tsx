import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Moon, Sparkles, BookOpen, Heart } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { StarField } from "@/components/StarField";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Sonhário · Anote seus sonhos, descubra o que desperta dentro de você" },
      {
        name: "description",
        content:
          "Um diário sereno para registrar seus sonhos ao acordar e receber uma interpretação gentil, feita por IA. Cultive o hábito do autoconhecimento onírico.",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <StarField count={80} />
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-28 sm:pt-32 sm:pb-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-dream-lavender mb-8"
          >
            <Sparkles className="h-3 w-3" />
            Um sonho por dia
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.1, ease: "easeOut" }}
            className="font-display text-5xl sm:text-7xl font-semibold leading-[1.05]"
          >
            Anote seus sonhos,
            <br />
            <span className="text-gradient-dream">descubra o que dormem com você.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.3 }}
            className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Ao acordar, escreva o sonho que ficou na memória. Uma leitura
            simbólica e acolhedora aparece para você refletir ao longo do dia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/login"
              className="rounded-full bg-gradient-dream px-7 py-3.5 text-base font-medium text-primary-foreground hover:shadow-glow transition-all"
            >
              Começar meu diário
            </Link>
            <a
              href="#como-funciona"
              className="rounded-full border border-white/15 px-7 py-3.5 text-base hover:bg-white/5 transition-colors"
            >
              Como funciona
            </a>
          </motion.div>
        </div>
      </section>

      <section id="como-funciona" className="relative mx-auto max-w-5xl px-6 py-24">
        <h2 className="font-display text-3xl sm:text-4xl text-center mb-4">
          Um ritual gentil
        </h2>
        <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
          Pensado para caber nos primeiros minutos do seu dia.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Moon,
              title: "1. Acorde e anote",
              text: "Antes que o sonho escape, descreva-o no diário. Um por dia, sem pressa.",
            },
            {
              icon: Sparkles,
              title: "2. Receba uma leitura",
              text: "Uma IA acolhedora oferece símbolos, ressonâncias emocionais e uma pergunta para o seu dia.",
            },
            {
              icon: BookOpen,
              title: "3. Volte ao histórico",
              text: "Veja como seus sonhos conversam ao longo do tempo. O autoconhecimento se acumula.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="glass rounded-3xl p-7"
            >
              <f.icon className="h-7 w-7 text-dream-peach mb-4" />
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <Heart className="h-6 w-6 text-dream-peach mx-auto mb-6" />
        <p className="font-display text-2xl sm:text-3xl leading-snug">
          “Os sonhos são cartas que escrevemos a nós mesmos
          <span className="text-gradient-dream"> enquanto dormimos.</span>”
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Registrar sonhos cultiva memória, criatividade e equilíbrio emocional.
        </p>
        <Link
          to="/login"
          className="inline-block mt-10 rounded-full bg-gradient-dream px-7 py-3.5 text-base font-medium text-primary-foreground hover:shadow-glow transition-all"
        >
          Criar minha conta
        </Link>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        Sonhário · feito com cuidado para a sua noite
      </footer>
    </div>
  );
}
