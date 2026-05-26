import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import useOvibeStore from '../store/useOvibeStore';
import { colors, gradients } from '../theme/colors';
import { spacing, radius, typography } from '../theme/typography';

// Affiliate tracking tag — swap with your real partner IDs in Phase 5
const AFFILIATE_TAG = 'ovibeapp-20';

const BUDGET_TIERS = [
  { key: 'all', label: 'All' },
  { key: 'budget', label: '💰 Budget' },
  { key: 'midrange', label: '💳 Mid' },
  { key: 'luxury', label: '💎 Luxury' },
  { key: 'deals', label: '🏷️ Deals' },
];

const PRICE_MAP = { budget: 1, midrange: 2, luxury: 3 };

const BOOKING_LINKS = {
  hotel: (name) => `https://www.booking.com/search.html?ss=${encodeURIComponent(name)}&aid=${AFFILIATE_TAG}`,
  restaurant: (name) => `https://www.tripadvisor.com/Search?q=${encodeURIComponent(name)}&affiliateid=${AFFILIATE_TAG}`,
  activity: (name) => `https://www.tripadvisor.com/Search?q=${encodeURIComponent(name)}&affiliateid=${AFFILIATE_TAG}`,
};

export default function POICarousel() {
  const { pois, routeActive, budgetTier, setBudgetTier } = useOvibeStore();
  const [activeCategory, setActiveCategory] = useState('all');

  if (!routeActive || pois.length === 0) return null;

  // Filter by category and budget
  const filtered = pois.filter((p) => {
    const categoryMatch = activeCategory === 'all' || p.category === activeCategory;
    const budgetMatch =
      budgetTier === 'all' || budgetTier === 'deals' ||
      p.priceLevel === (PRICE_MAP[budgetTier] ?? 2);
    return categoryMatch && budgetMatch;
  }).slice(0, 20);

  const openBooking = async (poi) => {
    const builder = BOOKING_LINKS[poi.category] ?? BOOKING_LINKS.activity;
    const url = builder(poi.name);
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Budget filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: spacing.md }}>
        {BUDGET_TIERS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.chip, budgetTier === t.key && styles.chipActive]}
            onPress={() => setBudgetTier(t.key)}
          >
            <Text style={[styles.chipText, budgetTier === t.key && styles.chipTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        {[
          { key: 'all', icon: '🗺️' }, { key: 'restaurant', icon: '🍽️' },
          { key: 'hotel', icon: '🏨' }, { key: 'activity', icon: '🎯' },
          { key: 'coffee', icon: '☕' }, { key: 'fuel', icon: '⛽' },
        ].map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[styles.catTab, activeCategory === c.key && styles.catTabActive]}
            onPress={() => setActiveCategory(c.key)}
          >
            <Text style={styles.catIcon}>{c.icon}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* POI cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No places found nearby for this filter.</Text>
        ) : (
          filtered.map((poi) => (
            <TouchableOpacity key={poi.id} style={styles.card} onPress={() => openBooking(poi)} activeOpacity={0.85}>
              <LinearGradient colors={gradients.card} style={styles.cardGradient}>
                <Text style={styles.cardIcon}>{getCategoryIcon(poi.category)}</Text>
                <Text style={styles.cardName} numberOfLines={2}>{poi.name}</Text>
                <Text style={styles.cardSub}>{poi.cuisine ?? poi.category}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.priceTag}>{getPriceTag(poi.priceLevel)}</Text>
                  <Text style={styles.bookBtn}>Book →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getCategoryIcon(cat) {
  const map = { restaurant: '🍽️', hotel: '🏨', activity: '🎯', coffee: '☕', fuel: '⛽', other: '📍' };
  return map[cat] ?? '📍';
}

function getPriceTag(level) {
  return ['', '💰', '💳 💳', '💎 💎 💎'][level] ?? '💳';
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  filterRow: { marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  chipActive: { backgroundColor: colors.cyan + '22', borderColor: colors.cyan },
  chipText: { ...typography.caption, color: colors.textSecondary },
  chipTextActive: { color: colors.cyan },

  catTab: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.bgCard, alignItems: 'center',
    justifyContent: 'center', marginRight: spacing.xs,
    borderWidth: 1, borderColor: colors.border,
  },
  catTabActive: { borderColor: colors.cyan, backgroundColor: colors.cyan + '22' },
  catIcon: { fontSize: 18 },

  card: {
    width: 150,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardGradient: { padding: spacing.md },
  cardIcon: { fontSize: 28, marginBottom: spacing.xs },
  cardName: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '700', marginBottom: 2 },
  cardSub: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'capitalize' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceTag: { fontSize: 11 },
  bookBtn: { ...typography.caption, color: colors.cyan, fontWeight: '700' },

  empty: { ...typography.bodySmall, color: colors.textMuted, paddingVertical: spacing.md },
});
