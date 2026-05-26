import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  FlatList, TextInput, Alert, Linking, StatusBar,
} from 'react-native';
import * as SMS from 'expo-sms';
import { LinearGradient } from 'expo-linear-gradient';
import useOvibeStore from '../store/useOvibeStore';
import { colors, gradients } from '../theme/colors';
import { spacing, radius, typography } from '../theme/typography';

// ─── EmergencyScreen ──────────────────────────────────────────────────────────
// Two functions:
//  1. Manage emergency contacts (stored in Zustand / AsyncStorage later)
//  2. Panic trigger — dials local emergency + sends live-location SMS to contacts

// Country emergency number lookup (add more as needed)
const EMERGENCY_NUMBERS = {
  ZA: '10111',  // South Africa Police / 10177 Ambulance
  US: '911',
  GB: '999',
  AU: '000',
  DEFAULT: '112', // International GSM standard
};

function getEmergencyNumber() {
  // In production: use expo-localization to detect country code
  return EMERGENCY_NUMBERS.ZA; // Default to SA for Henri's location
}

export default function EmergencyScreen({ navigation }) {
  const { emergencyContacts, setEmergencyContacts, location } = useOvibeStore();
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [panicActive, setPanicActive] = useState(false);

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setEmergencyContacts([...emergencyContacts, { name: newName.trim(), phone: newPhone.trim() }]);
    setNewName('');
    setNewPhone('');
  };

  const removeContact = (index) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updated);
  };

  const triggerPanic = async () => {
    setPanicActive(true);

    const emergencyNum = getEmergencyNumber();
    const lat = location?.latitude ?? 0;
    const lon = location?.longitude ?? 0;
    const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
    const message = `🆘 EMERGENCY ALERT from Ovibe App\nI need help. My live location: ${mapsLink}\nCoordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;

    // 1. Silently dial emergency services
    Linking.openURL(`tel:${emergencyNum}`);

    // 2. Send SMS to all emergency contacts
    const available = await SMS.isAvailableAsync();
    if (available && emergencyContacts.length > 0) {
      const phones = emergencyContacts.map((c) => c.phone);
      await SMS.sendSMSAsync(phones, message);
    }

    setTimeout(() => setPanicActive(false), 5000);
  };

  const confirmPanic = () => {
    Alert.alert(
      '🆘 Activate Emergency?',
      `This will dial ${getEmergencyNumber()} and send your live location to ${emergencyContacts.length} contact(s).`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'YES — SEND SOS', onPress: triggerPanic, style: 'destructive' },
      ]
    );
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
        <Text style={styles.title}>Guardian Angel</Text>
        <Text style={styles.subtitle}>Emergency & Safety</Text>
      </View>

      {/* SOS Panic Button */}
      <TouchableOpacity
        style={[styles.panicBtn, panicActive && styles.panicBtnActive]}
        onPress={confirmPanic}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={panicActive ? [colors.danger, '#FF0000'] : ['#FF4757', '#C0392B']}
          style={styles.panicGradient}
        >
          <Text style={styles.panicIcon}>🆘</Text>
          <Text style={styles.panicLabel}>{panicActive ? 'SENDING SOS...' : 'PANIC / SOS'}</Text>
          <Text style={styles.panicSub}>
            Dials {getEmergencyNumber()} + sends location to contacts
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Emergency contacts section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <Text style={styles.sectionSub}>Your location will be sent to these people in an emergency.</Text>

        {/* Add contact form */}
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: spacing.sm }]}
            placeholder="Name"
            placeholderTextColor={colors.textMuted}
            value={newName}
            onChangeText={setNewName}
            selectionColor={colors.danger}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginRight: spacing.sm }]}
            placeholder="Phone"
            placeholderTextColor={colors.textMuted}
            value={newPhone}
            onChangeText={setNewPhone}
            keyboardType="phone-pad"
            selectionColor={colors.danger}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addContact}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Contact list */}
        {emergencyContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No contacts added yet.</Text>
            <Text style={styles.emptySubText}>Add at least one trusted person above.</Text>
          </View>
        ) : (
          <FlatList
            data={emergencyContacts}
            keyExtractor={(_, i) => i.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={styles.contactRow}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>{item.name[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                </View>
                <TouchableOpacity onPress={() => removeContact(index)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* Safety tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Stay Safe</Text>
        {[
          'Long press the 🆘 FAB on the map for instant panic.',
          'Keep your phone charged on long drives.',
          'Share your trip route with a trusted contact.',
        ].map((tip, i) => (
          <Text key={i} style={styles.tip}>• {tip}</Text>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.bgCard, alignItems: 'center',
    justifyContent: 'center', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  backArrow: { color: colors.cyan, fontSize: 20 },
  title: { ...typography.heading2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textMuted },

  panicBtn: {
    marginHorizontal: spacing.md, marginVertical: spacing.md,
    borderRadius: radius.xl, overflow: 'hidden',
    shadowColor: colors.danger, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, shadowRadius: 20, elevation: 12,
  },
  panicBtnActive: { opacity: 0.8 },
  panicGradient: { padding: spacing.xl, alignItems: 'center' },
  panicIcon: { fontSize: 48, marginBottom: spacing.sm },
  panicLabel: { ...typography.heading2, color: '#fff', letterSpacing: 2 },
  panicSub: { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs, textAlign: 'center' },

  section: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  sectionTitle: { ...typography.heading3, color: colors.textPrimary, marginBottom: spacing.xs },
  sectionSub: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },

  addForm: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    ...typography.body, color: colors.textPrimary,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: radius.full,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, lineHeight: 28 },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary },
  emptySubText: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.xs },

  contactRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  contactAvatar: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.danger + '33', alignItems: 'center',
    justifyContent: 'center', marginRight: spacing.md,
    borderWidth: 1, borderColor: colors.danger,
  },
  contactInitial: { ...typography.heading3, color: colors.danger },
  contactName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  contactPhone: { ...typography.bodySmall, color: colors.textMuted },
  removeBtn: { padding: spacing.sm },
  removeBtnText: { color: colors.textMuted, fontSize: 16 },

  tipsCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  tipsTitle: { ...typography.label, color: colors.cyan, marginBottom: spacing.sm },
  tip: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
});
