export const SEASONS = ["winter", "summer", "rain"];
export const LIGHTS = ["dawn", "day", "dusk", "night"];

// Zero-indexed months. A fixed creative calendar, independent of hemisphere.
export function seasonForDate(date) {
  const month = date.getMonth();
  if (month >= 10 || month <= 1) return "winter";
  if (month <= 5) return "summer";
  return "rain";
}
export function lightForDate(date) {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour >= 6 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "dusk";
  return "night";
}
export function resolveAtmosphere(date, overrides = {}) {
  return {
    light: LIGHTS.includes(overrides.light)
      ? overrides.light
      : lightForDate(date),
    season: SEASONS.includes(overrides.season)
      ? overrides.season
      : seasonForDate(date),
  };
}
export const atmosphereLabels = {
  winter: "Winter",
  summer: "Summer",
  rain: "Rainy season",
  dawn: "First light",
  day: "Daylight",
  dusk: "Golden hour",
  night: "After dark",
};
