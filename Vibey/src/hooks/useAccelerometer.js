import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import useOvibeStore from '../store/useOvibeStore';

// ─── Pothole / Bump Detection ─────────────────────────────────────────────────
// Monitors the device accelerometer at 60Hz.
// A sudden spike on any axis above THRESHOLD signals a pothole or speed bump.
// Cooldown prevents the same bump triggering Ovibe multiple times in a row.

const THRESHOLD = 2.2;       // G-force spike needed to count as a bump
const COOLDOWN_MS = 2500;    // Minimum time between reactions

export default function useAccelerometer() {
  const { setOvibeReaction, setLastAccelSpike, personalityMode } = useOvibeStore();
  const lastSpikeRef = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(16); // ~60Hz

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Total magnitude of acceleration change (ignoring gravity baseline)
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > THRESHOLD && now - lastSpikeRef.current > COOLDOWN_MS) {
        lastSpikeRef.current = now;
        setLastAccelSpike(now);

        // Strong haptic feedback — driver feels the app react
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Trigger Ovibe bounce reaction
        setOvibeReaction('bounce');

        // Reset back to idle after animation plays
        setTimeout(() => setOvibeReaction('idle'), 1800);
      }
    });

    return () => subscription.remove();
  }, [personalityMode]);
}
