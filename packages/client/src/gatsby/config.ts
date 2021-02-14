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
    {
      resolve: "gatsby-plugin-typegen",
      options: {
        outputPath: path.resolve(
          __dirname,
          "../../__generated__/gatsby-types.d.ts"
        ),
      },
    },
  ],
};

export default config;
