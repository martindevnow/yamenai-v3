import { GatsbyNode } from "gatsby";
import * as path from "path";
import { createFilePath } from "gatsby-source-filesystem";

export const createPages: GatsbyNode["createPages"] = async ({
  actions,
  graphql,
}) => {
  const { createPage } = actions;

  const blogPost = path.resolve(`./src/templates/blogPost.template.tsx`);
  const result = await graphql(
    `
      query LocalBlogPosts {
        allMarkdownRemark {
          nodes {
            frontmatter {
              date(formatString: "YYYY-MM-DD")
              description
              title
            }
            timeToRead
            fields {
              slug
            }
            wordCount {
              words
              sentences
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create blog posts pages.
  const posts: any[] = (result.data as any).allMarkdownRemark.nodes;

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1];
    const next = index === 0 ? null : posts[index - 1];

    console.log(`Creating Page: ${post.fields.slug}`);
    createPage({
      path: post.fields.slug,
      component: blogPost,
      context: {
        slug: post.fields.slug,
        previous,
        next,
      },
    });
  });
};

export const onCreateNode: GatsbyNode["onCreateNode"] = async ({
  node,
  actions,
  getNode,
}) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
