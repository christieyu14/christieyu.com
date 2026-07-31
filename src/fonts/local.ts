import localFont from "next/font/local";

/**
 * Local fonts from Figma:
 * - Manrope SemiBold → brand / nav
 * - Switzer Regular / Medium → body
 * - Tabular Regular / Semibold → metadata
 *
 * Files live under public/fonts/{manrope,switzer,tabular}/
 */

export const manrope = localFont({
  src: [
    {
      path: "../../public/fonts/manrope/Manrope-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export const switzer = localFont({
  src: [
    {
      path: "../../public/fonts/switzer/Switzer-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/switzer/Switzer-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
});

export const tabular = localFont({
  src: [
    {
      path: "../../public/fonts/tabular/Tabular-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/tabular/Tabular-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-tabular",
  display: "swap",
});

export const fontVariables = {
  manrope: "--font-manrope",
  switzer: "--font-switzer",
  tabular: "--font-tabular",
  /** @deprecated Prefer fontVariables.switzer */
  sans: "--font-switzer",
  /** @deprecated Prefer fontVariables.tabular */
  mono: "--font-tabular",
} as const;

export const fontClassNames = `${manrope.variable} ${switzer.variable} ${tabular.variable}`;
