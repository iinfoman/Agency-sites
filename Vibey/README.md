# Ovibe — AI Travel Companion App

A next-generation AI Travel Companion for iOS and Android built with React Native + Expo.

## Features
- 🌙 Dark neon UI — cyan, purple, electric green
- 🤖 3D animated Ovibe emoji (Three.js + expo-gl, no API needed)
- 🗺️ Custom dark-neon styled map view
- 🎭 Personality modes: Normal, Funny, Serious
- 📡 Accelerometer pothole detection + haptic reactions
- 🚗 GPS speed monitoring vs speed limit
- 😴 Fatigue detection with amber alert
- 🗺️ Turn-by-turn navigation (free OSRM engine)
- 📍 POI discovery along route (free Overpass/OSM)
- 💰 Budget filter carousel (Budget / Mid / Luxury / Deals)
- 🎙️ Voice commands — "Call Mum", "Navigate to work", "SOS"
- 🆘 Emergency panic trigger — dials 10111 + live GPS SMS
- 🛡️ Safety color overlay on route (green/amber/red)
- 💎 Ovibe Plus paywall (R89/mo or R699/yr)
- 🛍️ Accessory store + voice pack marketplace
- 📢 Contextual partner ads via GPS proximity

## Tech Stack
- React Native + Expo SDK 56
- Three.js + expo-gl (3D emoji, no API key)
- Zustand (state management)
- React Navigation v7 (routing)
- react-native-maps (map view)
- OSRM (free routing, no API key)
- Nominatim / Overpass (free search + POIs, no API key)
- expo-speech (voice guidance)
- expo-sensors (accelerometer)
- expo-location (GPS)
- expo-contacts + expo-sms (emergency contacts)

## Run locally (Expo Go)
```bash
npm install
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone.

## Build for device (EAS)

### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Set up your project
```bash
eas init
```
Copy the `projectId` into `app.json` under `extra.eas.projectId`.

### 3. Development build (test on real device)
```bash
eas build --profile development --platform android
```

### 4. Preview APK (share with testers)
```bash
eas build --profile preview --platform android
```

### 5. Production build (Play Store / App Store)
```bash
eas build --profile production --platform all
eas submit --platform android
eas submit --platform ios
```

## API Keys needed for production

| Service | Where to get it | Where to add it |
|---|---|---|
| Mapbox (maps) | mapbox.com | `app.json` → `extra.mapboxToken` |
| RevenueCat (payments) | revenuecat.com | `.env` |
| TomTom (speed limits) | developer.tomtom.com | `useSpeedMonitor.js` |

## Build phases completed
- **Phase 1** ✅ Scaffold, theme, map, 3D Ovibe
- **Phase 2** ✅ Sensors (accelerometer, speed, fatigue)
- **Phase 3** ✅ Navigation, voice guidance, POI carousel
- **Phase 4** ✅ Voice commands, emergency SOS, safety overlay
- **Phase 5** ✅ Paywall, accessory store, contextual ads
