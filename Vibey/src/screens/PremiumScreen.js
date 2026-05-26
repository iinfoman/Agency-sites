import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useOvibeStore from '../store/useOvibeStore';
import { colors, gradients } from '../theme/colors';
import { spacing, radius, typography } from '../theme/typography';

// ─── PremiumScreen — Ovibe Plus Paywall ───────────────────────────────────────
// Showcases premium features with a sleek upsell UI.
// Pricing converts to local currency via a static map (Phase 6: use a live FX API).
// Payment processing: wire RevenueCat SDK here for production IAP.

const PRICE_MAP = {
  ZA: { currency: 'R', monthly: '89', yearly: '699' },
  US: { currency: '$', monthly: '4.99', yearly: '39.99' },
  GB: { currency: '£', monthly: '3.99', yearly: '31.99' },
  AU: { currency: 'A$', monthly: '7.99', yearly: '59.99' },
  EU: { currency: '€', monthly: '4.49', yearly: '35.99' },
  DEFAULT: { currency: '$', monthly: '4.99', yearly: '39.99' },
};

// Change this to match the user's country in production via expo-localization
const USER_REGION = 'ZA';

const FEATURES = [
  { icon: '😂', title: 'Funny Mode', desc: 'Ovibe becomes your hilarious co-pilot with jokes and dramatic reactions.' },
  { icon: '😎', title: 'Serious Mode', desc: 'Laser-focused, professional navigation assistant. Zero distractions.' },
  { icon: '📡', title: 'Offline Engine', desc: 'Full navigation, route recalculation and Ovibe reactions — zero signal needed.' },
  { icon: '📳', title: 'Advanced Telematics', desc: 'Pothole detection, fatigue alerts, and speed sensing with haptic feedback.' },
  { icon: '🎨', title: 'Accessory Unlocks', desc: 'Exclusive monthly skins and accessories dropped just for Plus members.' },
  { icon: '🚫', title: 'Ad-Free', desc: 'No partner location ads. Clean, distraction-free driving.' },
];

export default function PremiumScreen({ navigation }) {
  const { setIsPremium, isPremium } = useOvibeStore();
  const [selected, setSelected] = useState('yearly');
  const pricing = PRICE_MAP[USER_REGION] ?? PRICE_MAP.DEFAULT;

  const handleSubscribe = () => {
    // Production: replace with RevenueCat purchasePackage() call
    Alert.alert(
      '🎉 Ovibe Plus',
      `Subscribe for ${pricing.currency}${selected === 'yearly' ? pricing.yearly + '/yr' : pricing.monthly + '/mo'}?\n\n(RevenueCat payment flow goes here in production)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            setIsPremium(true);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={gradients.bgMain} style={StyleSheet.absoluteFill} />
        <View style={styles.alreadyPremium}>
          <Text style={styles.premiumIcon}>💎</Text>
          <Text style={styles.premiumTitle}>You're on Ovibe Plus!</Text>
          <Text style={styles.premiumSub}>All features are unlocked. Enjoy the ride.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <LinearGradient colors={gradients.bgMain} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <LinearGradient colors={gradients.premium} style={styles.hero}>
          <Text style={styles.heroEmoji}>💎</Text>
          <Text style={styles.heroTitle}>Ovibe Plus</Text>
          <Text style={styles.heroSub}>Unlock the full experience. Drive smarter, safer, and with more personality.</Text>
        </LinearGradient>

        {/* Pricing toggle */}
        <View style={styles.pricingRow}>
          <TouchableOpacity
            style={[styles.pricingBtn, selected === 'monthly' && styles.pricingBtnActive]}
            onPress={() => setSelected('monthly')}
          >
            <Text style={[styles.pricingLabel, selected === 'monthly' && styles.pricingLabelActive]}>
              Monthly
            </Text>
            <Text style={[styles.pricingAmount, selected === 'monthly' && styles.pricingAmountActive]}>
              {pricing.currency}{pricing.monthly}
            </Text>
            <Text style={styles.pricingPer}>/mo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricingBtn, selected === 'yearly' && styles.pricingBtnActive]}
            onPress={() => setSelected('yearly')}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 30%</Text>
            </View>
            <Text style={[styles.pricingLabel, selected === 'yearly' && styles.pricingLabelActive]}>
              Yearly
            </Text>
            <Text style={[styles.pricingAmount, selected === 'yearly' && styles.pricingAmountActive]}>
              {pricing.currency}{pricing.yearly}
            </Text>
            <Text style={styles.pricingPer}>/yr</Text>
          </TouchableOpacity>
        </View>

        {/* Feature list */}
        <Text style={styles.sectionTitle}>Everything included:</Text>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featureRow}>
            <View style={styles.featureIconBox}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        ))}

        {/* Comparison table */}
        <Text style={styles.sectionTitle}>Free vs Plus</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Feature</Text>
            <Text style={styles.tableCell}>Free</Text>
            <Text style={[styles.tableCell, { color: colors.purple }]}>Plus</Text>
          </View>
          {[
            ['Navigation', '✓', '✓'],
            ['Normal Mode', '✓', '✓'],
            ['Funny Mode', '—', '✓'],
            ['Serious Mode', '—', '✓'],
            ['Offline Engine', '—', '✓'],
            ['Telematics', '—', '✓'],
            ['Ads', 'Yes', 'None'],
          ].map(([feat, free, plus]) => (
            <View key={feat} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, color: colors.textSecondary }]}>{feat}</Text>
              <Text style={[styles.tableCell, { color: free === '✓' ? colors.green : colors.textMuted }]}>{free}</Text>
              <Text style={[styles.tableCell, { color: plus === '✓' ? colors.purple : colors.textMuted }]}>{plus}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.legal}>Cancel anytime. Billed annually. Prices shown in {USER_REGION === 'ZA' ? 'South African Rand' : 'local currency'}.</Text>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaBtn} onPress={handleSubscribe} activeOpacity={0.9}>
          <LinearGradient colors={gradients.cyanPurple} style={styles.ctaGradient}>
            <Text style={styles.ctaText}>
              Start Ovibe Plus — {pricing.currency}{selected === 'yearly' ? pricing.yearly + '/yr' : pricing.monthly + '/mo'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.md, alignItems: 'flex-end' },
  closeBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.bgCard, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  closeText: { color: colors.textSecondary, fontSize: 16 },

  hero: {
    marginHorizontal: spacing.md, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg,
  },
  heroEmoji: { fontSize: 56, marginBottom: spacing.sm },
  heroTitle: { ...typography.heading1, color: '#fff', marginBottom: spacing.sm },
  heroSub: { ...typography.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  pricingRow: {
    flexDirection: 'row', marginHorizontal: spacing.md,
    gap: spacing.md, marginBottom: spacing.lg,
  },
  pricingBtn: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center', borderWidth: 1,
    borderColor: colors.border, position: 'relative',
  },
  pricingBtnActive: { borderColor: colors.purple, backgroundColor: colors.purple + '18' },
  pricingLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.xs },
  pricingLabelActive: { color: colors.purple },
  pricingAmount: { ...typography.heading2, color: colors.textPrimary },
  pricingAmountActive: { color: colors.purple },
  pricingPer: { ...typography.caption, color: colors.textMuted },
  saveBadge: {
    position: 'absolute', top: -10, right: 10,
    backgroundColor: colors.green, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  saveBadgeText: { fontSize: 9, fontWeight: '800', color: colors.bg },

  sectionTitle: {
    ...typography.label, color: colors.textMuted,
    marginHorizontal: spacing.md, marginBottom: spacing.sm, marginTop: spacing.md,
  },
  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  featureIconBox: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center',
    justifyContent: 'center', marginRight: spacing.md,
  },
  featureIcon: { fontSize: 22 },
  featureTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
  featureDesc: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
  checkmark: { color: colors.green, fontSize: 18, marginLeft: spacing.sm },

  table: {
    marginHorizontal: spacing.md, backgroundColor: colors.bgCard,
    borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  tableHeader: {
    flexDirection: 'row', backgroundColor: colors.surface,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
  },
  tableRow: {
    flexDirection: 'row', paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  tableCell: { ...typography.bodySmall, color: colors.textPrimary, flex: 1, textAlign: 'center' },

  legal: {
    ...typography.caption, color: colors.textMuted,
    textAlign: 'center', marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },

  ctaContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.md, backgroundColor: colors.bg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  ctaBtn: { borderRadius: radius.xl, overflow: 'hidden' },
  ctaGradient: { padding: spacing.md + 2, alignItems: 'center' },
  ctaText: { ...typography.heading3, color: '#fff' },

  alreadyPremium: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  premiumIcon: { fontSize: 64, marginBottom: spacing.md },
  premiumTitle: { ...typography.heading2, color: colors.purple, marginBottom: spacing.sm },
  premiumSub: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  backBtn: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.purple,
  },
  backBtnText: { ...typography.body, color: colors.purple },
});
