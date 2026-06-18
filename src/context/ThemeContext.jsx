import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const themes = {
  dark: {
    bg: "#0A0F0A",
    surface: "#111811",
    surface2: "#0D150D",
    border: "#1A2A1A",
    border2: "#1E2E1E",
    text: "#E0EFD8",
    textMuted: "#8AAE82",
    textDim: "#4A6B44",
    accent: "#7FD67A",
    accentText: "#0A0F0A",
    warning: "#FFD166",
    danger: "#EF6351",
  },
  light: {
    bg: "#F4F9F0",
    surface: "#FFFFFF",
    surface2: "#EDF5E8",
    border: "#C8DFC0",
    border2: "#D5E8CC",
    text: "#1A2E1A",
    textMuted: "#4A7A42",
    textDim: "#7AAA72",
    accent: "#3A9E35",
    accentText: "#FFFFFF",
    warning: "#B8860B",
    danger: "#C0392B",
  }
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("pd_theme") || "dark");
  const theme = themes[mode];

  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    localStorage.setItem("pd_theme", next);
  };

  return (
    <ThemeContext.Provider value={{ mode, theme, toggle }}>
      <div style={{ background: theme.bg, minHeight: "100vh", transition: "background 0.2s" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
