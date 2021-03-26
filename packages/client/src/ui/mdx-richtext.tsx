import styled from "styled-components";
import themeGet from "../styles/themeGet";

const MdxRichtext = styled.div`
  li {
    margin-left: 2rem;
  }
  h1 {
    margin: 2rem 0 1rem;
  }
  h2 {
    margin: 1.5rem 0 0.75rem;
  }
  h3 {
    margin: 1.25rem 0 0.675rem;
  }
  h4 {
    margin: 1.125rem 0 0.575rem;
  }
  h5 {
    margin: 1rem 0 0.5rem;
  }
  h6 {
    margin: 0.85rem 0 0.425rem;
  }
  p {
    margin: 0.7rem 0;
  }
  blockquote {
    p {
      padding-left: 1rem;
      border-left: 2px solid red;
      color: ${themeGet("colors", "textSofter")};
    }
  }
`;

export default MdxRichtext;
