import localFont from "next/font/local";

/**
 * Local fonts from Figma (`personal` → New draft):
 * - Switzer Regular / Medium / Bold (links use Medium → Bold on hover/active)
 * - TAY Bang! for display accents (e.g. “welcome...”)
 * - Inconsolata variable (monospace ASCII art only)
 */

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
    {
      path: "../../public/fonts/switzer/Switzer-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
});

export const tayBang = localFont({
  src: [
    {
      path: "../../public/fonts/taybang/TAYBang.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-taybang",
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
  sans: "--font-switzer",
  display: "--font-taybang",
  mono: "--font-inconsolata",
} as const;

export const fontClassNames = `${switzer.variable} ${tayBang.variable} ${inconsolata.variable}`;
