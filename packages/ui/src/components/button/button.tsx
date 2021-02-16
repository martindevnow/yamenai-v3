import React from "react";
import styled from "styled-components";

interface StyledButtonProps {
  primary?: boolean;
  backgroundColor?: string;
}

const StyledButton = styled.button<StyledButtonProps>`
  color: ${(props) => (props.primary ? "red" : "blue")};
  background-color: ${(props) => props.backgroundColor ?? "white"};
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 2px;
  min-width: 100px;
  border: none;
  cursor: pointer;
  font-family: "Roboto Mono", monospace;
`;

export interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: "small" | "medium" | "large";
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

const Button: React.FunctionComponent<ButtonProps> = ({
  children,
  label,
  onClick,
  ...props
}) => {
  return (
    <StyledButton onClick={onClick} {...props}>
      {label}
    </StyledButton>
  );
};

export default Button;
