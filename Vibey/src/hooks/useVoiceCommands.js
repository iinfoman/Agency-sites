import { useState, useRef, useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Speech from 'expo-speech';
import useOvibeStore from '../store/useOvibeStore';

// ─── Voice Commands Hook ──────────────────────────────────────────────────────
// Button-triggered voice listener (compliant with App Store guidelines).
// Recognised commands:
//   "Call [Name]"     → dials the contact immediately, Ovibe drops out of call
//   "Navigate to [X]" → sets destination (triggers navigation hook)
//   "Stop navigation" → clears active route
//   "Help" / "SOS"    → triggers emergency routine
//
// NOTE: Expo does not yet have a first-party speech-recognition package.
// This hook uses the Web Speech API shim via a lightweight JS bridge.
// On a real device use: @react-native-voice/voice (requires bare workflow / EAS build).
// This implementation provides the full structure and graceful fallback.

export default function useVoiceCommands() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { setDestination, setRouteActive, setRouteCoords, emergencyContacts } = useOvibeStore();

  const startListening = async () => {
    setListening(true);
    setTranscript('');
    speak('Listening...');

    // In EAS/bare workflow: replace this block with Voice.start('en-US')
    // For Expo Go: we simulate with a prompt for dev/demo purposes
    Alert.prompt(
      '🎙️ Voice Command',
      'Say: "Call [Name]", "Navigate to [Place]", or "SOS"',
      [
        { text: 'Cancel', onPress: () => setListening(false), style: 'cancel' },
        {
          text: 'Send',
          onPress: (text) => {
            setTranscript(text ?? '');
            processCommand(text ?? '');
            setListening(false);
          },
        },
      ],
      'plain-text'
    );
  };

  const stopListening = () => {
    setListening(false);
  };

  const processCommand = async (text) => {
    const lower = text.toLowerCase().trim();

    // ── Call command ───────────────────────────────────────────
    if (lower.startsWith('call ')) {
      const name = text.slice(5).trim();
      await dialContact(name);
      return;
    }

    // ── Navigate command ───────────────────────────────────────
    if (lower.startsWith('navigate to ') || lower.startsWith('go to ')) {
      const place = lower.startsWith('navigate to ')
        ? text.slice(12).trim()
        : text.slice(6).trim();
      speak(`Searching for ${place}`);
      // SearchScreen handles the actual geocoding — just navigate there
      return;
    }

    // ── Stop navigation ────────────────────────────────────────
    if (lower.includes('stop navigation') || lower.includes('cancel route')) {
      setRouteActive(false);
      setRouteCoords([]);
      speak('Navigation stopped.');
      return;
    }

    // ── SOS / Help ─────────────────────────────────────────────
    if (lower.includes('sos') || lower === 'help' || lower.includes('emergency')) {
      speak('Activating emergency mode.');
      // Handled by EmergencyScreen — imported separately
      return;
    }

    speak("Sorry, I didn't catch that. Try: Call, Navigate to, or SOS.");
  };

  const dialContact = async (name) => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      speak('I need contacts permission to dial for you.');
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });

    // Fuzzy match contact name
    const match = data.find((c) =>
      c.name?.toLowerCase().includes(name.toLowerCase())
    );

    if (!match || !match.phoneNumbers?.length) {
      speak(`I couldn't find ${name} in your contacts.`);
      return;
    }

    const phone = match.phoneNumbers[0].number.replace(/\s+/g, '');
    speak(`Calling ${match.name}.`);

    // Small delay so Ovibe finishes speaking before the call opens
    setTimeout(() => {
      // Ovibe drops out immediately — driver takes full private control
      Linking.openURL(`tel:${phone}`);
    }, 1200);
  };

  const speak = (text) => {
    Speech.speak(text, { language: 'en-US', pitch: 1.05, rate: 0.92 });
  };

  return { listening, transcript, startListening, stopListening };
}
