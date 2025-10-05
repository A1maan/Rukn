import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Helper function to interpolate between two colors
function interpolateColor(color1: number[], color2: number[], factor: number): string {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
  }
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

// EWI color mapping with smooth gradient (Green → Yellow → Red)
// Based on legend: Low < 0.35 (Green), 0.35-0.60 (Yellow), > 0.60 (Red)
export function getEWIColor(ewi: number): string {
  // Clamp EWI between 0 and 1
  const normalizedEWI = Math.max(0, Math.min(1, ewi));
  
  // Define color ranges based on legend
  const green = [76, 175, 80];    // #4CAF50 - Green for low
  const yellow = [255, 193, 7];   // #FFC107 - Yellow for medium
  const red = [244, 67, 54];      // #F44336 - Red for high
  
  if (normalizedEWI < 0.35) {
    // Low range: interpolate from light green to green
    const lightGreen = [200, 230, 201]; // Very light green for very low values
    const factor = normalizedEWI / 0.35;
    return interpolateColor(lightGreen, green, factor);
  } else if (normalizedEWI < 0.60) {
    // Medium range: interpolate from green to yellow
    const factor = (normalizedEWI - 0.35) / 0.25;
    return interpolateColor(green, yellow, factor);
  } else {
    // High range: interpolate from yellow to red
    const factor = (normalizedEWI - 0.60) / 0.40;
    return interpolateColor(yellow, red, factor);
  }
}

export function getEWILabel(ewi: number): { text: string; color: string } {
  if (ewi < 0.35)
    return { text: "Low", color: "text-green-700 bg-green-50 border-green-200" };
  if (ewi < 0.6)
    return {
      text: "Medium",
      color: "text-amber-700 bg-amber-50 border-amber-200",
    };
  return { text: "High", color: "text-red-700 bg-red-50 border-red-200" };
}

// Format Arabic/English numbers with locale
export function formatNumber(num: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(num);
}

// Format percentage
export function formatPercent(decimal: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(decimal);
}

// Format date/time
export function formatDateTime(
  isoString: string,
  locale: string = "en-US"
): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

// Region code to display name mapping
const REGION_DISPLAY_NAMES: Record<string, string> = {
  riyadh: "Riyadh",
  makkah: "Makkah",
  madinah: "Madinah",
  eastern_province: "Eastern Province",
  asir: "Asir",
  tabuk: "Tabuk",
  qassim: "Qassim",
  hail: "Hail",
  northern_borders: "Northern Borders",
  jazan: "Jazan",
  najran: "Najran",
  al_bahah: "Al-Bahah",
  al_jouf: "Al-Jouf",
};

// Convert region code to display name
export function getRegionDisplayName(code: string): string {
  return REGION_DISPLAY_NAMES[code] || code.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
