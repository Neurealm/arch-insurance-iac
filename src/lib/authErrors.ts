// Maps raw Supabase auth error messages to friendly, user-safe copy.
// Keeps the exact backend wording out of the UI while staying actionable.
export function friendlyAuthError(message?: string | null): string {
  const m = (message ?? "").toLowerCase();
  if (!m) return "Something went wrong. Please try again.";
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for the verification link.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("for security purposes"))
    return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("pwned") || m.includes("leaked") || m.includes("breach") || m.includes("weak"))
    return "That password appears in known breach lists — please choose a different one.";
  if (m.includes("work email") || m.includes("personal email"))
    return "Please use your work email — personal email domains aren't allowed.";
  if (m.includes("password") && (m.includes("should") || m.includes("at least") || m.includes("characters")))
    return "Your password must be at least 12 characters with an uppercase letter, lowercase letter, number, and symbol.";
  if (m.includes("session") || m.includes("expired"))
    return "Your session expired. Please sign in again.";
  if (m.includes("user not found") || m.includes("no user"))
    return "No account found for that email.";
  return "Something went wrong. Please try again.";
}
