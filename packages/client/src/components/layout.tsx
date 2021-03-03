import React from "react";
import { Link } from "gatsby";

type LayoutProps = {
  location: Location;
  title: string;
};

const Layout: React.FC<LayoutProps> = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;
  const isRootPath = location.pathname === rootPath;
  let header;

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    );
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    );
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Benjamin Martin
        {` `}
        <a href="https://www.github.com/martindevnow">MartinDevNow</a>
      </footer>
    </div>
  );
};

export default Layout;
