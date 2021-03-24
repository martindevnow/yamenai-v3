import { normalize } from "polished";
import { createGlobalStyle } from "styled-components";
import themeGet from "./themeGet";

const GlobalStyle = createGlobalStyle`
  ${normalize()}
  body {
    background-color: ${themeGet("colors", "background")};
    color: ${themeGet("colors", "text")};
    font-family: ${themeGet("fonts", "copy")}
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
      monospace;
    background-color: ${themeGet("colors", "background")};
    border: 1px solid ${themeGet("colors", "primary")};
    border-radius: ${themeGet("border", "radius")};
    padding: 0.2rem;
  }

`;

export default GlobalStyle;
