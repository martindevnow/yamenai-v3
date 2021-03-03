import type { GatsbyConfig } from "gatsby";

import path from "path";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Benjamin Martin - Dev`,
    author: {
      name: `Ben Martin`,
      summary: `who lives and works in Halton Hills, ON building useful things.`,
    },
    description: `Iunno - Dev stuff?`,
    siteUrl: `https://benjaminmartin.dev/`,
    social: {
      twitter: `martindevnow`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: path.resolve(__dirname, `../../content/blog`),
        name: `localBlog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: path.resolve(__dirname, `../../content/assets`),
        name: `localAssets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    {
      resolve: "gatsby-source-sanity",
      options: {
        projectId: "wp3daro0",
        dataset: "production",
      },
    },
    "gatsby-plugin-styled-components",
    // {
    //   resolve: "gatsby-plugin-google-analytics",
    //   options: {
    //     trackingId: "",
    //   },
    // },
    "gatsby-plugin-sharp",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    "gatsby-plugin-mdx",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: path.resolve(__dirname, "../images"),
      },
      //   __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      //   __key: "pages",
    },
    // {
    //   resolve: `gatsby-plugin-typography`,
    //   options: {
    //     pathToConfigModule: `src/utils/typography`,
    //   },
    // },
    {
      resolve: "gatsby-plugin-typegen",
      options: {
        outputPath: path.resolve(
          __dirname,
          "../../__generated__/gatsby-types.d.ts"
        ),
      },
    },
    // Testing "gatsby-plugin-codegen" to see if it can generate
    // types for the gatsby-node functions (createPages, etc)
    // {
    //   resolve: "gatsby-plugin-codegen",
    //   options: {
    //     output: "__codegen__",
    //   },
    // },
  ],
};

export default config;
