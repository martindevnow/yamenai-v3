import React from "react";
import styled from "styled-components";
import Logo from "./logo";
import { MaxWidthContainer, PaddedWrapper } from "../ui";
import Link from "../ui/link";
// import { XLHeader } from "../ui/headers";

const Wrapper = styled(PaddedWrapper)`
  min-height: 75px;
  display: flex;
  align-items: center;
`;

const Container = styled(MaxWidthContainer)`
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
`;

const Header = () => {
  return (
    <Wrapper>
      <Container>
        {/* <XLHeader as="h1">Yamenai</XLHeader> */}
        <Link to="/">
          <Logo />
        </Link>
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/work">Work</Link>
      </Container>
    </Wrapper>
  );
};

export default Header;
