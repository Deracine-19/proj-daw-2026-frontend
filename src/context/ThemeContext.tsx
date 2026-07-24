import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Tema = "dark" | "light";

interface ThemeContextType {
  tema: Tema;
  toggleTema: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => (localStorage.getItem("tema") as Tema) ?? "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("light", tema === "light");
    localStorage.setItem("tema", tema);
  }, [tema]);

  function toggleTema() {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }

  return <ThemeContext.Provider value={{ tema, toggleTema }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
}