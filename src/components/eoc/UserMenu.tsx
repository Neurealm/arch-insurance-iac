import { KeyRound, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ className = "" }: { className?: string }) {
  const { displayName, initials, email, signOut } = useUserProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
          aria-label="Open account menu"
        >
          <div className="text-right leading-tight">
            <div className="text-sm font-semibold text-foreground">{displayName}</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-sm font-semibold shadow-[var(--shadow-md)]">
            {initials}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{displayName}</div>
            {email && <div className="text-xs text-muted-foreground truncate">{email}</div>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings/change-password")}>
          <KeyRound className="h-4 w-4 mr-2" /> Change password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
