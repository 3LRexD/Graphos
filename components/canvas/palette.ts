/**
 * Design tokens — fuente única de verdad para todos los colores.
 * Importa `P` donde necesites un color.
 */
export const P = {
  bg:           "#0a0a0a",
  surface:      "#111111",
  surfaceHigh:  "#1a1a1a",
  border:       "#2a2a2a",
  borderBright: "#3a3a3a",

  purple:       "#A855F7",
  purpleDim:    "rgba(168,85,247,0.18)",
  purpleBright: "#D8B4FE",

  cyan:         "#00e5ff",
  cyanDim:      "rgba(0,229,255,0.15)",

  red:          "#ff0055",
  redDim:       "rgba(255,0,85,0.18)",

  green:        "#00ff88",
  greenDim:     "rgba(0,255,136,0.15)",

  yellow:       "#ffd700",
  yellowDim:    "rgba(255,215,0,0.15)",

  text:         "#E0E0E0",
  muted:        "#666",
  mutedBright:  "#999",
  white:        "#ffffff",
} as const;

export const COLORS = {
  BACKGROUND_BLACK: '#000000',
  PURPLE_NEON: '#A855F7',
  CYAN_TEXT: '#00e5ff',
  GRAY_OUTLINE: '#333333',
};