import React from "react";
import styled from "styled-components";
import { MaxWidthContainer, responsiveXPadding } from "../ui";

const PaddedFooter = styled.footer`
  ${responsiveXPadding}
`;

const Container = styled(MaxWidthContainer)`
  text-align: center;
`;

const Footer = () => {
  return (
    <PaddedFooter>
      <Container>
        © {new Date().getFullYear()}, Benjamin Martin
        {` `}
        <a href="https://www.github.com/martindevnow">MartinDevNow</a>
      </Container>
    </PaddedFooter>
  );
};

export default Footer;
