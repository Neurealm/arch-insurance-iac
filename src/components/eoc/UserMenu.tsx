import { useUserProfile } from "@/hooks/useUserProfile";

export function UserMenu({ className = "" }: { className?: string }) {
  const { displayName, initials } = useUserProfile();
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="text-right leading-tight">
        <div className="text-sm font-semibold text-foreground">{displayName}</div>
      </div>
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-sm font-semibold shadow-[var(--shadow-md)]">
        {initials}
      </div>
    </div>
  );
}