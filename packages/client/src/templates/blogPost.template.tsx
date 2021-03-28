import React from "react";
import { Link, graphql } from "gatsby";
import styled from "styled-components";

import Bio from "../components/bio";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { MaxWidthContainer, PaddedWrapper } from "../ui";
import MdxRichtext from "../ui/mdx-richtext";
import { MDHeader } from "../ui/headers";
import themeGet from "../styles/themeGet";

const rhythm = (num: number) => `${(6 - num) * 5}px`;

const StyledHeader = styled(MDHeader)`
  color: ${themeGet("colors", "primary")};
  margin-top: ${themeGet("layout", "padding", "lg")};
`;

type BlogPostTemplateProps = {
  data: GatsbyTypes.BlogPostBySlugQuery;
  pageContext: GatsbyTypes.SitePageContext;
  location: Location;
};

const BlogPostTemplate: React.FC<BlogPostTemplateProps> = ({
  data,
  pageContext,
  location,
}) => {
  const post = data.post;
  const siteTitle = data.site.siteMetadata.title;
  const { previous, next } = pageContext;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <PaddedWrapper>
        <MaxWidthContainer>
          <article>
            <header>
              <StyledHeader>{post.frontmatter.title}</StyledHeader>
              <p
                style={{
                  display: `block`,
                  marginBottom: rhythm(1),
                }}
              >
                {post.frontmatter.date}
              </p>
            </header>
            <MdxRichtext>
              <section dangerouslySetInnerHTML={{ __html: post.html }} />
            </MdxRichtext>
            <hr
              style={{
                marginBottom: rhythm(1),
              }}
            />
            <footer>
              <Bio />
            </footer>
          </article>
        </MaxWidthContainer>
      </PaddedWrapper>

      <PaddedWrapper>
        <MaxWidthContainer>
          <nav>
            <ul
              style={{
                display: `flex`,
                flexWrap: `wrap`,
                justifyContent: `space-between`,
                listStyle: `none`,
                padding: 0,
              }}
            >
              <li>
                {previous && (
                  <Link to={previous.fields.slug} rel="prev">
                    ← {previous.frontmatter.title}
                  </Link>
                )}
              </li>
              <li>
                {next && (
                  <Link to={next.fields.slug} rel="next">
                    {next.frontmatter.title} →
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </MaxWidthContainer>
      </PaddedWrapper>
    </Layout>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`;
