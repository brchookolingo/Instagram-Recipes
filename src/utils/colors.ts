/**
 * Shared color tokens. Use these anywhere a hex string is passed into a prop
 * (Ionicons color, style objects, ActivityIndicator, shadow colors) — classNames
 * should keep using Tailwind utilities directly.
 */

export const colors = {
  primary: "#ec4899",
  primaryLight: "#fce7f3",
  textPrimary: "#111827",
  textSecondary: "#374151",
  textMuted: "#9ca3af",
  textFaint: "#d1d5db",
  surface: "#ffffff",
  surfaceAlt: "#f3f4f6",
  border: "#e5e7eb",
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#ef4444",
  dangerSoft: "#f87171",
} as const;

export type ColorToken = keyof typeof colors;
