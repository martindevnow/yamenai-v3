import React from "react";
import styled, { useTheme } from "styled-components";
import themeGet from "../styles/themeGet";
import { MDHeader } from "../ui/headers";
import Link from "../ui/link";

const StyledHeader = styled(MDHeader)`
  color: ${themeGet("colors", "primary")};
`;

const StyledSection = styled.section`
  margin-top: 7px;
`;

const BlogSummary = ({
  post,
  className,
}: {
  post: any;
  className?: string;
}) => {
  const theme = useTheme();

  return (
    <article
      className={className}
      key={post.fields.slug}
      itemScope
      itemType="http://schema.org/Article"
    >
      <header>
        <StyledHeader>
          <Link to={post.fields?.slug} itemProp="url">
            <span itemProp="headline">{post.title}</span>
          </Link>
        </StyledHeader>
        <small>{post.frontmatter.date}</small>
      </header>
      <StyledSection>
        <p
          dangerouslySetInnerHTML={{
            __html: post.frontmatter.description || post.excerpt,
          }}
          itemProp="description"
        />
      </StyledSection>
    </article>
  );
};

export default BlogSummary;
