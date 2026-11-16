-- Leitura de leads e diagnósticos restrita a administradores, e RLS na tabela de vídeos.
-- Antes: só havia políticas de INSERT; a leitura do /admin dependia de regras criadas fora do repositório.
-- Idempotente: pode rodar em um banco que já tenha parte disto.

CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin vê o próprio registro" ON public.admins;
CREATE POLICY "Admin vê o próprio registro"
ON public.admins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- SECURITY DEFINER para a checagem não depender das políticas da própria tabela admins.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admin lê leads" ON public.leads;
CREATE POLICY "Admin lê leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admin lê diagnósticos" ON public.diagnostic_results;
CREATE POLICY "Admin lê diagnósticos"
ON public.diagnostic_results
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Vídeos de depoimento: leitura pública, escrita só pelo service role (script de upload).
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vídeos são públicos" ON public.videos;
CREATE POLICY "Vídeos são públicos"
ON public.videos
FOR SELECT
TO anon, authenticated
USING (true);

-- Para liberar um administrador (rodar no SQL Editor, com o e-mail real):
-- INSERT INTO public.admins (user_id) SELECT id FROM auth.users WHERE email = 'pessoa@exemplo.com';
