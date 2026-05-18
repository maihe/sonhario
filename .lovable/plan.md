# Sonhário — Diário de Sonhos com Interpretação por IA

## Visão geral

Site para incentivar o hábito de registrar sonhos ao acordar. O usuário escreve um sonho por dia, a IA devolve uma interpretação simbólica e reflexiva, e o histórico fica salvo na conta. Edição é limitada a 1 sonho por dia para conter custo de tokens.

## Estética

- **Paleta Crepúsculo Suave**: fundo `#2d1b3d` (ameixa profundo), superfícies `#5a3a5e`, primário `#c9a0dc` (lavanda), acento `#f9a8a8` (pêssego/aurora).
- **Tipografia**: Syne nos títulos (sensação onírica, contemporânea), Plus Jakarta Sans no corpo.
- **Atmosfera**: gradientes lavanda→pêssego suaves, glow sutil, partículas/estrelas discretas no hero, transições lentas com framer-motion, bordas arredondadas generosas, copy poética em português.

## Páginas (rotas TanStack Start)

- `/` — Landing pública: hero "Anote seus sonhos, descubra o que dormem com você", convite ao registro, CTA para entrar/criar conta. SEO completo.
- `/login` — Email/senha + botão "Entrar com Google" (via broker Lovable).
- `/_authenticated/diario` — Tela principal. Mostra:
  - Se ainda não registrou hoje: editor grande, prompt acolhedor, botão "Registrar sonho".
  - Se já registrou: card do sonho de hoje + interpretação da IA + botão "Editar" (habilitado apenas se ainda não usou a edição diária).
- `/_authenticated/historico` — Lista cronológica reversa dos sonhos, cada item expansível com texto + interpretação. Botão de editar aparece apenas no sonho de hoje, e só se ainda não houve edição hoje.
- `/_authenticated/conta` — Logout e dados básicos.

## Fluxo da IA

- Edge: `createServerFn` `interpretarSonho` protegido por `requireSupabaseAuth`.
- Modelo: `google/gemini-3-flash-preview` (default, mais barato) via Lovable AI Gateway.
- Prompt do sistema (no servidor, nunca no cliente): instrui a IA a tratar o input como relato de sonho, oferecer leitura mista — símbolos/arquétipos + reflexão emocional acolhedora —, em português, tom inspirador, 2–4 parágrafos curtos, sem diagnóstico clínico, sem afirmações categóricas.
- Tratar `429` (limite) e `402` (créditos) retornando mensagem amigável.

## Regras de negócio (impostas no servidor)

1. **1 sonho por dia**: chave única `(user_id, dream_date)` com `dream_date = (created_at AT TIME ZONE 'America/Sao_Paulo')::date`. Server fn `criarSonho` rejeita se já existir.
2. **1 edição por dia**: cada sonho tem `edits_used_today` e `last_edit_date`. Server fn `editarSonho` só permite se `last_edit_date < hoje`, e só sobre o sonho de hoje. Reinterpreta com a IA e atualiza o registro.
3. RLS: usuário só lê/escreve seus próprios sonhos.

## Dados (Lovable Cloud)

Tabela `dreams`:
- `id uuid pk`
- `user_id uuid → auth.users`
- `dream_date date` (timezone São Paulo)
- `content text`
- `interpretation text`
- `last_edit_date date null`
- `created_at`, `updated_at`
- unique `(user_id, dream_date)`
- RLS: `auth.uid() = user_id`

## Detalhes técnicos

- Autenticação: email/senha + Google via broker Lovable (`supabase--configure_social_auth` com `["google"]`). Sem tabela `profiles` (não precisamos de dados extras de perfil agora).
- `attachSupabaseAuth` em `src/start.ts` para enviar bearer nas server fns.
- `_authenticated` layout com `beforeLoad` que redireciona para `/login`.
- Listener `onAuthStateChange` no root invalidando router + query cache.
- Markdown opcional na renderização da interpretação (react-markdown).
- Limites de input no cliente e servidor via Zod: conteúdo 20–4000 caracteres.

## O que será habilitado

- Lovable Cloud (banco + auth + server fns)
- Lovable AI Gateway (interpretação)

## Fora do escopo desta primeira versão

- Exportar PDF, compartilhar sonho, busca por símbolos, estatísticas, recuperação de senha customizada, notificações.
