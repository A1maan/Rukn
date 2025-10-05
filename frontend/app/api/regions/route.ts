// frontend/app/api/regions/route.ts
// Uses region_ewi_live view for fast EWI calculation
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getEWIColor } from '@/lib/utils';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Fetch pre-calculated EWI from view
    const { data: regionEWI, error: ewiError } = await supabase
      .from('region_ewi_live')
      .select('*');

    if (ewiError) throw ewiError;

    // Create EWI map from view results
    const ewiMap = new Map<string, number>();
    regionEWI?.forEach(region => {
      ewiMap.set(region.region, region.ewi || 0.15);
    });

    // Load GeoJSON from file
    const geojsonPath = path.join(process.cwd(), 'public/data/ksa-provinces.geojson');
    const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

    // Merge EWI into GeoJSON features
    geojsonData.features = geojsonData.features.map((feature: any) => {
      // Generate region code from name_en (convert to lowercase with underscores)
      const nameEn = feature.properties.name_en || feature.properties.NAME_1 || feature.properties.name || '';
      const regionCode = nameEn.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
      
      const ewi = ewiMap.get(regionCode) || 0.15;
      
      return {
        ...feature,
        properties: {
          ...feature.properties,
          code: regionCode, // Add the code property for API calls
          ewi: ewi,
          color: getEWIColor(ewi)
        }
      };
    });

    return NextResponse.json(geojsonData);
  } catch (error: any) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}