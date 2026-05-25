import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import useVibeyStore from '../../store/useVibeyStore';
import { colors } from '../../theme/colors';

// ─── VibeyCompanion ──────────────────────────────────────────────────────────
// The 3D animated emoji face rendered via Three.js + expo-gl.
// All geometry is built in code — no external model files needed.

export default function VibeyCompanion() {
  const { vibeyColor, vibeyGlow, accessories, vibeyReaction } = useVibeyStore();

  // Animated values for bounce and shake reactions
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Three.js refs
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const headRef = useRef(null);
  const glRef = useRef(null);
  const frameRef = useRef(null);
  const goggleRef = useRef(null);
  const hatRef = useRef(null);
  const glassesRef = useRef(null);
  const haloRef = useRef(null);

  // ── Reaction animations ──────────────────────────────────────────────────
  useEffect(() => {
    if (vibeyReaction === 'bounce') {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -30, duration: 100, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 0, friction: 3, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    } else if (vibeyReaction === 'excited') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -10, duration: 150, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start();
    } else if (vibeyReaction === 'scared') {
      // Speed warning — rapid shake side to side
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 6, duration: 80, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: -6, duration: 80, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 0, friction: 5, useNativeDriver: true }),
      ]).start();
    } else if (vibeyReaction === 'sleepy') {
      // Slow drooping down
      Animated.timing(bounceAnim, { toValue: 12, duration: 1200, useNativeDriver: true }).start();
    } else if (vibeyReaction === 'idle') {
      Animated.spring(bounceAnim, { toValue: 0, friction: 5, useNativeDriver: true }).start();
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    }
  }, [vibeyReaction]);

  // ── Three.js scene setup ────────────────────────────────────────────────
  const onContextCreate = async (gl) => {
    glRef.current = gl;
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;

    // Build a minimal canvas-like shim so Three.js WebGLRenderer accepts expo-gl
    const canvasShim = {
      width: w,
      height: h,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      clientWidth: w,
      clientHeight: h,
      getContext: () => gl,
    };

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasShim,
      context: gl,
      antialias: false, // keep it fast on mobile
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0); // transparent background
    rendererRef.current = renderer;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 4);

    // ── Lighting ──────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x00F5FF, 2, 20); // Cyan key light
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xBF5FFF, 1.5, 20); // Purple fill
    fillLight.position.set(-2, -1, 3);
    scene.add(fillLight);

    // ── Head ─────────────────────────────────────────────────────────────
    const headGeo = new THREE.SphereGeometry(1, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(vibeyColor),
      roughness: 0.15,
      metalness: 0.3,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    scene.add(head);
    headRef.current = head;

    // ── Eyes ──────────────────────────────────────────────────────────────
    const eyeGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.35, 0.2, 0.88);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.35, 0.2, 0.88);
    head.add(rightEye);

    // Eye shine
    const shineGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const shineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff });
    const leftShine = new THREE.Mesh(shineGeo, shineMat);
    leftShine.position.set(0.06, 0.07, 0.16);
    leftEye.add(leftShine);
    const rightShine = new THREE.Mesh(shineGeo, shineMat);
    rightShine.position.set(0.06, 0.07, 0.16);
    rightEye.add(rightShine);

    // ── Smile ─────────────────────────────────────────────────────────────
    const smileCurve = new THREE.TorusGeometry(0.4, 0.06, 8, 20, Math.PI);
    const smileMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
    const smile = new THREE.Mesh(smileCurve, smileMat);
    smile.position.set(0, -0.25, 0.88);
    smile.rotation.z = Math.PI;
    head.add(smile);

    // ── Neon Halo ─────────────────────────────────────────────────────────
    const haloGeo = new THREE.TorusGeometry(1.2, 0.04, 8, 64);
    const haloMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(vibeyGlow),
      emissive: new THREE.Color(vibeyGlow),
      emissiveIntensity: 2,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 1.1, 0);
    halo.rotation.x = Math.PI / 2;
    scene.add(halo);
    haloRef.current = halo;

    // ── Sunglasses ────────────────────────────────────────────────────────
    if (accessories.sunglasses) {
      const lensGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 20);
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0x000000, opacity: 0.85, transparent: true,
        roughness: 0.1, metalness: 0.6,
      });
      const leftLens = new THREE.Mesh(lensGeo, lensMat);
      leftLens.position.set(-0.35, 0.2, 0.94);
      leftLens.rotation.x = Math.PI / 2;
      head.add(leftLens);

      const rightLens = new THREE.Mesh(lensGeo, lensMat);
      rightLens.position.set(0.35, 0.2, 0.94);
      rightLens.rotation.x = Math.PI / 2;
      head.add(rightLens);
      glassesRef.current = { leftLens, rightLens };
    }

    // ── Racing Goggles ────────────────────────────────────────────────────
    if (accessories.goggles) {
      const goggleMat = new THREE.MeshStandardMaterial({
        color: 0xFF4400, emissive: 0xFF2200, emissiveIntensity: 0.5,
        roughness: 0.2, metalness: 0.8,
      });
      const goggleGeo = new THREE.BoxGeometry(0.9, 0.25, 0.08);
      const goggles = new THREE.Mesh(goggleGeo, goggleMat);
      goggles.position.set(0, 0.22, 0.95);
      head.add(goggles);
      goggleRef.current = goggles;
    }

    // ── Hat ───────────────────────────────────────────────────────────────
    if (accessories.hat) {
      const brimGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.08, 32);
      const crownGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.9, 32);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.7 });
      const brim = new THREE.Mesh(brimGeo, hatMat);
      brim.position.set(0, 1.05, 0);
      head.add(brim);
      const crown = new THREE.Mesh(crownGeo, hatMat);
      crown.position.set(0, 1.55, 0);
      head.add(crown);
    }

    // ── Animation loop ─────────────────────────────────────────────────────
    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.02;

      // Gentle idle float
      head.position.y = Math.sin(t) * 0.08;
      head.rotation.y = Math.sin(t * 0.5) * 0.15;

      // Halo pulse
      if (haloRef.current) {
        haloRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.5;
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: bounceAnim }, { scale: scaleAnim }] },
      ]}
    >
      <GLView style={styles.gl} onContextCreate={onContextCreate} />
      <ReactionBubble />
    </Animated.View>
  );
}

// ── Reaction Speech Bubble ────────────────────────────────────────────────────
function ReactionBubble() {
  const { vibeyReaction, personalityMode } = useVibeyStore();

  const messages = {
    bounce: {
      normal: 'Whoa! Bumpy road! 🛣️',
      funny: 'Oops, almost jumped out! 😱',
      serious: 'Road surface anomaly detected.',
    },
    excited: {
      normal: "Great, we're rolling! 🚗",
      funny: 'My oh my, speed demon! 🎉',
      serious: 'Velocity increased.',
    },
    scared: {
      normal: 'Slow down a little! ⚠️',
      funny: 'Oopsy! Easy there, speed racer! 😅',
      serious: 'Warning: exceeding speed limit.',
    },
    sleepy: {
      normal: 'Feeling tired? Pull over soon.',
      funny: "Zzz... don't you dare fall asleep! 😴",
      serious: 'Fatigue alert. Stop at next opportunity.',
    },
    idle: null,
  };

  const msg = messages[vibeyReaction]?.[personalityMode];
  if (!msg) return null;

  return (
    <View style={styles.bubble}>
      <Text style={styles.bubbleText}>{msg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 140,
    alignItems: 'center',
  },
  gl: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  bubble: {
    position: 'absolute',
    top: -40,
    right: -20,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.cyan,
    maxWidth: 160,
  },
  bubbleText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
});
