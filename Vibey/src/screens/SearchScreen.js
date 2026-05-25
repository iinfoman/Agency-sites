import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useVibeyStore from '../store/useVibeyStore';
import { colors, gradients } from '../theme/colors';
import { spacing, radius, typography } from '../theme/typography';

// ─── SearchScreen ─────────────────────────────────────────────────────────────
// Destination search using the free OpenStreetMap Nominatim API.
// No API key needed — Nominatim is completely free and open.
// For production: swap with Google Places for better autocomplete quality.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const { setDestination, location } = useVibeyStore();

  const search = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 3) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: text,
          format: 'json',
          limit: '8',
          addressdetails: '1',
          // Bias results toward user's current location
          ...(location && {
            viewbox: `${location.longitude - 1},${location.latitude + 1},${location.longitude + 1},${location.latitude - 1}`,
            bounded: '0',
          }),
        });
        const res = await fetch(`${NOMINATIM_URL}?${params}`, {
          headers: { 'Accept-Language': 'en', 'User-Agent': 'VibeyApp/1.0' },
        });
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const selectDestination = (item) => {
    setDestination({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      name: item.display_name.split(',').slice(0, 2).join(',').trim(),
    });
    navigation.navigate('Map');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <LinearGradient colors={gradients.bgMain} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Where to?</Text>
      </View>

      {/* Search input */}
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search a destination..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={search}
          autoFocus
          returnKeyType="search"
          selectionColor={colors.cyan}
        />
        {loading && <ActivityIndicator color={colors.cyan} size="small" style={{ marginRight: spacing.sm }} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick suggestions */}
      {results.length === 0 && query.length < 3 && (
        <View style={styles.suggestions}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          {[
            { icon: '🏠', label: 'Home' },
            { icon: '💼', label: 'Work' },
            { icon: '⛽', label: 'Nearest Fuel' },
            { icon: '☕', label: 'Nearest Coffee' },
          ].map((s) => (
            <TouchableOpacity key={s.label} style={styles.suggestionRow}>
              <Text style={styles.suggestionIcon}>{s.icon}</Text>
              <Text style={styles.suggestionLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results list */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id?.toString()}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => {
          const parts = item.display_name.split(',');
          const name = parts.slice(0, 2).join(',').trim();
          const sub = parts.slice(2, 4).join(',').trim();
          return (
            <TouchableOpacity style={styles.resultRow} onPress={() => selectDestination(item)} activeOpacity={0.75}>
              <View style={styles.resultIcon}>
                <Text style={{ fontSize: 20 }}>{getCategoryIcon(item.type)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName} numberOfLines={1}>{name}</Text>
                <Text style={styles.resultSub} numberOfLines={1}>{sub}</Text>
              </View>
              <Text style={styles.resultArrow}>→</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          query.length >= 3 && !loading ? (
            <Text style={styles.noResults}>No results found. Try a different search.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function getCategoryIcon(type) {
  const map = {
    restaurant: '🍽️', cafe: '☕', hotel: '🏨', fuel: '⛽',
    hospital: '🏥', pharmacy: '💊', supermarket: '🛒', park: '🌳',
    museum: '🏛️', bar: '🍺', bank: '🏦', airport: '✈️',
  };
  return map[type] ?? '📍';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  backArrow: { color: colors.cyan, fontSize: 20 },
  title: { ...typography.heading2, color: colors.textPrimary },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.md, marginBottom: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md,
  },
  inputIcon: { fontSize: 18, marginRight: spacing.sm },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: spacing.md },
  clearBtn: { color: colors.textMuted, fontSize: 16, padding: spacing.xs },

  suggestions: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  suggestionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  suggestionIcon: { fontSize: 20, marginRight: spacing.md },
  suggestionLabel: { ...typography.body, color: colors.textSecondary },

  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  resultIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center',
    justifyContent: 'center', marginRight: spacing.md,
  },
  resultName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  resultSub: { ...typography.bodySmall, color: colors.textMuted },
  resultArrow: { color: colors.cyan, fontSize: 18, marginLeft: spacing.sm },

  noResults: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
