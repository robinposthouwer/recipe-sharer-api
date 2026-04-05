import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SplashAnimationProps {
  onFinished: () => void;
}

export function SplashAnimation({ onFinished }: SplashAnimationProps) {
  // Ghost float: 0 = laag, -22 = hoog
  const ghostY = useSharedValue(0);

  // "nosh" logo
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(18);

  // Tagline woorden
  const saveOpacity = useSharedValue(0);
  const shareOpacity = useSharedValue(0);
  const enjoyOpacity = useSharedValue(0);

  useEffect(() => {
    // Ghost zweeft omhoog en omlaag met asymmetrisch ritme
    // Snel omhoog (sin), langzamer omlaag (quad) — organisch zweefgevoel
    ghostY.value = withRepeat(
      withSequence(
        withTiming(-22, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2300, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false
    );

    // "nosh": fade + slide omhoog na korte pauze
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    logoY.value = withDelay(400, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));

    // Tagline woorden één voor één
    saveOpacity.value = withDelay(1400, withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) }));
    shareOpacity.value = withDelay(2050, withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) }));
    enjoyOpacity.value = withDelay(2700, withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) }));

    const timer = setTimeout(onFinished, 7000);
    return () => clearTimeout(timer);
  }, []);

  // Schaduw schaalt mee met ghost positie
  const shadowScale = useDerivedValue(() =>
    interpolate(ghostY.value, [-22, 0], [0.55, 1.0])
  );
  const shadowOpacity = useDerivedValue(() =>
    interpolate(ghostY.value, [-22, 0], [0.25, 0.45])
  );

  const ghostStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ghostY.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: shadowScale.value }],
    opacity: shadowOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));

  const saveStyle = useAnimatedStyle(() => ({ opacity: saveOpacity.value }));
  const shareStyle = useAnimatedStyle(() => ({ opacity: shareOpacity.value }));
  const enjoyStyle = useAnimatedStyle(() => ({ opacity: enjoyOpacity.value }));

  return (
    <View style={styles.container}>
      {/* Mascot: blob + ghost + schaduw */}
      <View style={styles.mascotContainer}>
        <Image
          source={require('../assets/images/blob.png')}
          style={styles.blob}
          resizeMode="contain"
        />
        <Animated.Image
          source={require('../assets/images/ghost-shadow.png')}
          style={[styles.shadow, shadowStyle]}
          resizeMode="contain"
        />
        <Animated.Image
          source={require('../assets/images/ghost.png')}
          style={[styles.ghost, ghostStyle]}
          resizeMode="contain"
        />
      </View>

      {/* "nosh" logo */}
      <Animated.Text style={[styles.logo, logoStyle]}>
        nosh
      </Animated.Text>

      {/* Tagline: SAVE · SHARE · ENJOY */}
      <View style={styles.taglineRow}>
        <Animated.Text style={[styles.taglineWord, saveStyle]}>SAVE</Animated.Text>
        <Animated.Text style={[styles.taglineDot, saveStyle]}> · </Animated.Text>
        <Animated.Text style={[styles.taglineWord, shareStyle]}>SHARE</Animated.Text>
        <Animated.Text style={[styles.taglineDot, shareStyle]}> · </Animated.Text>
        <Animated.Text style={[styles.taglineWord, enjoyStyle]}>ENJOY</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  mascotContainer: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    width: 320,
    height: 320,
    opacity: 0.85,
  },
  ghost: {
    width: 200,
    height: 200,
    position: 'absolute',
    top: 40,
  },
  shadow: {
    position: 'absolute',
    bottom: 30,
    width: 120,
    height: 20,
  },
  logo: {
    fontFamily: 'LondrinaSolid_900Black',
    fontSize: 56,
    color: '#FF7043',
    lineHeight: 60,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taglineWord: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: '#F9A825',
    letterSpacing: 4,
  },
  taglineDot: {
    fontSize: 13,
    color: '#F9A825',
  },
});
