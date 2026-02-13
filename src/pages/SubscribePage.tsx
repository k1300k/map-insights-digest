import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubscribePage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    toast({ title: "Subscribed!", description: `Daily reports will be sent to ${email}` });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
      <div className="text-center mb-8 pt-8 sm:pt-16">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Subscribe to GMIR</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Get daily Google Maps intelligence reports delivered to your inbox at 07:00 KST.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-xl border border-primary/30 bg-accent p-6 text-center animate-fade-in">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary mb-3">
            <Check className="h-5 w-5 text-primary-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">You're subscribed!</p>
          <p className="text-xs text-muted-foreground mt-1">Check your inbox for a confirmation email.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Subscribe
          </button>
          <p className="text-[10px] text-center text-muted-foreground">
            You can unsubscribe at any time via the link in each email.
          </p>
        </form>
      )}
    </div>
  );
}
