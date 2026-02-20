
-- Drop token-based RLS policies that rely on spoofable client headers
DROP POLICY IF EXISTS "Token owner can view subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Token owner can update subscription" ON public.subscriptions;
