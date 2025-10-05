"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { getEWIColor } from "@/lib/utils";

interface MapViewProps {
  onRegionClick?: (regionName: string) => void;
  selectedRegion?: string | null;
}

export default function MapView({ onRegionClick, selectedRegion }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const geoJSONLayerRef = useRef<L.GeoJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize map
    if (!mapRef.current) {
      const map = L.map("map", {
        center: [23.8859, 45.0792], // KSA center
        zoom: 6,
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false,
      });

      mapRef.current = map;

      // Add custom CSS for smooth transitions and hover effects
      const style = document.createElement('style');
      style.textContent = `
        .province-polygon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .province-polygon.hover-effect {
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3)) 
                  drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2)) !important;
          transform: scale(1.02) !important;
          transform-origin: center !important;
        }
        .map-tooltip {
          background: rgba(255, 255, 255, 0.98) !important;
          border: 2px solid #C9A961 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          padding: 8px 12px !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }
      `;
      document.head.appendChild(style);

      // Load GeoJSON
      fetch("/api/regions")
        .then((res) => res.json())
        .then((geoJSON) => {
          const layer = L.geoJSON(geoJSON, {
            style: (feature) => {
              const ewi = feature?.properties?.ewi || 0;
              const code = feature?.properties?.code || "";
              const isSelected = selectedRegion === code;

              return {
                fillColor: getEWIColor(ewi),
                fillOpacity: isSelected ? 0.95 : 0.85,
                color: "#C9A961", // Gold border
                weight: isSelected ? 3.5 : 2.5,
                className: "province-polygon",
              };
            },
            onEachFeature: (feature, layer) => {
              const name = feature.properties?.name_en || feature.properties?.shapeName || "Unknown";
              const nameAr = feature.properties?.name_ar || feature.properties?.shapeName || "غير معروف";
              const code = feature.properties?.code || ""; // The region code for API calls
              const ewi = feature.properties?.ewi ?? 0;

              // Tooltip
              layer.bindTooltip(
                `
                <div class="font-sans">
                  <div class="font-semibold text-sm">${name}</div>
                  <div class="text-xs text-gray-600 mb-1">${nameAr}</div>
                  <div class="text-xs">EWI: <span class="font-bold">${(ewi * 100).toFixed(0)}%</span></div>
                </div>
              `,
                { className: "map-tooltip" }
              );

              // Click handler - pass the region code (not display name)
              layer.on("click", () => {
                if (onRegionClick && code) {
                  onRegionClick(code);
                }
              });

              // Hover effects with smooth scale and shadow
              layer.on("mouseover", function (this: L.Path) {
                const element = (this as any)._path;
                if (element) {
                  element.classList.add('hover-effect');
                }
                this.setStyle({
                  weight: 4.5,
                  fillOpacity: 1,
                  color: "#D4AF37", // Brighter gold on hover
                });
                this.bringToFront();
              });

              layer.on("mouseout", function (this: L.Path) {
                const element = (this as any)._path;
                if (element) {
                  element.classList.remove('hover-effect');
                }
                const isSelected = selectedRegion === code;
                this.setStyle({
                  weight: isSelected ? 3.5 : 2.5,
                  fillOpacity: isSelected ? 0.95 : 0.85,
                  color: "#C9A961", // Back to normal gold
                });
              });
            },
          });

          layer.addTo(map);
          geoJSONLayerRef.current = layer;
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load GeoJSON:", err);
          setIsLoading(false);
        });
    }

    // Update styles when selectedRegion changes
    if (geoJSONLayerRef.current) {
      geoJSONLayerRef.current.eachLayer((layer: any) => {
        const feature = layer.feature;
        const code = feature?.properties?.code || "";
        const ewi = feature?.properties?.ewi || 0;
        const isSelected = selectedRegion === code;

        layer.setStyle({
          fillColor: getEWIColor(ewi),
          fillOpacity: isSelected ? 0.95 : 0.85,
          weight: isSelected ? 3.5 : 2.5,
        });
      });
    }
  }, [onRegionClick, selectedRegion]);

  return (
    <div className="relative h-full w-full">
      {/* Background pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.03 }}>
        <defs>
          <pattern id="crosshatch" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="20" y2="20" stroke="#8B7355" strokeWidth="0.5" />
            <line x1="20" y1="0" x2="0" y2="20" stroke="#8B7355" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crosshatch)" />
      </svg>

      {/* Map container */}
      <div
        id="map"
        className="h-full w-full z-10 relative"
        style={{
          background: "linear-gradient(135deg, #F5F3EF 0%, #E8E6E1 100%)",
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
          <div className="text-amber-700 font-medium">Loading map...</div>
        </div>
      )}
    </div>
  );
}
