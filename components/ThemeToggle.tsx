"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

const emptySubscribe = () => () => { };
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="rounded-full" disabled>
        <span className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <MoonIcon className="animate-in spin-in-180 zoom-in-75 size-4 duration-300" />
      ) : (
        <SunIcon className="animate-in spin-in-180 zoom-in-75 size-4 duration-300" />
      )}
    </Button>
  );
}
