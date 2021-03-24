import styled, { css } from "styled-components";
import themeGet from "../styles/themeGet";

export const MaxWidthContainer = styled.div`
  margin: 0 auto;
  max-width: ${themeGet("layout", "maxWidth")};
`;

export const responsiveXPadding = css`
  padding-left: ${themeGet("layout", "padding", "xl")};
  padding-right: ${themeGet("layout", "padding", "xl")};

  @media (max-width: ${themeGet("breakpoints", "lg")}) {
    padding-left: ${themeGet("layout", "padding", "lg")};
    padding-right: ${themeGet("layout", "padding", "lg")};
  }

  @media (max-width: ${themeGet("breakpoints", "md")}) {
    padding-left: ${themeGet("layout", "padding", "md")};
    padding-right: ${themeGet("layout", "padding", "md")};
  }

  @media (max-width: ${themeGet("breakpoints", "sm")}) {
    padding-left: ${themeGet("layout", "padding", "sm")};
    padding-right: ${themeGet("layout", "padding", "sm")};
  }
`;

export const PaddedWrapper = styled.div`
  ${responsiveXPadding}
`;
