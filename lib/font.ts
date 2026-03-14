export const FONTS = {
  "line-seed-jp": {
    label: "LINE Seed JP",
    family: '"LINE Seed JP", system-ui, sans-serif',
  },
  "noto-sans-jp": {
    label: "Noto Sans JP",
    family: '"Noto Sans JP", system-ui, sans-serif',
  },
  "bizudpgothic": {
    label: "BIZ UDPGothic",
    family: '"BIZ UDPGothic", system-ui, sans-serif',
  },
} as const;

export type FontId = keyof typeof FONTS;

const STORAGE_KEY = "mado-font";

export function getStoredFont(): FontId {
  if (typeof window === "undefined") return "line-seed-jp";
  return (localStorage.getItem(STORAGE_KEY) as FontId) || "line-seed-jp";
}

export function setStoredFont(id: FontId) {
  localStorage.setItem(STORAGE_KEY, id);
}
