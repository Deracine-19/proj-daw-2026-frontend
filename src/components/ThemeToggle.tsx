import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function ThemeToggle() {
  const { tema, toggleTema } = useTheme();
  const esOscuro = tema === "dark";

  return (
    <button
      onClick={toggleTema}
      title={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label="Cambiar tema"
      className="relative h-7 w-[52px] shrink-0 rounded-full border-none transition-colors"
      style={{ background: esOscuro ? "var(--color-brand)" : "var(--color-line-strong)" }}
    >
      <span
        className="absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface shadow-sm transition-all"
        style={{ left: esOscuro ? "25px" : "3px" }}
      >
        {esOscuro ? (
          <Moon className="h-3.5 w-3.5" style={{ color: "var(--color-brand)" }} />
        ) : (
          <Sun className="h-3.5 w-3.5 text-ink-muted" />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
