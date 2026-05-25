import { create } from 'zustand';

// ─── Vibey Master State Store ───────────────────────────────────────────────
// Single source of truth for the entire app.
// Covers: user location, navigation, Vibey appearance, personality, subscription.

const useVibeyStore = create((set) => ({

  // ── User Location ──────────────────────────────────────────────────────────
  location: null,           // { latitude, longitude, speed, heading }
  setLocation: (loc) => set({ location: loc }),

  // ── Navigation State ───────────────────────────────────────────────────────
  destination: null,        // { latitude, longitude, name }
  routeActive: false,
  routeCoords: [],          // Array of { latitude, longitude }
  currentInstruction: '',   // "Turn left onto Main St"
  distanceToNext: null,     // metres
  setDestination: (dest) => set({ destination: dest }),
  setRouteActive: (val) => set({ routeActive: val }),
  setRouteCoords: (coords) => set({ routeCoords: coords }),
  setCurrentInstruction: (instr) => set({ currentInstruction: instr }),
  setDistanceToNext: (d) => set({ distanceToNext: d }),

  // ── UI Mode ────────────────────────────────────────────────────────────────
  isFloatingMode: false,    // Widget overlay mode (Android only)
  mapStyle: 'dark-neon',    // 'dark-neon' | 'satellite' | 'standard'
  setFloatingMode: (val) => set({ isFloatingMode: val }),
  setMapStyle: (style) => set({ mapStyle: style }),

  // ── Vibey Personality ─────────────────────────────────────────────────────
  // 'normal' | 'funny' | 'serious'
  personalityMode: 'normal',
  setPersonalityMode: (mode) => set({ personalityMode: mode }),

  // ── Vibey Appearance ──────────────────────────────────────────────────────
  vibeyColor: '#FFD700',    // Skin colour
  vibeyGlow: '#00F5FF',     // Halo glow colour
  accessories: {
    sunglasses: false,
    hat: false,
    goggles: false,
  },
  setVibeyColor: (color) => set({ vibeyColor: color }),
  setVibeyGlow: (glow) => set({ vibeyGlow: glow }),
  toggleAccessory: (key) =>
    set((state) => ({
      accessories: {
        ...state.accessories,
        [key]: !state.accessories[key],
      },
    })),

  // ── Vibey Reaction State ──────────────────────────────────────────────────
  // Driven by sensors — triggers animations
  vibeyReaction: 'idle',    // 'idle' | 'bounce' | 'excited' | 'scared' | 'sleepy'
  setVibeyReaction: (reaction) => set({ vibeyReaction: reaction }),

  // ── Telematics Data ───────────────────────────────────────────────────────
  currentSpeed: 0,          // km/h from GPS
  speedLimit: null,         // km/h from API (null = unknown)
  isSpeeding: false,
  fatigueDetected: false,
  lastAccelSpike: 0,        // timestamp of last pothole spike
  setCurrentSpeed: (speed) => set({ currentSpeed: speed }),
  setSpeedLimit: (limit) => set({ speedLimit: limit }),
  setIsSpeeding: (val) => set({ isSpeeding: val }),
  setFatigueDetected: (val) => set({ fatigueDetected: val }),
  setLastAccelSpike: (ts) => set({ lastAccelSpike: ts }),

  // ── POIs ──────────────────────────────────────────────────────────────────
  pois: [],
  setPOIs: (pois) => set({ pois }),

  // ── Budget Filter ─────────────────────────────────────────────────────────
  // 'luxury' | 'midrange' | 'budget' | 'deals'
  budgetTier: 'midrange',
  setBudgetTier: (tier) => set({ budgetTier: tier }),

  // ── Subscription ──────────────────────────────────────────────────────────
  isPremium: false,         // Vibey Plus subscriber
  setIsPremium: (val) => set({ isPremium: val }),

  // ── Emergency Contacts ────────────────────────────────────────────────────
  emergencyContacts: [],    // [{ name, phone }]
  setEmergencyContacts: (contacts) => set({ emergencyContacts: contacts }),
}));

export default useVibeyStore;
