import { css, DefaultTheme } from "styled-components";
import { Breakpoint } from "./styled";
import themeGet from "./themeGet";

export const darkTheme: DefaultTheme = {
  border: {
    radius: "4px",
    light: "1px solid rgb(206 206 206 / 56%)",
    normal: "1px solid rgb(206 206 206 / 70%)",
  },
  boxShadow: {
    navbar: "none",
  },
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1200px",
  },
  colors: {
    primary: "rgb(232 75 78)",
    onPrimary: "#f1f1f1",
    secondary: "#222",
    onSecondary: "#f1f1f1",
    background: "#222",
    text: "#f1f1f1",
    textSoft: "#d9d9d9",
    textSofter: "#c1c1c1",
    success: "green",
    warning: "yellow",
    error: "#ff0022",
  },
  fonts: {
    heading: "Inconsolata",
    copy: "Roboto",
    serif: "'Merriweather','Georgia',serif",
    sansSerif: "Montserrat,sans-serif",
  },
  fontSizes: {
    heading: {
      xxl: "130px",
      xl: "98px",
      lg: "50px",
      md: "30px",
      sm: "18px",
    },
    copy: {
      xxl: "60px",
      xl: "40px",
      lg: "30px",
      md: "20px",
      sm: "14px",
    },
  },
  fontWeight: {
    light: "300",
    normal: "400",
    bold: "700",
  },
  layout: {
    maxWidth: "736px",
    padding: {
      sm: "1rem",
      md: "2rem",
      lg: "3rem",
      xl: "4rem",
    },
    navigation: {
      height: "65px",
    },
  },
};

export const lightTheme: DefaultTheme = {
  border: {
    radius: "4px",
    light: "1px solid rgb(17 31 93 / 5%)",
    normal: "1px solid rgb(17 31 93 / 15%)",
  },
  boxShadow: {
    navbar: "rgb(17 31 93 / 5%) 3px 0px 30px, rgb(27 27 43 / 9%) 2px 0px 5px",
  },
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1200px",
  },
  colors: {
    primary: "rgb(232 75 78)",
    onPrimary: "#f1f1f1",
    secondary: "#f1f1f1",
    onSecondary: "black",
    background: "#f1f1f1",
    text: "#000000",
    textSoft: "#242424",
    textSofter: "#2e2e2e",
    success: "green",
    warning: "yellow",
    error: "#ff0022",
  },
  fonts: {
    heading: "Inconsolata",
    copy: "Roboto",
    serif: "'Merriweather','Georgia',serif",
    sansSerif: "Montserrat,sans-serif",
  },
  fontSizes: {
    heading: {
      xxl: "130px",
      xl: "98px",
      lg: "50px",
      md: "30px",
      sm: "18px",
    },
    copy: {
      xxl: "60px",
      xl: "40px",
      lg: "30px",
      md: "20px",
      sm: "14px",
    },
  },
  fontWeight: {
    light: "300",
    normal: "400",
    bold: "700",
  },
  layout: {
    maxWidth: "736px",
    padding: {
      sm: "1rem",
      md: "2rem",
      lg: "3rem",
      xl: "4rem",
    },
    navigation: {
      height: "65px",
    },
  },
};

export const media = (breakpoint: Breakpoint) => (mediaCss: any) => css`
  @media all and (max-width: ${themeGet("breakpoints", breakpoint)}) {
    ${mediaCss}
  }
`;

export default { dark: darkTheme, light: lightTheme };
