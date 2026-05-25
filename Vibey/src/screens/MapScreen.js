import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT, Polyline, Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import useVibeyStore from '../store/useVibeyStore';
import { colors, gradients } from '../theme/colors';
import { spacing, radius, typography } from '../theme/typography';
import VibeyCompanion from '../components/vibey/VibeyCompanion';
import PersonalitySelector from '../components/vibey/PersonalitySelector';
import FatigueAlert, { FatigueCard } from '../components/FatigueAlert';
import POICarousel from '../components/POICarousel';
import VoiceButton from '../components/VoiceButton';
import SafetyOverlay from '../components/SafetyOverlay';
import useAccelerometer from '../hooks/useAccelerometer';
import useSpeedMonitor from '../hooks/useSpeedMonitor';
import useFatigueDetector from '../hooks/useFatigueDetector';
import useNavigation from '../hooks/useNavigation';
import { usePOI } from '../hooks/usePOI';
import useContextualAds from '../hooks/useContextualAds';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const mapRef = useRef(null);
  const {
    location, setLocation,
    routeActive, currentInstruction, routeCoords, destination,
    personalityMode, vibeyReaction,
    isSpeeding, isFloatingMode, setFloatingMode,
  } = useVibeyStore();

  // Activate all sensor + navigation hooks
  useAccelerometer();
  useSpeedMonitor();
  useFatigueDetector();
  useNavigation();
  usePOI();
  useContextualAds();

  // Request location permissions and start tracking
  useEffect(() => {
    let subscriber;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (pos) => {
          const { latitude, longitude, speed, heading } = pos.coords;
          setLocation({ latitude, longitude, speed: speed ?? 0, heading });
        }
      );
    })();
    return () => subscriber?.remove();
  }, []);

  // Re-center map when location updates
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateCamera({
        center: { latitude: location.latitude, longitude: location.longitude },
        zoom: 15,
      });
    }
  }, [location?.latitude, location?.longitude]);

  const initialRegion = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: -26.2041, longitude: 28.0473, latitudeDelta: 0.05, longitudeDelta: 0.05 }; // Johannesburg default

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* ── Map ─────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={darkNeonMapStyle}
      >
        {/* Safety-colored route overlay */}
        <SafetyOverlay />

        {/* Base route polyline (thin cyan under safety overlay) */}
        {routeActive && routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.cyan + '55'}
            strokeWidth={2}
          />
        )}
        {/* Destination marker */}
        {destination && (
          <Marker coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}>
            <View style={styles.destMarker}>
              <Text style={{ fontSize: 22 }}>📍</Text>
              <Text style={styles.destLabel} numberOfLines={1}>{destination.name}</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* ── Top HUD: Speed & Mode indicator ─────────────────────── */}
      <SafeAreaView style={styles.topHUD} pointerEvents="box-none">
        <View style={styles.topRow}>
          <SpeedBadge />
          <ModeChip mode={personalityMode} />
        </View>

        {/* Instruction banner during active navigation */}
        {routeActive && currentInstruction ? (
          <View style={styles.instructionBanner}>
            <Text style={styles.instructionText}>{currentInstruction}</Text>
          </View>
        ) : null}
      </SafeAreaView>

      {/* ── Vibey Companion (floating 3D emoji panel) ────────────── */}
      <View style={styles.vibeyPanel} pointerEvents="box-none">
        <VibeyCompanion />
        <PersonalitySelector />
      </View>

      {/* ── FABs ─────────────────────────────────────────────────── */}
      <View style={styles.fabContainer}>
        <FAB icon="🔍" label="Search" onPress={() => navigation.navigate('Search')} color={colors.cyan} />
        <FAB icon="✨" label="Style" onPress={() => navigation.navigate('Customise')} color={colors.purple} />
        <FAB icon="💎" label="Plus" onPress={() => navigation.navigate('Premium')} color={colors.purple} />
        {/* Voice button replaces a plain FAB */}
        <VoiceButton />
        <FAB icon="🆘" label="SOS" onPress={() => navigation.navigate('Emergency')} color={colors.danger} />
        <FAB icon={isFloatingMode ? '📌' : '🪟'} label="Float" onPress={() => setFloatingMode(!isFloatingMode)} color={colors.green} />
      </View>

      {/* ── POI Carousel (visible during active navigation) ──────── */}
      <POICarousel />

      {/* ── Fatigue Alert (amber flash + dismissible card) ───────── */}
      <FatigueAlert />
      <FatigueCard />

      {/* ── Bottom gradient fade ──────────────────────────────────── */}
      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.95)']}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
}

// ── Speed Badge ──────────────────────────────────────────────────────────────
function SpeedBadge() {
  const { currentSpeed, speedLimit, isSpeeding } = useVibeyStore();
  const displaySpeed = Math.round((currentSpeed ?? 0) * 3.6); // m/s → km/h

  return (
    <View style={[styles.speedBadge, isSpeeding && styles.speedBadgeSpeeding]}>
      <Text style={styles.speedNumber}>{displaySpeed}</Text>
      <Text style={styles.speedUnit}>km/h</Text>
      {speedLimit && (
        <Text style={styles.speedLimit}>/ {speedLimit}</Text>
      )}
    </View>
  );
}

// ── Mode Chip ────────────────────────────────────────────────────────────────
function ModeChip({ mode }) {
  const modeConfig = {
    normal: { label: 'Normal', color: colors.cyan },
    funny: { label: 'Funny 😄', color: colors.green },
    serious: { label: 'Serious', color: colors.purple },
  };
  const cfg = modeConfig[mode] ?? modeConfig.normal;

  return (
    <View style={[styles.modeChip, { borderColor: cfg.color }]}>
      <Text style={[styles.modeLabel, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ── Floating Action Button ───────────────────────────────────────────────────
function FAB({ icon, label, onPress, color }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.fabInner, { shadowColor: color, borderColor: color + '55' }]}>
        <Text style={styles.fabIcon}>{icon}</Text>
      </View>
      <Text style={[styles.fabLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Dark Neon Map Style ──────────────────────────────────────────────────────
const darkNeonMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#00F5FF' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0f' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#22223b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#BF5FFF' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#00F5FF' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d1a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
];

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  map: { ...StyleSheet.absoluteFillObject },

  topHUD: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  speedBadge: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    borderWidth: 1,
    borderColor: colors.border,
  },
  speedBadgeSpeeding: { borderColor: colors.danger },
  speedNumber: { ...typography.heading2, color: colors.cyan },
  speedUnit: { ...typography.caption, color: colors.textSecondary, marginLeft: 4 },
  speedLimit: { ...typography.caption, color: colors.textMuted, marginLeft: 6 },

  modeChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgCard,
  },
  modeLabel: { ...typography.label },

  instructionBanner: {
    marginTop: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.cyan,
  },
  instructionText: { ...typography.body, color: colors.textPrimary },

  vibeyPanel: {
    position: 'absolute',
    bottom: 120,
    right: spacing.md,
    alignItems: 'center',
    zIndex: 20,
  },

  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    zIndex: 20,
    paddingHorizontal: spacing.md,
  },
  fab: { alignItems: 'center' },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: { fontSize: 24 },
  fabLabel: { ...typography.caption, marginTop: 4 },

  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 5,
  },
  destMarker: { alignItems: 'center' },
  destLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cyan,
    maxWidth: 120,
  },
});
