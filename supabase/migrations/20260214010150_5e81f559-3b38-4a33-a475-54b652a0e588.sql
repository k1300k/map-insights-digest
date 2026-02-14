
-- Helper function to check admin (service role)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_setting('role', true) = 'service_role'
$$;

-- Sources table
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rss', 'html')),
  url TEXT NOT NULL,
  parser_type TEXT NOT NULL DEFAULT 'default',
  region_hint TEXT NOT NULL DEFAULT 'Unknown' CHECK (region_hint IN ('NA', 'EU', 'KR', 'Unknown')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keywords table
CREATE TABLE public.keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('include', 'exclude')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report runs table
CREATE TABLE public.report_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_articles INTEGER NOT NULL DEFAULT 0,
  filtered_articles INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report items table
CREATE TABLE public.report_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_run_id UUID NOT NULL REFERENCES public.report_runs(id) ON DELETE CASCADE,
  region TEXT NOT NULL DEFAULT 'Unknown' CHECK (region IN ('NA', 'EU', 'KR', 'Unknown')),
  title_ko TEXT NOT NULL,
  title_en TEXT NOT NULL,
  summary_ko TEXT[] NOT NULL DEFAULT '{}',
  summary_en TEXT[] NOT NULL DEFAULT '{}',
  impact_ko TEXT NOT NULL DEFAULT '',
  impact_en TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  confidence NUMERIC NOT NULL DEFAULT 0,
  relevance_score NUMERIC NOT NULL DEFAULT 0,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Public read for sources, keywords, report_runs, report_items
CREATE POLICY "Public read sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Public read keywords" ON public.keywords FOR SELECT USING (true);
CREATE POLICY "Public read report_runs" ON public.report_runs FOR SELECT USING (true);
CREATE POLICY "Public read report_items" ON public.report_items FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admin insert sources" ON public.sources FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update sources" ON public.sources FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete sources" ON public.sources FOR DELETE USING (public.is_admin());

CREATE POLICY "Admin insert keywords" ON public.keywords FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update keywords" ON public.keywords FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete keywords" ON public.keywords FOR DELETE USING (public.is_admin());

CREATE POLICY "Admin insert report_runs" ON public.report_runs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update report_runs" ON public.report_runs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete report_runs" ON public.report_runs FOR DELETE USING (public.is_admin());

CREATE POLICY "Admin insert report_items" ON public.report_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update report_items" ON public.report_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete report_items" ON public.report_items FOR DELETE USING (public.is_admin());

-- Subscriptions: admin only for all operations (protect tokens)
CREATE POLICY "Admin read subscriptions" ON public.subscriptions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin insert subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update subscriptions" ON public.subscriptions FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete subscriptions" ON public.subscriptions FOR DELETE USING (public.is_admin());

-- Allow anonymous subscription via edge function - public insert for subscriptions (email + token only)
CREATE POLICY "Public subscribe" ON public.subscriptions FOR INSERT WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON public.keywords FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_report_runs_updated_at BEFORE UPDATE ON public.report_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_report_items_updated_at BEFORE UPDATE ON public.report_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
