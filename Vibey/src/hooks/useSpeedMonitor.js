import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import useOvibeStore from '../store/useOvibeStore';

// ─── Speed Monitor ────────────────────────────────────────────────────────────
// Reads GPS speed from the location state (already tracked in MapScreen).
// Compares against the known speed limit and flags isSpeeding.
// Also triggers Ovibe's goggles reaction and a gentle haptic nudge.
//
// Speed limit data: in Phase 3 this will be fetched from TomTom/HERE API.
// For now it defaults to 60 km/h in built-up areas as a safe fallback.

const DEFAULT_SPEED_LIMIT = 60; // km/h fallback
const SPEEDING_BUFFER = 5;      // Allow 5 km/h over before flagging

export default function useSpeedMonitor() {
  const {
    location,
    speedLimit,
    setCurrentSpeed,
    setIsSpeeding,
    setOvibeReaction,
    isSpeeding,
  } = useOvibeStore();

  useEffect(() => {
    if (!location) return;

    const speedMs = location.speed ?? 0;           // metres per second from GPS
    const speedKmh = Math.round(speedMs * 3.6);    // convert to km/h
    setCurrentSpeed(speedMs);

    const limit = speedLimit ?? DEFAULT_SPEED_LIMIT;
    const overLimit = speedKmh > limit + SPEEDING_BUFFER;

    if (overLimit && !isSpeeding) {
      // Just started speeding
      setIsSpeeding(true);
      setOvibeReaction('scared');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setTimeout(() => setOvibeReaction('idle'), 3000);
    } else if (!overLimit && isSpeeding) {
      // Back under limit
      setIsSpeeding(false);
      setOvibeReaction('excited');
      setTimeout(() => setOvibeReaction('idle'), 1500);
    }
  }, [location?.speed]);
}
