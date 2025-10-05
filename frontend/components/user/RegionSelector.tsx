"use client";

import { MapPin } from "lucide-react";

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

const SAUDI_REGIONS = [
  { value: "riyadh", label: "Riyadh", ar: "الرياض" },
  { value: "makkah", label: "Makkah", ar: "مكة المكرمة" },
  { value: "madinah", label: "Madinah", ar: "المدينة المنورة" },
  { value: "eastern_province", label: "Eastern Province", ar: "المنطقة الشرقية" },
  { value: "asir", label: "Asir", ar: "عسير" },
  { value: "tabuk", label: "Tabuk", ar: "تبوك" },
  { value: "qassim", label: "Qassim", ar: "القصيم" },
  { value: "hail", label: "Hail", ar: "حائل" },
  { value: "northern_borders", label: "Northern Borders", ar: "الحدود الشمالية" },
  { value: "jazan", label: "Jazan", ar: "جازان" },
  { value: "najran", label: "Najran", ar: "نجران" },
  { value: "al_bahah", label: "Al-Bahah", ar: "الباحة" },
  { value: "al_jouf", label: "Al-Jouf", ar: "الجوف" },
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
          <option key={region.value} value={region.value}>
            {region.ar} / {region.label}
          </option>
        ))}
      </select>
      
      <p className="text-xs text-gray-500 mt-2">
        * مطلوب - Required field
      </p>
    </div>
  );
}
