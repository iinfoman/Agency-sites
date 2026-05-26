import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-native-maps';
import useOvibeStore from '../store/useOvibeStore';

// ─── Safety Overlay ────────────────────────────────────────────────────────────
// Color-codes route segments based on simulated safety data.
// Green = safe, amber = caution, red = high risk (poor lighting, high crime area).
//
// Production upgrade path:
//   Replace the local simulation with a real safety API such as:
//   - SafeGraph, CrimeMapping, or a municipal open data endpoint
//   - Store results in Zustand for offline caching
//
// Current implementation: segments the route polyline and assigns a safety
// score based on the time of day (night hours increase risk level) and
// random seeding per coordinate to simulate real-world variance.

const SEGMENT_SIZE = 8; // Number of coords per segment

export default function SafetyOverlay() {
  const { routeCoords, routeActive } = useOvibeStore();
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    if (!routeActive || routeCoords.length < 2) {
      setSegments([]);
      return;
    }
    setSegments(buildSegments(routeCoords));
  }, [routeActive, routeCoords.length]);

  return (
    <>
      {segments.map((seg, i) => (
        <Polyline
          key={i}
          coordinates={seg.coords}
          strokeColor={seg.color}
          strokeWidth={6}
          lineDashPattern={seg.risk === 'high' ? [6, 4] : undefined}
          zIndex={1}
        />
      ))}
    </>
  );
}

function buildSegments(coords) {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 20;
  const segments = [];

  for (let i = 0; i < coords.length - 1; i += SEGMENT_SIZE) {
    const slice = coords.slice(i, i + SEGMENT_SIZE + 1);
    const risk = calcRisk(slice[0], isNight);

    segments.push({
      coords: slice,
      risk,
      color: risk === 'safe' ? '#39FF14' : risk === 'caution' ? '#FFB800' : '#FF4757',
    });
  }
  return segments;
}

// Deterministic risk score from coordinate hash + time of day
function calcRisk(coord, isNight) {
  const seed = Math.abs(
    Math.round((coord.latitude * 1000 + coord.longitude * 1000) % 10)
  );
  const baseRisk = seed < 6 ? 'safe' : seed < 9 ? 'caution' : 'high';

  // Night elevates risk by one level
  if (!isNight) return baseRisk;
  if (baseRisk === 'safe') return 'caution';
  return 'high';
}
