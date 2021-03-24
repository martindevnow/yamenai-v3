import { DefaultTheme } from "styled-components";

type Props = { theme: DefaultTheme };

// Overload for 1 layer of querying. i.e) `themeGet('primaryColor');`
function themeGet<P1 extends keyof NonNullable<DefaultTheme>>(
  prop1: P1
): ({ theme }: Props) => NonNullable<DefaultTheme>[P1] | undefined;

// Overload for 2 layers of querying. i.e) `themeGet('dark', 'primaryColor');`
function themeGet<
  P1 extends keyof NonNullable<DefaultTheme>,
  P2 extends keyof NonNullable<NonNullable<DefaultTheme>[P1]>
>(
  prop1: P1,
  prop2: P2
): ({
  theme,
}: Props) => NonNullable<NonNullable<DefaultTheme>[P1]>[P2] | undefined;

// Overload for 3 layers of querying. i.e) `themeGet('dark', 'colors', 'primary');`
function themeGet<
  P1 extends keyof NonNullable<DefaultTheme>,
  P2 extends keyof NonNullable<NonNullable<DefaultTheme>[P1]>,
  P3 extends keyof NonNullable<NonNullable<NonNullable<DefaultTheme>[P1]>[P2]>
>(
  prop1: P1,
  prop2: P2,
  prop3: P3
): ({
  theme,
}: Props) =>
  | NonNullable<NonNullable<NonNullable<DefaultTheme>[P1]>[P2]>[P3]
  | undefined;

// Overload for 4 layers of querying. i.e) `themeGet('dark', 'layout', 'main', 'xPadding');`
function themeGet<
  P1 extends keyof NonNullable<DefaultTheme>,
  P2 extends keyof NonNullable<NonNullable<DefaultTheme>[P1]>,
  P3 extends keyof NonNullable<NonNullable<NonNullable<DefaultTheme>[P1]>[P2]>,
  P4 extends keyof NonNullable<
    NonNullable<NonNullable<NonNullable<DefaultTheme>[P1]>[P2]>[P3]
  >
>(
  prop1: P1,
  prop2: P2,
  prop3: P3,
  prop4: P4
): ({
  theme,
}: Props) =>
  | NonNullable<
      NonNullable<NonNullable<NonNullable<DefaultTheme>[P1]>[P2]>[P3]
    >[P4]
  | undefined;

// ...and so on...

// If you need to query 5 layers deep, repeat the pattern above and overload the call signature with 5 arguments.
// The same implementation (below) can handle any number, but for TS to help with auto complete, etc,
// You need to follow the pattern above.

function themeGet(...props: string[]): any {
  return ({ theme }: any) =>
    theme &&
    props.reduce(
      (result, prop) => (result == null ? undefined : result[prop]),
      theme
    );
}

export default themeGet;
