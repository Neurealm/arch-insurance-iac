import { useUserProfile } from "@/hooks/useUserProfile";
import { AccountPanel } from "@/components/account/AccountPanel";

/**
 * The avatar/name chip that opens the full Account panel (Profile, Availability,
 * Notifications, Security). Sign-out and change-password remain reachable from
 * within the panel itself.
 */
export function UserMenu({ className = "" }: { className?: string }) {
  const { displayName, initials } = useUserProfile();

  return (
    <AccountPanel>
      <button
        type="button"
        className={`flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        aria-label="Open account panel"
      >
        <div className="text-right leading-tight">
          <div className="text-sm font-semibold text-foreground">{displayName}</div>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-sm font-semibold shadow-[var(--shadow-md)]">
          {initials}
        </div>
      </button>
    </AccountPanel>
  );
}
