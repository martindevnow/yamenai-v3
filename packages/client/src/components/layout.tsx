import React from "react";

import Header from "./header";
import ThemeProvider from "../providers/themeProvider";
import GlobalStyle from "../styles/global";
import Footer from "./footer";
import "../styles/index.css";

type LayoutProps = {
  location: Location;
  title: string;
};

const Layout: React.FC<LayoutProps> = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;
  const isRootPath = location.pathname === rootPath;

  return (
    <ThemeProvider>
      <GlobalStyle />

      <div data-is-root-path={isRootPath}>
        <Header />
        <main>{children}</main>
      </div>
      <Footer />
    </ThemeProvider>
  );
};

export default Layout;
