import { useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import useOvibeStore from '../store/useOvibeStore';

// ─── Contextual Ad Engine ─────────────────────────────────────────────────────
// Monitors the user's GPS position against a list of verified partner locations.
// When within TRIGGER_RADIUS metres, Ovibe delivers a non-intrusive audio ad.
// Each partner fires once per session (no repeated nagging).
//
// Production setup:
//   - Fetch partner list from your backend API on app start
//   - Partners register via a brand dashboard with coordinates + custom Ovibe line
//   - Monetise via CPM (cost per thousand triggers) or CPA (cost per action)

const TRIGGER_RADIUS_M = 1000; // 1 km trigger zone

// Demo partner database — replace with live API fetch in production
const PARTNER_BRANDS = [
  {
    id: 'starbucks-001',
    name: 'Starbucks',
    latitude: -26.1077,
    longitude: 28.0567,
    line: "Hey, I'm thirsty! Verified Ovibe Partner 1 km ahead — use code OVIBE15 for 15% off your coffee!",
    emoji: '☕',
  },
  {
    id: 'steers-001',
    name: 'Steers',
    latitude: -26.2041,
    longitude: 28.0473,
    line: "My oh my, something smells amazing! Steers is just up ahead — Ovibe members get a free upgrade today!",
    emoji: '🍔',
  },
  {
    id: 'engen-001',
    name: 'Engen',
    latitude: -26.1500,
    longitude: 28.0200,
    line: "Heads up! Verified Ovibe fuel stop nearby. Engen ahead — lock in today's best fuel price!",
    emoji: '⛽',
  },
];

export default function useContextualAds() {
  const { location, isPremium, personalityMode } = useOvibeStore();
  const triggeredRef = useRef(new Set()); // fired IDs this session

  useEffect(() => {
    if (!location) return;
    if (isPremium) return; // Plus users are ad-free

    for (const partner of PARTNER_BRANDS) {
      if (triggeredRef.current.has(partner.id)) continue;

      const dist = haversine(
        location.latitude, location.longitude,
        partner.latitude, partner.longitude
      );

      if (dist <= TRIGGER_RADIUS_M) {
        triggeredRef.current.add(partner.id);
        triggerAdLine(partner, personalityMode);
        break; // Only one ad at a time
      }
    }
  }, [location?.latitude, location?.longitude]);
}

function triggerAdLine(partner, mode) {
  // Gentle single haptic to draw attention
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Ovibe speaks the partner line
  const line = mode === 'funny'
    ? partner.line
    : `${partner.emoji} Ovibe Partner nearby — ${partner.name}`;

  Speech.speak(line, {
    language: 'en-US',
    pitch: 1.1,
    rate: 0.9,
  });
}

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
