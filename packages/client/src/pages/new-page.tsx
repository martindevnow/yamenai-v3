import React from "react";
import { graphql } from "gatsby";

const NewPage = ({ data }: { data: GatsbyTypes.NewPageQuery }) => {
  console.log(data);
  return (
    <div>
      <h1>New Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default NewPage;

export const newPageQuery = graphql`
  query NewPage {
    sanityPost {
      title
      slug {
        current
      }
      body {
        children {
          _key
          _type
          marks
          text
        }
        _type
        _key
        _rawChildren
        list
        style
      }
      author {
        id
        name
      }
      publishedAt(formatString: "YYYY-MM-DD")
    }
  }
`;
