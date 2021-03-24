import styled, { css } from "styled-components";
import themeGet from "../styles/themeGet";

export const commonHeaderStyles = css`
  font-family: ${themeGet("fonts", "heading")};
  letter-spacing: 0;
`;

export const xxlHeaderSize = css`
  font-size: ${themeGet("fontSizes", "heading", "xxl")};
`;

export const xlHeaderSize = css`
  font-size: ${themeGet("fontSizes", "heading", "xl")};
`;

export const lgHeaderSize = css`
  font-size: ${themeGet("fontSizes", "heading", "lg")};
`;

export const mdHeaderSize = css`
  font-size: ${themeGet("fontSizes", "heading", "md")};
`;

export const smHeaderSize = css`
  font-size: ${themeGet("fontSizes", "heading", "sm")};
`;

export const XXLHeader = styled.h1`
  ${commonHeaderStyles}
  ${xxlHeaderSize}
  @media (max-width: ${themeGet("breakpoints", "md")}) {
    ${xlHeaderSize}
  }
  @media (max-width: ${themeGet("breakpoints", "sm")}) {
    ${lgHeaderSize}
  }
`;

export const XLHeader = styled.h2`
  ${commonHeaderStyles}
  ${xlHeaderSize}
  @media (max-width: ${themeGet("breakpoints", "md")}) {
    ${lgHeaderSize}
  }
  @media (max-width: ${themeGet("breakpoints", "sm")}) {
    ${mdHeaderSize}
  }
`;

export const LGHeader = styled.h2`
  ${commonHeaderStyles}
  ${lgHeaderSize}
  @media (max-width: ${themeGet("breakpoints", "md")}) {
    ${mdHeaderSize}
  }
`;

export const MDHeader = styled.h3`
  ${commonHeaderStyles}
  ${mdHeaderSize}
`;

export const SMHeader = styled.h3`
  ${commonHeaderStyles}
  ${smHeaderSize}
`;
