import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useVibeyStore from '../store/useVibeyStore';
import { colors, gradients } from '../theme/colors';
import { spacing, radius, typography } from '../theme/typography';

// ─── CustomiseScreen — Vibey Appearance + Accessory Marketplace ───────────────
// Free: change skin colour and glow colour.
// Premium: purchase accessories via microtransaction (RevenueCat IAP in production).

const SKIN_COLOURS = [
  { id: 'gold', hex: '#FFD700', label: 'Gold' },
  { id: 'coral', hex: '#FF6B6B', label: 'Coral' },
  { id: 'sky', hex: '#4ECDC4', label: 'Sky' },
  { id: 'lavender', hex: '#C3A6FF', label: 'Lavender' },
  { id: 'lime', hex: '#A8FF3E', label: 'Lime' },
  { id: 'peach', hex: '#FFB347', label: 'Peach' },
  { id: 'ice', hex: '#B0E0E6', label: 'Ice' },
  { id: 'rose', hex: '#FF69B4', label: 'Rose' },
];

const GLOW_COLOURS = [
  { id: 'cyan', hex: '#00F5FF', label: 'Cyan' },
  { id: 'purple', hex: '#BF5FFF', label: 'Purple' },
  { id: 'green', hex: '#39FF14', label: 'Green' },
  { id: 'amber', hex: '#FFB800', label: 'Amber' },
  { id: 'red', hex: '#FF4757', label: 'Red' },
  { id: 'white', hex: '#FFFFFF', label: 'White' },
];

const ACCESSORIES = [
  { id: 'sunglasses', icon: '🕶️', label: 'Trendy Sunglasses', price: 'R15', free: false },
  { id: 'hat', icon: '🎩', label: 'Retro Top Hat', price: 'R15', free: false },
  { id: 'goggles', icon: '🥽', label: 'Racing Goggles', price: 'R20', free: false },
  { id: 'crown', icon: '👑', label: 'Golden Crown', price: 'R25', free: false, seasonal: true },
  { id: 'halo', icon: '😇', label: 'Angel Halo', price: 'Free', free: true },
];

const VOICE_PACKS = [
  { id: 'default', label: 'Default Vibey', desc: 'The classic voice', price: 'Free', free: true },
  { id: 'deep', label: 'Deep Navigator', desc: 'Low, smooth, confident', price: 'R29', free: false },
  { id: 'chipper', label: 'Chipper Vibey', desc: 'High energy, fun', price: 'R29', free: false },
  { id: 'zen', label: 'Zen Mode', desc: 'Calm, meditative', price: 'R29', free: false },
];

export default function CustomiseScreen({ navigation }) {
  const {
    vibeyColor, setVibeyColor,
    vibeyGlow, setVibeyGlow,
    accessories, toggleAccessory,
    isPremium,
  } = useVibeyStore();

  const [activeTab, setActiveTab] = useState('appearance');

  const handleAccessoryTap = (acc) => {
    if (acc.free || isPremium) {
      toggleAccessory(acc.id);
      return;
    }
    // In production: trigger RevenueCat IAP purchasePackage here
    Alert.alert(
      `Get ${acc.label}`,
      `Purchase for ${acc.price}?\n\n(RevenueCat microtransaction flow goes here)`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: `Buy ${acc.price}`, onPress: () => toggleAccessory(acc.id) },
      ]
    );
  };

  const tabs = [
    { key: 'appearance', label: '🎨 Look' },
    { key: 'accessories', label: '🛍️ Store' },
    { key: 'voice', label: '🎙️ Voice' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <LinearGradient colors={gradients.bgMain} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Customise Vibey</Text>
          <Text style={styles.subtitle}>Make it yours</Text>
        </View>
        {!isPremium && (
          <TouchableOpacity style={styles.plusBadge} onPress={() => navigation.navigate('Premium')}>
            <Text style={styles.plusText}>💎 Plus</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md }} showsVerticalScrollIndicator={false}>

        {/* ── Appearance Tab ──────────────────────────────────────── */}
        {activeTab === 'appearance' && (
          <>
            <Text style={styles.sectionLabel}>Skin Colour</Text>
            <View style={styles.colourGrid}>
              {SKIN_COLOURS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.colourSwatch, { backgroundColor: c.hex },
                    vibeyColor === c.hex && styles.swatchSelected]}
                  onPress={() => setVibeyColor(c.hex)}
                >
                  {vibeyColor === c.hex && <Text style={styles.swatchCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Halo Glow</Text>
            <View style={styles.colourGrid}>
              {GLOW_COLOURS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.colourSwatch, { backgroundColor: c.hex },
                    vibeyGlow === c.hex && styles.swatchSelected]}
                  onPress={() => setVibeyGlow(c.hex)}
                >
                  {vibeyGlow === c.hex && <Text style={styles.swatchCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Current Look</Text>
              <View style={styles.previewRow}>
                <View style={[styles.previewDot, { backgroundColor: vibeyColor }]} />
                <Text style={styles.previewText}>Skin</Text>
                <View style={[styles.previewDot, { backgroundColor: vibeyGlow, marginLeft: spacing.md }]} />
                <Text style={styles.previewText}>Glow</Text>
              </View>
            </View>
          </>
        )}

        {/* ── Store Tab ───────────────────────────────────────────── */}
        {activeTab === 'accessories' && (
          <>
            {!isPremium && (
              <TouchableOpacity style={styles.premiumBanner} onPress={() => navigation.navigate('Premium')}>
                <LinearGradient colors={gradients.premium} style={styles.premiumBannerGradient}>
                  <Text style={styles.premiumBannerText}>💎 Vibey Plus members get all accessories free</Text>
                  <Text style={styles.premiumBannerCta}>Upgrade →</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionLabel}>Accessories</Text>
            {ACCESSORIES.map((acc) => {
              const owned = acc.free || isPremium;
              const active = accessories[acc.id];
              return (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.accRow, active && styles.accRowActive]}
                  onPress={() => handleAccessoryTap(acc)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.accIcon}>{acc.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <Text style={styles.accName}>{acc.label}</Text>
                      {acc.seasonal && <Text style={styles.seasonalTag}>SEASONAL</Text>}
                    </View>
                    <Text style={styles.accPrice}>{owned ? (active ? 'ON' : 'OFF') : acc.price}</Text>
                  </View>
                  <View style={[styles.accToggle, active && styles.accToggleOn]}>
                    <Text style={styles.accToggleText}>{owned ? (active ? '✓' : '+') : '🛒'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── Voice Tab ───────────────────────────────────────────── */}
        {activeTab === 'voice' && (
          <>
            <Text style={styles.sectionLabel}>Voice Packs</Text>
            {VOICE_PACKS.map((vp) => (
              <View key={vp.id} style={styles.voiceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.voiceName}>{vp.label}</Text>
                  <Text style={styles.voiceDesc}>{vp.desc}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.voiceBtn, vp.free && styles.voiceBtnFree]}
                  onPress={() => {
                    if (!vp.free && !isPremium) {
                      Alert.alert(
                        `Get ${vp.label}`,
                        `Purchase for ${vp.price}?\n\n(RevenueCat IAP goes here)`,
                        [{ text: 'Cancel', style: 'cancel' }, { text: `Buy ${vp.price}` }]
                      );
                    }
                  }}
                >
                  <Text style={styles.voiceBtnText}>{vp.free ? 'Active' : vp.price}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.bgCard, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  backArrow: { color: colors.cyan, fontSize: 20 },
  title: { ...typography.heading2, color: colors.textPrimary },
  subtitle: { ...typography.bodySmall, color: colors.textMuted },
  plusBadge: {
    marginLeft: 'auto', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.purple,
    backgroundColor: colors.purple + '22',
  },
  plusText: { ...typography.label, color: colors.purple },

  tabs: {
    flexDirection: 'row', marginHorizontal: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.xs, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.surface },
  tabText: { ...typography.label, color: colors.textMuted },
  tabTextActive: { color: colors.textPrimary },

  sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.sm },

  colourGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  colourSwatch: {
    width: 48, height: 48, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  swatchSelected: { borderColor: colors.textPrimary },
  swatchCheck: { color: '#000', fontSize: 18, fontWeight: '900' },

  previewCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm,
  },
  previewLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  previewDot: { width: 28, height: 28, borderRadius: 14 },
  previewText: { ...typography.bodySmall, color: colors.textSecondary },

  premiumBanner: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  premiumBannerGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: spacing.md,
  },
  premiumBannerText: { ...typography.bodySmall, color: '#fff', flex: 1 },
  premiumBannerCta: { ...typography.label, color: '#fff' },

  accRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md,
  },
  accRowActive: { borderColor: colors.cyan, backgroundColor: colors.cyan + '11' },
  accIcon: { fontSize: 28 },
  accName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  accPrice: { ...typography.caption, color: colors.textMuted },
  seasonalTag: {
    fontSize: 9, fontWeight: '800', color: colors.amber,
    backgroundColor: colors.amber + '22', paddingHorizontal: 5,
    paddingVertical: 2, borderRadius: radius.sm,
  },
  accToggle: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.surface, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  accToggleOn: { backgroundColor: colors.cyan + '22', borderColor: colors.cyan },
  accToggleText: { fontSize: 16 },

  voiceRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  voiceName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  voiceDesc: { ...typography.bodySmall, color: colors.textMuted },
  voiceBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.purple,
    backgroundColor: colors.purple + '22',
  },
  voiceBtnFree: { borderColor: colors.green, backgroundColor: colors.green + '22' },
  voiceBtnText: { ...typography.caption, color: colors.textPrimary },
});
