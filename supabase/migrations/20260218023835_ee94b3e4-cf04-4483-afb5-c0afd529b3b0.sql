
-- Move pg_net extension out of the public schema into the extensions schema
-- pg_cron is managed by Supabase internally and cannot be moved
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- SSRF protection: validate source URLs before insert/update
CREATE OR REPLACE FUNCTION public.validate_source_url()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only allow http/https protocols
  IF NEW.url !~* '^https?://' THEN
    RAISE EXCEPTION 'Only HTTP and HTTPS URLs are allowed';
  END IF;

  -- Block private IPs, localhost, and cloud metadata endpoints
  IF NEW.url ~* '(localhost|127\.|0\.0\.0\.0|169\.254\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)' THEN
    RAISE EXCEPTION 'Private IP addresses and localhost are not allowed in source URLs';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_source_url_trigger ON public.sources;
CREATE TRIGGER validate_source_url_trigger
  BEFORE INSERT OR UPDATE ON public.sources
  FOR EACH ROW EXECUTE FUNCTION public.validate_source_url();
