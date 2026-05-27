ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS is_draft boolean NOT NULL DEFAULT false;
ALTER TABLE public.dreams ALTER COLUMN interpretation DROP NOT NULL;