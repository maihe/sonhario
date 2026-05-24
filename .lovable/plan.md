## Contexto

- No **preview** (`id-preview--...lovable.app`): login com Google e email/senha funcionam (logs confirmam sessão Google ativa e signup HTTP 200).
- No **publicado** (`https://sonhario.lovable.app`): ao clicar em "Continuar com Google", a tela "não sai do lugar" — nenhum redirecionamento acontece.

A causa mais provável **não é o código da aplicação** (mesmo bundle nos dois ambientes). As suspeitas principais são:

1. O bundle publicado está desatualizado — a versão atual com Google SSO ainda não foi publicada ("Update" no diálogo de publicação não foi clicado depois das últimas mudanças de auth).
2. O proxy do broker OAuth da Lovable (`/~oauth/initiate` → `oauth.lovable.app`) não está respondendo no domínio publicado, ou o domínio não está na allowlist de redirect do provedor gerenciado.
3. Algum erro client-side silencioso (popup bloqueado, exceção engolida no `try/catch` do `signInGoogle`) que só ocorre no build de produção.

## Plano de investigação (sem mexer em código primeiro)

1. Abrir `https://sonhario.lovable.app/login` com a ferramenta de browser, clicar em "Continuar com Google" e capturar:
   - Console logs (erros JS, warnings de popup bloqueado, `lovable.auth` indefinido).
   - Network requests (a chamada deveria ir para `/~oauth/initiate` e seguir redirect para `oauth.lovable.app` → `accounts.google.com`).
2. Verificar se o build publicado contém a integração `@/integrations/lovable` ou se foi publicado **antes** dela existir (re-publicar é a correção se sim).
3. Conferir os logs de auth do backend filtrados pelo domínio publicado, para ver se chega alguma tentativa.

## Correção em código (só se a investigação apontar)

Dependendo do resultado, uma destas (escopo cirúrgico, só em `src/routes/login.tsx`):

- **Logging defensivo**: o `catch` atual em `signInGoogle` só mostra `err.message`; adicionar `console.error(err)` para o erro real aparecer na sessão do usuário e nos próximos logs.
- **Tratar `result.redirected = false` sem tokens**: se o broker retornar um estado intermediário sem `error` nem `redirected`, o código atual chama `navigate({ to: "/diario" })` sem sessão — adicionar guarda explícita e mostrar toast.
- **Fallback de `redirect_uri`**: garantir que `window.location.origin` no momento do clique corresponde exatamente a `https://sonhario.lovable.app` (sem trailing slash, sem path) — já é o caso, mas confirmar.

## Correção fora de código (provavelmente a real)

- Se o problema for "bundle antigo publicado": instruir o usuário a clicar em **Publish → Update** e re-testar.
- Se o problema for allowlist do domínio publicado no provedor gerenciado: o domínio `*.lovable.app` já é coberto automaticamente, mas se houver custom domain ou se o broker estiver com problema, abrir as configurações de Cloud → Authentication Settings → Google para validar.

## Entregáveis

- Diagnóstico claro de onde o fluxo trava no publicado (com prints/logs).
- Se for código: PR pequeno em `src/routes/login.tsx` adicionando logging e guarda.
- Se for infraestrutura/publicação: instruções acionáveis (re-publicar e/ou abrir Cloud Auth Settings).

## Fora do escopo

- Mudanças no `redirect_uri`, em `src/integrations/lovable/*` (arquivo gerado, proibido editar), ou em qualquer configuração de Supabase Auth no código.
- Mudanças no fluxo de email/senha — esse caminho já funciona; a confirmação de email continua exigida (comportamento atual e seguro).