import { useTheme } from "@/context/ThemeContext";

function ThemeToggle() {
  const { tema, toggleTema } = useTheme();
  return (
    <button
      onClick={toggleTema}
      title={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex h-8 w-8 items-center justify-center rounded-full text-base hover:bg-hover-strong"
    >
      {tema === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export default ThemeToggle;