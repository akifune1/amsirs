"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  /** compact = icon-only button (for sidebar collapsed / mobile), default = icon + label */
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={
        compact
          ? "flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-cavite-maroon hover:bg-[var(--sys-maroon-tint)] transition-all"
          : "flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:text-cavite-maroon hover:bg-[var(--sys-maroon-tint)] transition-all font-medium text-sm w-full"
      }
    >
      {isDark ? (
        <Sun className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
      ) : (
        <Moon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
      )}
      {!compact && (
        <span className="hidden lg:block">{isDark ? "Light Mode" : "Dark Mode"}</span>
      )}
    </button>
  );
}
