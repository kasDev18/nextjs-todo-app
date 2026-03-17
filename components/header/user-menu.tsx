"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import styles from "./styles.module.css";

type UserMenuProps = {
  name?: string | null;
  email: string;
};

function getInitials(name?: string | null, email?: string) {
  const value = name?.trim() || email || "U";
  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

export function UserMenu({ name, email }: UserMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const displayName = name?.trim() || email;
  const initials = getInitials(name, email);

  async function handleSignOut() {
    setIsSigningOut(true);

    const { error } = await signOut();

    if (error) {
      setIsSigningOut(false);
      toast.error(error.message ?? "Unable to sign out right now.");
      return;
    }

    router.replace("/signin");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={styles.Header_userBtn}
          aria-label={`Open account menu for ${displayName}`}
        >
          <span className={styles.Header_userAvatar} aria-hidden="true">
            {initials}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.Header_userMenu}>
        <DropdownMenuLabel className={styles.Header_userMenuLabel}>
          <span className={styles.Header_userMenuEyebrow}>Signed in as</span>
          <span className={styles.Header_userMenuName}>{displayName}</span>
          <span className={styles.Header_userMenuEmail}>{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            event.preventDefault();

            if (!isSigningOut) {
              void handleSignOut();
            }
          }}
          disabled={isSigningOut}
        >
          <LogOutIcon />
          {isSigningOut ? "Signing out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
