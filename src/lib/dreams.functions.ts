import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TZ = "America/Sao_Paulo";

function todayInSP(): string {
  // YYYY-MM-DD in São Paulo timezone
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

const SYSTEM_PROMPT = `Você é um intérprete de sonhos acolhedor, em português brasileiro.
Receberá o relato de um sonho de uma pessoa que acabou de acordar.
Sua resposta deve:
- Combinar leitura simbólica (arquétipos, imagens recorrentes) com reflexão emocional sensível.
- Ter de 2 a 4 parágrafos curtos, tom inspirador, poético mas claro.
- Sugerir o que aquelas imagens podem refletir do mundo interior da pessoa, sem fazer diagnósticos clínicos nem afirmações categóricas. Use expressões como "talvez", "pode sugerir", "convida a".
- Encerrar com uma pergunta gentil para a pessoa refletir ao longo do dia.
- Nunca julgar, nunca alarmar. Nunca usar listas, títulos ou formatação markdown além de itálico ocasional.
- Se o texto não parecer um relato de sonho, gentilmente convide a pessoa a descrever um sonho.`;

async function interpret(content: string): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
    }),
  });

  if (res.status === 429) {
    throw new Error("Muitas interpretações no momento. Tente novamente em alguns instantes.");
  }
  if (res.status === 402) {
    throw new Error("Créditos de IA esgotados. Adicione créditos ao workspace para continuar.");
  }
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("AI gateway error:", res.status, t);
    throw new Error("Não foi possível interpretar o sonho agora.");
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("A interpretação veio vazia. Tente novamente.");
  return String(text).trim();
}

const contentSchema = z
  .string()
  .trim()
  .min(20, "Conte um pouco mais sobre o sonho (mínimo 20 caracteres).")
  .max(4000, "O relato é muito longo (máximo 4000 caracteres).");

export const listDreams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("user_id", userId)
      .order("dream_date", { ascending: false });
    if (error) throw new Error(error.message);
    return { dreams: data ?? [], today: todayInSP() };
  });

export const createDream = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { content: string }) =>
    z.object({ content: contentSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = todayInSP();

    const { data: existing } = await supabase
      .from("dreams")
      .select("id")
      .eq("user_id", userId)
      .eq("dream_date", today)
      .maybeSingle();

    if (existing) {
      throw new Error("Você já registrou um sonho hoje. Volte amanhã para anotar o próximo.");
    }

    const interpretation = await interpret(data.content);

    const { data: inserted, error } = await supabase
      .from("dreams")
      .insert({
        user_id: userId,
        dream_date: today,
        content: data.content,
        interpretation,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { dream: inserted };
  });

export const editDream = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; content: string }) =>
    z.object({ id: z.string().uuid(), content: contentSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = todayInSP();

    const { data: dream, error: fetchErr } = await supabase
      .from("dreams")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr) throw new Error(fetchErr.message);
    if (!dream) throw new Error("Sonho não encontrado.");
    if (dream.dream_date !== today) {
      throw new Error("Só é possível editar o sonho registrado hoje.");
    }
    if (dream.last_edit_date === today) {
      throw new Error("Você já usou sua edição de hoje. Volte amanhã.");
    }

    const interpretation = await interpret(data.content);

    const { data: updated, error } = await supabase
      .from("dreams")
      .update({
        content: data.content,
        interpretation,
        last_edit_date: today,
      })
      .eq("id", data.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { dream: updated };
  });
