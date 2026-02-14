-- Add unique constraint on subscriptions email to prevent duplicates
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_email_unique UNIQUE (email);

-- Allow users to view and update their own subscription using their token
CREATE POLICY "Token owner can view subscription"
ON public.subscriptions
FOR SELECT
USING (token = current_setting('request.headers', true)::json->>'x-unsubscribe-token');

CREATE POLICY "Token owner can update subscription"
ON public.subscriptions
FOR UPDATE
USING (token = current_setting('request.headers', true)::json->>'x-unsubscribe-token');
