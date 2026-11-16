# Arquitetura

## Visão em camadas

```mermaid
flowchart TB
  subgraph client [Cliente]
    Pages[Pages]
    Components[Components]
    Hooks[Hooks]
    Pages --> Components
    Components --> Hooks
  end
  subgraph data [Dados]
    RQ[TanStack Query]
    SB[Supabase Client]
    Hooks --> RQ
    Hooks --> SB
  end
  SB --> API[(Supabase API)]
```

## Rotas

| Caminho | Componente | Responsabilidade |
|---------|------------|------------------|
| `/` | `pages/Index.tsx` | Landing: composição das seções |
| `/auth` | `pages/Auth.tsx` | Login admin |
| `/admin` | `pages/Admin.tsx` | Dashboard + tabelas |
| `*` | `pages/NotFound.tsx` | 404 |

O router está em `App.tsx`, envolvido por `QueryClientProvider`, toasts e tooltips globais.

## Organização de pastas

- `src/components/` — seções da landing, modais, widgets (WhatsApp, carrossel) e `admin/` para o painel.
- `src/components/ui/` — primitives shadcn (botões, dialog, tabs, etc.).
- `src/hooks/` — `useLead`, `useDiagnostic`, `useVideos`, `use-toast`, `use-mobile`.
- `src/integrations/supabase/` — `client.ts` (cliente tipado), `types.ts` (gerados/atualizados conforme o schema).
- `src/lib/` — `schemas.ts` (Zod do contato do diagnóstico) e `utils.ts` (`cn` para classes).
- `src/test/` — testes Vitest (schemas, hooks de gravação, proteção do /admin).
- `supabase/` — `config.toml`, `migrations/*.sql`.

## Fluxo de dados principais

1. **Lead:** componentes chamam `useLead().saveLead`, que faz `insert` em `leads` com `source` identificando o ponto de conversão.
2. **Diagnóstico:** `DiagnosticModal` valida contato (Zod) e respostas; `useDiagnostic().saveDiagnostic` persiste em `diagnostic_results`.
3. **Vídeos:** `useVideos` (React Query) lê `videos`; URLs públicas podem vir da coluna `public_url` ou de storage, conforme preenchimento no banco.
4. **Admin:** `DashboardStats` agrega contagens; `LeadsTable` e `DiagnosticsTable` leem as linhas. A leitura só funciona para usuários logados que estejam em `public.admins` (política RLS com `is_admin()`).

## Build e ambiente

- Prefixo **Vite:** apenas variáveis `VITE_*` são expostas ao bundle do navegador.
- Alias `@/` → `src/` (`vite.config.ts` e `tsconfig`).

## Decisões de produto refletidas no código

- Landing **pública** com inserts anônimos nas tabelas de captura (ver políticas em `SUPABASE.md`).
- **Admin** depende de **Supabase Auth** (sessão em `localStorage`) e da tabela `admins`: o redirecionamento no front é conveniência; o bloqueio real está no RLS.
