import React from "react";
import { ThemeProvider as StyledComponentsThemeProvider } from "styled-components";
import useLocalStorage from "../hooks/useLocalStorage.hook";
import themes from "../styles/themes";

type Theme = "dark" | "light";

interface ThemeContextValue {
  toggle: Function;
  selectedTheme: Theme;
}

const INITIAL_THEME_CONTEXT_VALUE: ThemeContextValue = {
  selectedTheme: "light",
  toggle: () => {},
};

export const ThemeContext = React.createContext<ThemeContextValue>(
  INITIAL_THEME_CONTEXT_VALUE
);

const ThemeProvider: React.FC = ({ children }) => {
  const [selectedTheme, setSelectedTheme] = useLocalStorage<Theme>(
    "selectedTheme",
    "light"
  );

  const toggle = React.useCallback(() => {
    setSelectedTheme(selectedTheme === "light" ? "dark" : "light");
  }, [selectedTheme, setSelectedTheme]);

  return (
    <ThemeContext.Provider value={{ selectedTheme, toggle }}>
      <StyledComponentsThemeProvider theme={themes[selectedTheme]}>
        {children}
      </StyledComponentsThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
