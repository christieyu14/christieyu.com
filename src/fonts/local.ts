import localFont from "next/font/local";

/**
 * Local fonts from Figma (Homepage — live):
 * - Helvetica Now Display Bold / Medium / Regular
 * - Inconsolata variable (wdth + wght) for Expanded SemiBold metadata + ASCII
 */

export const helveticaNowDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/helvetica-now-display/HelveticaNowDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/helvetica-now-display/HelveticaNowDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/helvetica-now-display/HelveticaNowDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-now-display",
  display: "swap",
});

export const inconsolata = localFont({
  src: [
    {
      path: "../../public/fonts/inconsolata/Inconsolata-Variable.ttf",
      weight: "200 900",
      style: "normal",
    },
  ],
  variable: "--font-inconsolata",
  display: "swap",
});

export const fontVariables = {
  display: "--font-helvetica-now-display",
  sans: "--font-helvetica-now-display",
  mono: "--font-inconsolata",
  helvetica: "--font-helvetica-now-display",
  inconsolata: "--font-inconsolata",
} as const;

export const fontClassNames = `${helveticaNowDisplay.variable} ${inconsolata.variable}`;
