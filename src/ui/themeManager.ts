import type { ThemeName } from "../types";

const ORDER: ThemeName[] = ["dark", "light", "dark-sun"];

export function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme;
}

export function nextTheme(current: ThemeName): ThemeName {
  const index = ORDER.indexOf(current);
  return ORDER[(index + 1) % ORDER.length];
}

export function labelForTheme(theme: ThemeName): string {
  if (theme === "light") {
    return "Light";
  }
  if (theme === "dark-sun") {
    return "Dark Sun";
  }
  return "Dark";
}
