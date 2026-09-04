import localFont from "next/font/local";

/**
 * Local fonts from Figma (Homepage — live):
 * - TAY Dreamboat Regular / Light (brand, nav, uppercase UI)
 * - Helvetica Now Display Bold / Medium / Regular (body)
 * - Inconsolata variable (wdth + wght) for Expanded SemiBold metadata
 */

export const tayDreamboat = localFont({
  src: [
    {
      path: "../../public/fonts/tay-dreamboat/TAYDreamboatLight.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/tay-dreamboat/TAYDreamboat-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-tay-dreamboat",
  display: "swap",
});

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
  dreamboat: "--font-tay-dreamboat",
  display: "--font-helvetica-now-display",
  sans: "--font-helvetica-now-display",
  mono: "--font-inconsolata",
  helvetica: "--font-helvetica-now-display",
  inconsolata: "--font-inconsolata",
} as const;

export const fontClassNames = `${tayDreamboat.variable} ${helveticaNowDisplay.variable} ${inconsolata.variable}`;
