# Supabase — dados e políticas

## Variáveis de ambiente (front-end)

| Variável | Uso |
|----------|-----|
| `VITE_SUPABASE_URL` | URL do projeto |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anon (publishable), usada em `src/integrations/supabase/client.ts` |

Nunca commite chaves de **service role** no repositório.

## Tabelas (conforme migrations)

### `diagnostic_results`

Resultado do fluxo de diagnóstico: nome, telefone, e-mail opcional, nível atual, experiência, objetivo, dificuldade, prazo desejado, disponibilidade por semana, faixa etária e preferência de aula (presencial/online/etc.).

### `leads`

Interesse genérico: nome, telefone, e-mail opcional, `source` (origem na página), `message` e `metadata` (JSON opcional).

### `videos`

Metadados de vídeos (título, arquivo, caminho no storage, URL pública, JSON de metadados). Usado pelos depoimentos em vídeo na landing.

## Row Level Security (RLS)

| Tabela | anon | authenticated | admin (`is_admin()`) |
|---|---|---|---|
| `leads` | INSERT | INSERT | INSERT, SELECT |
| `diagnostic_results` | INSERT | INSERT | INSERT, SELECT |
| `videos` | SELECT | SELECT | SELECT |
| `admins` | — | SELECT do próprio registro | — |

Escrita em `videos` fica só com a chave service role, usada pelo `scripts/upload-videos.mjs` na máquina local.

A política de leitura do painel está em `migrations/20261116120000_admin_read_policies.sql`. `is_admin()` é `SECURITY DEFINER` para checar a tabela `admins` sem depender das políticas dela.

### Liberar um administrador

1. Crie o usuário em **Authentication → Users** no Supabase.
2. No SQL Editor:

```sql
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE email = 'pessoa@exemplo.com';
```

### Histórico das migrações

`20251022...` e `20251025...` criam as mesmas tabelas; a segunda usa `IF NOT EXISTS` e só repete as políticas de INSERT. Elas foram mantidas como estão porque já foram aplicadas em produção, e reescrever migrações aplicadas quebra o histórico do Supabase.

## Storage

Se os vídeos forem servidos pelo bucket (ex.: `videos`), mantenha regras que permitam leitura pública apenas do necessário e escrita restrita a contas de serviço ou painel.

## CLI (opcional)

```bash
supabase link --project-ref <ref>
supabase db push
```

Comandos exatos dependem da versão da CLI e do fluxo do projeto; consulte a [documentação oficial do Supabase](https://supabase.com/docs).
