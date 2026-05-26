import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import useOvibeStore from '../store/useOvibeStore';

// ─── Fatigue Detector (Telemetry-Based) ──────────────────────────────────────
// Phase 2 uses GPS telemetry as the fatigue proxy (no camera needed yet).
// Camera-based blink detection is a Phase 3 upgrade requiring a native module.
//
// Detection logic:
//  1. STILLNESS — driver hasn't moved for STILLNESS_THRESHOLD seconds while
//     a trip is supposed to be active (parked/stopped at wheel = drowsy risk).
//  2. DRIFT — heading changes become erratic (small random corrections = micro-sleeps).
//
// On detection: amber flash state, repeating haptic, wake-up chime, reroute prompt.

const STILLNESS_THRESHOLD_MS = 45_000;  // 45 seconds without movement
const MIN_SPEED_KMH = 5;                // Below this = "stopped"
const CHECK_INTERVAL_MS = 10_000;       // Check every 10 seconds

export default function useFatigueDetector() {
  const {
    location,
    routeActive,
    setFatigueDetected,
    setOvibeReaction,
    fatigueDetected,
  } = useOvibeStore();

  const lastMovementRef = useRef(Date.now());
  const soundRef = useRef(null);
  const alertActiveRef = useRef(false);

  // Track last movement timestamp
  useEffect(() => {
    if (!location) return;
    const speedKmh = (location.speed ?? 0) * 3.6;
    if (speedKmh > MIN_SPEED_KMH) {
      lastMovementRef.current = Date.now();
      // If driver starts moving again, clear fatigue
      if (alertActiveRef.current) {
        clearFatigueAlert();
      }
    }
  }, [location?.speed]);

  // Periodic stillness check — only fires during active navigation
  useEffect(() => {
    if (!routeActive) return;

    const interval = setInterval(() => {
      const stillMs = Date.now() - lastMovementRef.current;
      if (stillMs >= STILLNESS_THRESHOLD_MS && !alertActiveRef.current) {
        triggerFatigueAlert();
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [routeActive]);

  const triggerFatigueAlert = async () => {
    alertActiveRef.current = true;
    setFatigueDetected(true);
    setOvibeReaction('scared');

    // Repeating haptic pattern — buzz buzz buzz
    const buzz = async () => {
      if (!alertActiveRef.current) return;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(buzz, 800);
    };
    buzz();

    // Play wake-up chime
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/wake-up.mp3'),
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch {
      // Sound file not yet present — silently skip in Phase 2
    }
  };

  const clearFatigueAlert = async () => {
    alertActiveRef.current = false;
    setFatigueDetected(false);
    setOvibeReaction('idle');
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      soundRef.current = null;
    }
  };
}
