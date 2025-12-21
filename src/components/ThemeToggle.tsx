import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored === "dark" || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`relative h-9 w-9 rounded-full transition-all duration-300 ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className={`h-5 w-5 absolute transition-all duration-500 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
      <Moon className={`h-5 w-5 absolute transition-all duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
    </Button>
  );
};

export default ThemeToggle;
