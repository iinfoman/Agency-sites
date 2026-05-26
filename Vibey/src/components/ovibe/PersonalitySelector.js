import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import useOvibeStore from '../../store/useOvibeStore';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

const MODES = [
  { key: 'normal', label: '😊', title: 'Normal', color: colors.cyan },
  { key: 'funny', label: '😂', title: 'Funny', color: colors.green },
  { key: 'serious', label: '😎', title: 'Serious', color: colors.purple },
];

// Allows switching Ovibe's personality mode.
// Funny & Serious are premium-gated.
export default function PersonalitySelector() {
  const { personalityMode, setPersonalityMode, isPremium } = useOvibeStore();

  return (
    <View style={styles.row}>
      {MODES.map((m) => {
        const locked = (m.key !== 'normal') && !isPremium;
        const active = personalityMode === m.key;
        return (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.btn,
              active && { borderColor: m.color, backgroundColor: m.color + '22' },
            ]}
            onPress={() => {
              if (locked) return; // will open paywall in Phase 5
              setPersonalityMode(m.key);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.icon}>{locked ? '🔒' : m.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
    justifyContent: 'center',
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 16 },
});
