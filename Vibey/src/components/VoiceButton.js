import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Text, View } from 'react-native';
import useVoiceCommands from '../hooks/useVoiceCommands';
import { colors } from '../theme/colors';
import { radius } from '../theme/typography';

// ─── Voice Button ─────────────────────────────────────────────────────────────
// Floating mic button that activates the voice command listener.
// Pulses with a neon cyan ring while listening.

export default function VoiceButton() {
  const { listening, startListening, stopListening } = useVoiceCommands();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (listening) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.5, duration: 700, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, { toValue: 0.8, duration: 700, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0.2, duration: 700, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.4);
    }
  }, [listening]);

  return (
    <View style={styles.wrapper}>
      {/* Pulsing ring */}
      <Animated.View
        style={[
          styles.ring,
          { transform: [{ scale: pulseAnim }], opacity: opacityAnim },
        ]}
      />
      <TouchableOpacity
        style={[styles.btn, listening && styles.btnActive]}
        onPress={listening ? stopListening : startListening}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{listening ? '🔴' : '🎙️'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.cyan,
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cyan,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  btnActive: {
    backgroundColor: colors.cyan + '22',
    borderColor: colors.cyan,
  },
  icon: { fontSize: 24 },
});
