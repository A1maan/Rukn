import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// EWI color mapping (white/cream → champagne gold → rose gold)
export function getEWIColor(ewi: number): string {
  if (ewi < 0.35) return "#FDFCF7"; // Soft ivory/white (low)
  if (ewi < 0.6) return "#E6C88A"; // Champagne gold (medium)
  return "#C9A961"; // Deep gold/copper (high)
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
