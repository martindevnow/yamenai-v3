import React from "react";
import { Link, graphql } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import { MaxWidthContainer, PaddedWrapper, responsiveXPadding } from "../ui";
import BlogSummary from "../components/blog-summary";
import styled from "styled-components";

const LatestBlogs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const BlogIndex = ({
  data,
  location,
}: {
  data: GatsbyTypes.BlogPageQuery;
  location: Location;
}) => {
  const siteTitle = data.site?.siteMetadata?.title || `Default Title`;
  const posts = data.posts.nodes;

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <SEO title="All posts" />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    );
  }

  return (
    <Layout location={location} title={siteTitle}>
      <PaddedWrapper>
        <MaxWidthContainer>
          <SEO title="All posts" />
          <LatestBlogs>
            {posts.map((post) => (
              <BlogSummary
                post={{
                  ...post,
                  title: post.frontmatter.title || post.fields.slug,
                }}
              />
            ))}
          </LatestBlogs>
        </MaxWidthContainer>
      </PaddedWrapper>
    </Layout>
  );
};

export default BlogIndex;

export const pageQuery = graphql`
  query BlogPage {
    site {
      siteMetadata {
        title
      }
    }
    posts: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`;
