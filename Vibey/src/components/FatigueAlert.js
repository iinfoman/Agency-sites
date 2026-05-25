import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import useVibeyStore from '../store/useVibeyStore';
import { colors } from '../theme/colors';
import { spacing, radius, typography } from '../theme/typography';

// ─── Fatigue Alert Overlay ────────────────────────────────────────────────────
// Flashes an amber screen overlay when driver fatigue is detected.
// Prompts the driver to take a break and find a rest stop.

export default function FatigueAlert() {
  const { fatigueDetected, setFatigueDetected, setVibeyReaction, personalityMode } = useVibeyStore();
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fatigueDetected) {
      // Pulsing amber flash
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 0.45, duration: 500, useNativeDriver: true }),
          Animated.timing(flashAnim, { toValue: 0.1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      flashAnim.stopAnimation();
      flashAnim.setValue(0);
    }
  }, [fatigueDetected]);

  if (!fatigueDetected) return null;

  const messages = {
    normal: "You've been still for a while. Take a break?",
    funny: "Zzz... wakey wakey! Don't fall asleep on me! 😴",
    serious: 'Fatigue risk detected. Stop at next safe location.',
  };

  const dismiss = () => {
    setFatigueDetected(false);
    setVibeyReaction('idle');
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: flashAnim }]} pointerEvents="none">
      <View style={styles.amber} />
    </Animated.View>
  );
}

// Separate dismissible card — sits above the flash overlay
export function FatigueCard() {
  const { fatigueDetected, setFatigueDetected, setVibeyReaction, personalityMode } = useVibeyStore();

  if (!fatigueDetected) return null;

  const messages = {
    normal: "You've been still for a while. Time for a break!",
    funny: "Zzz... wakey wakey! Don't fall asleep on me! 😴",
    serious: 'Fatigue risk detected. Stop at next safe location.',
  };

  const dismiss = () => {
    setFatigueDetected(false);
    setVibeyReaction('idle');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Stay Alert</Text>
      <Text style={styles.message}>{messages[personalityMode] ?? messages.normal}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={dismiss}>
          <Text style={styles.btnText}>I'm Fine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={dismiss}>
          <Text style={[styles.btnText, { color: colors.amber }]}>Find Rest Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    pointerEvents: 'none',
  },
  amber: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.amber,
  },
  card: {
    position: 'absolute',
    bottom: 200,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.amber,
    alignItems: 'center',
    zIndex: 60,
    shadowColor: colors.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  emoji: { fontSize: 36, marginBottom: spacing.sm },
  title: { ...typography.heading3, color: colors.amber, marginBottom: spacing.xs },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  btnPrimary: { backgroundColor: colors.amber, borderColor: colors.amber },
  btnSecondary: { backgroundColor: 'transparent', borderColor: colors.amber },
  btnText: { ...typography.label, color: colors.bg },
});
