import { useEffect } from 'react';
import useOvibeStore from '../store/useOvibeStore';

// ─── POI Discovery Hook ───────────────────────────────────────────────────────
// Fetches Points of Interest along the active route using Overpass API (free, OSM).
// Categorises results by budget tier from the store.
// No API key needed.

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Category tags to search for
const CATEGORY_TAGS = {
  restaurant: ['amenity=restaurant', 'amenity=fast_food', 'amenity=food_court'],
  hotel: ['tourism=hotel', 'tourism=motel', 'tourism=guest_house'],
  activity: ['tourism=attraction', 'tourism=museum', 'leisure=park', 'tourism=viewpoint'],
  coffee: ['amenity=cafe'],
  fuel: ['amenity=fuel'],
};

export function usePOI() {
  const { routeCoords, routeActive, destination, setPOIs } = useOvibeStore();

  useEffect(() => {
    if (!routeActive || routeCoords.length < 2) return;
    fetchPOIs();
  }, [routeActive, destination?.latitude]);

  const fetchPOIs = async () => {
    // Build a bounding box around the route
    const lats = routeCoords.map((c) => c.latitude);
    const lons = routeCoords.map((c) => c.longitude);
    const minLat = Math.min(...lats) - 0.01;
    const maxLat = Math.max(...lats) + 0.01;
    const minLon = Math.min(...lons) - 0.01;
    const maxLon = Math.max(...lons) + 0.01;

    const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;

    // Build Overpass QL query for all categories
    const queries = Object.values(CATEGORY_TAGS)
      .flat()
      .map((tag) => {
        const [key, val] = tag.split('=');
        return `node["${key}"="${val}"](${bbox});`;
      })
      .join('\n');

    const body = `[out:json][timeout:15];\n(\n${queries}\n);\nout body 40;`;

    try {
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'text/plain' },
      });
      const data = await res.json();
      const pois = data.elements.map(parsePOI).filter(Boolean);
      setPOIs(pois);
    } catch (e) {
      console.warn('POI fetch failed:', e.message);
    }
  };
}

function parsePOI(el) {
  const t = el.tags;
  if (!t) return null;

  const category = detectCategory(t);
  const priceLevel = detectPriceLevel(t);

  return {
    id: el.id,
    name: t.name ?? 'Unnamed Place',
    category,
    priceLevel,     // 1 = budget, 2 = midrange, 3 = luxury
    latitude: el.lat,
    longitude: el.lon,
    cuisine: t.cuisine ?? null,
    phone: t['contact:phone'] ?? t.phone ?? null,
    website: t.website ?? t['contact:website'] ?? null,
    openingHours: t.opening_hours ?? null,
    stars: t.stars ? parseInt(t.stars) : null,
  };
}

function detectCategory(t) {
  if (t.amenity === 'restaurant' || t.amenity === 'fast_food') return 'restaurant';
  if (t.amenity === 'cafe') return 'coffee';
  if (t.amenity === 'fuel') return 'fuel';
  if (t.tourism === 'hotel' || t.tourism === 'motel') return 'hotel';
  if (t.tourism === 'attraction' || t.tourism === 'museum') return 'activity';
  if (t.leisure === 'park') return 'activity';
  if (t.tourism === 'viewpoint') return 'activity';
  return 'other';
}

function detectPriceLevel(t) {
  // OSM uses stars for hotels, cuisine hints for restaurants
  if (t.stars) {
    const s = parseInt(t.stars);
    if (s >= 4) return 3;
    if (s === 3) return 2;
    return 1;
  }
  if (t.amenity === 'fast_food') return 1;
  if (t.cuisine?.includes('fine') || t.cuisine?.includes('gourmet')) return 3;
  return 2; // default midrange
}
