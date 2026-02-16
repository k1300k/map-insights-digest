
-- Create ai_config table to store AI engine settings
CREATE TABLE public.ai_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL DEFAULT 'lovable',
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  api_key text DEFAULT NULL,
  endpoint_url text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

-- Only admin can read/write
CREATE POLICY "Admin read ai_config" ON public.ai_config FOR SELECT USING (is_admin());
CREATE POLICY "Admin insert ai_config" ON public.ai_config FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update ai_config" ON public.ai_config FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete ai_config" ON public.ai_config FOR DELETE USING (is_admin());

-- Public read for edge function (service role will bypass RLS anyway)
CREATE POLICY "Public read ai_config" ON public.ai_config FOR SELECT USING (true);

-- Insert default config
INSERT INTO public.ai_config (provider, model, api_key, endpoint_url)
VALUES ('lovable', 'google/gemini-2.5-flash', NULL, 'https://ai.gateway.lovable.dev/v1/chat/completions');

-- Add update trigger
CREATE TRIGGER update_ai_config_updated_at
BEFORE UPDATE ON public.ai_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
