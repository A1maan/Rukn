"use client";

import { MapPin } from "lucide-react";

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

const SAUDI_REGIONS = [
  { en: "Riyadh", ar: "الرياض" },
  { en: "Makkah", ar: "مكة المكرمة" },
  { en: "Madinah", ar: "المدينة المنورة" },
  { en: "Eastern Province", ar: "المنطقة الشرقية" },
  { en: "Asir", ar: "عسير" },
  { en: "Tabuk", ar: "تبوك" },
  { en: "Qassim", ar: "القصيم" },
  { en: "Hail", ar: "حائل" },
  { en: "Northern Borders", ar: "الحدود الشمالية" },
  { en: "Jazan", ar: "جازان" },
  { en: "Najran", ar: "نجران" },
  { en: "Al-Baha", ar: "الباحة" },
  { en: "Al-Jawf", ar: "الجوف" },
];

export default function RegionSelector({ selectedRegion, onRegionChange }: RegionSelectorProps) {
  return (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        <MapPin className="w-4 h-4" />
        <span>اختر منطقتك / Select Your Region</span>
        <span className="text-red-500">*</span>
      </label>
      
      <select
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none bg-white text-gray-800"
        required
      >
        <option value="">-- اختر المنطقة / Choose Region --</option>
        {SAUDI_REGIONS.map((region) => (
          <option key={region.en} value={region.en}>
            {region.ar} / {region.en}
          </option>
        ))}
      </select>
      
      <p className="text-xs text-gray-500 mt-2">
        * مطلوب - Required field
      </p>
    </div>
  );
}
