// import original module declarations
import "styled-components";
import {} from "styled-components/cssprop";

type Breakpoint = "sm" | "md" | "lg" | "xl";

type ByBreakpoint<T> = {
  [key in Breakpoint]: T;
};

// and extend them!
declare module "styled-components" {
  export interface DefaultTheme {
    border: {
      radius: string;
      light: string;
      normal: string;
    };
    boxShadow: {
      navbar: string;
    };
    breakpoints: ByBreakpoint<string>;
    fonts: {
      heading: string;
      copy: string;
      serif: string;
      sansSerif: string;
    };
    fontSizes: {
      heading: {
        xxl: string;
        xl: string;
        lg: string;
        md: string;
        sm: string;
      };
      copy: {
        xxl: string;
        xl: string;
        lg: string;
        md: string;
        sm: string;
      };
    };
    fontWeight: {
      light: string;
      normal: string;
      bold: string;
    };
    layout: {
      maxWidth: string;
      padding: ByBreakpoint<string>;
      navigation: {
        height: string;
      };
    };
    colors: {
      primary: string;
      onPrimary: string;
      secondary: string;
      onSecondary: string;
      background: string;
      text: string;
      success: string;
      warning: string;
      error: string;
    };
  }
}
