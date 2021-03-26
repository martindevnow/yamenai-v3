import React from "react";
import { Link, graphql } from "gatsby";

import Bio from "../components/bio";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { MaxWidthContainer, PaddedWrapper } from "../ui";
import MdxRichtext from "../ui/mdx-richtext";

const rhythm = (num: number) => `${(6 - num) * 5}px`;
const scale = (...args: any[]) => ({});

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
              <h1
                style={{
                  marginTop: rhythm(1),
                  marginBottom: 0,
                }}
              >
                {post.frontmatter.title}
              </h1>
              <p
                style={{
                  ...scale(-1 / 5),
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
