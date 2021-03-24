import React from "react";
import styled from "styled-components";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { ImageDataLike } from "gatsby-plugin-image/dist/components/hooks";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Bio = () => {
  const data = useStaticQuery<GatsbyTypes.BioQueryQuery>(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.png/" }) {
        childImageSharp {
          gatsbyImageData(width: 200)
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `);

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site?.siteMetadata?.author;
  const social = data.site?.siteMetadata?.social;

  const imageData = data?.avatar as ImageDataLike;
  const avatar = getImage(imageData);

  return (
    <Wrapper>
      {avatar && (
        <GatsbyImage
          image={avatar}
          alt={author?.name || ``}
          className="bio-avatar"
          imgStyle={{
            borderRadius: `50%`,
          }}
        />
      )}
      {author?.name && (
        <div>
          <p>
            Written by <strong>{author.name}</strong> {author?.summary || null}
          </p>
          <p>
            <a href={`https://twitter.com/${social?.twitter || ``}`}>
              You should follow them on Twitter
            </a>
          </p>
        </div>
      )}
    </Wrapper>
  );
};

export default Bio;
