/**
 * Maps database/API errors to user-friendly messages.
 * Prevents leaking internal details like table names, policies, or schema info.
 */
export function sanitizeError(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const err = error as { code?: string; message?: string };
  const code = err.code || "";

  const errorMap: Record<string, string> = {
    "23505": "This item already exists.",
    "23503": "Cannot remove: this item is still in use.",
    "42501": "You don't have permission to perform this action.",
    "PGRST116": "Item not found.",
    "PGRST301": "You don't have permission to perform this action.",
    "PGRST204": "You don't have permission to perform this action.",
  };

  if (code && errorMap[code]) return errorMap[code];

  // Check for common RLS / permission patterns in message
  const msg = err.message || "";
  if (msg.includes("row-level security") || msg.includes("policy")) {
    return "You don't have permission to perform this action.";
  }

  return "An error occurred. Please try again.";
}
