/** Shared Dither params from React Bits; colors + wave jitter vary per card. */
export const DITHER_BASE = {
  ditherMode: "bayer4" as const,
  colorNum: 4,
  pixelSize: 2,
  waveSpeed: 0.02,
  mouseEffect: "erase" as const,
  mouseRadius: 0.15,
  mouseStrength: 0.8,
  trail: 0.3,
  enableMouseInteraction: true,
};

export interface PortfolioDitherTheme {
  waveColor: string;
  backgroundColor: string;
}

export const PORTFOLIO_DITHER_THEMES: readonly PortfolioDitherTheme[] = [
  { waveColor: "#a6b46c", backgroundColor: "#08889e" },
  { waveColor: "#b46c8a", backgroundColor: "#2a4489" },
  { waveColor: "#6cb4a0", backgroundColor: "#89440a" },
  { waveColor: "#c4a86c", backgroundColor: "#0a5f6e" },
  { waveColor: "#8ab46c", backgroundColor: "#3c5089" },
  { waveColor: "#a66cb4", backgroundColor: "#066a5a" },
] as const;

/** Deterministic jitter so cards do not animate in lockstep. */
export function ditherWaveJitter(index: number): {
  waveFrequency: number;
  waveAmplitude: number;
} {
  const a = Math.sin((index + 1) * 12.9898) * 43758.5453;
  const b = Math.sin((index + 1) * 78.233) * 24634.1453;
  const fa = a - Math.floor(a);
  const fb = b - Math.floor(b);
  return {
    waveFrequency: 2.5 + (fa - 0.5) * 0.55,
    waveAmplitude: 0.5 + (fb - 0.5) * 0.35,
  };
}
