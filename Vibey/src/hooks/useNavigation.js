import { useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import useVibeyStore from '../store/useVibeyStore';

// ─── Navigation Hook ──────────────────────────────────────────────────────────
// Uses the free OSRM routing engine (no API key needed) to calculate routes.
// Parses turn-by-turn steps and announces them via expo-speech.
//
// OSRM public demo server: router.project-osrm.org
// For production: self-host OSRM or upgrade to Mapbox Directions API.

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export default function useNavigation() {
  const {
    location, destination,
    setRouteCoords, setRouteActive,
    setCurrentInstruction, setDistanceToNext,
    routeCoords, routeActive,
  } = useVibeyStore();

  const stepsRef = useRef([]);
  const currentStepRef = useRef(0);
  const announcedRef = useRef(new Set());

  // Calculate route when destination is set
  useEffect(() => {
    if (!destination || !location) return;
    calculateRoute();
  }, [destination?.latitude, destination?.longitude]);

  // Advance turn-by-turn instructions as user moves
  useEffect(() => {
    if (!routeActive || !location || stepsRef.current.length === 0) return;
    advanceInstructions();
  }, [location?.latitude, location?.longitude]);

  const calculateRoute = async () => {
    const { latitude: oLat, longitude: oLon } = location;
    const { latitude: dLat, longitude: dLon } = destination;

    try {
      const url = `${OSRM_BASE}/${oLon},${oLat};${dLon},${dLat}?overview=full&geometries=geojson&steps=true&annotations=false`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes?.length) return;

      const route = data.routes[0];

      // Convert GeoJSON coordinates to RN Maps format [{ latitude, longitude }]
      const coords = route.geometry.coordinates.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
      setRouteCoords(coords);
      setRouteActive(true);

      // Extract all steps from all legs
      const steps = route.legs.flatMap((leg) =>
        leg.steps.map((step) => ({
          instruction: humaniseInstruction(step.maneuver),
          distance: step.distance,         // metres
          lat: step.maneuver.location[1],
          lon: step.maneuver.location[0],
        }))
      );
      stepsRef.current = steps;
      currentStepRef.current = 0;
      announcedRef.current = new Set();

      if (steps.length > 0) {
        setCurrentInstruction(steps[0].instruction);
        speak(steps[0].instruction);
      }
    } catch (e) {
      console.warn('Route calculation failed:', e.message);
    }
  };

  const advanceInstructions = () => {
    const steps = stepsRef.current;
    if (!steps.length) return;

    for (let i = currentStepRef.current; i < steps.length; i++) {
      const step = steps[i];
      const dist = haversine(location.latitude, location.longitude, step.lat, step.lon);

      // Announce when within 120m of the manoeuvre point
      if (dist < 120 && !announcedRef.current.has(i)) {
        announcedRef.current.add(i);
        currentStepRef.current = i;
        setCurrentInstruction(step.instruction);
        setDistanceToNext(Math.round(dist));
        speak(step.instruction);
        break;
      }
    }
  };

  const speak = (text) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.05,
      rate: 0.92,
    });
  };

  // Convert OSRM maneuver type + modifier into a human-readable string
  const humaniseInstruction = (maneuver) => {
    const { type, modifier } = maneuver;
    const modStr = modifier ? ` ${modifier}` : '';
    const map = {
      turn: `Turn${modStr}`,
      'new name': `Continue${modStr}`,
      depart: 'Head out',
      arrive: 'You have arrived',
      merge: `Merge${modStr}`,
      'on ramp': `Take the ramp${modStr}`,
      'off ramp': `Take the exit${modStr}`,
      fork: `Keep${modStr} at the fork`,
      'end of road': `Turn${modStr} at the end of the road`,
      roundabout: 'Enter the roundabout',
      rotary: 'Enter the rotary',
      'roundabout turn': `At the roundabout, turn${modStr}`,
      notification: `Continue${modStr}`,
    };
    return map[type] ?? `Continue${modStr}`;
  };
}

// Haversine distance in metres between two lat/lon points
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
