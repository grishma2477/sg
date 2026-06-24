import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { COLORS } from '../constants';

export default function OfflineBanner() {
  const { isOnline, justReconnected } = useNetworkStatus();
  const translateY = useRef(new Animated.Value(-48)).current;
  const bgColor    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOnline || justReconnected) {
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(translateY, { toValue: -48, duration: 300, useNativeDriver: true }).start();
    }
    if (justReconnected) {
      Animated.sequence([
        Animated.timing(bgColor, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.delay(2000),
        Animated.timing(bgColor, { toValue: 0, duration: 200, useNativeDriver: false }),
      ]).start();
    }
  }, [isOnline, justReconnected]);

  const backgroundColor = bgColor.interpolate({
    inputRange:  [0, 1],
    outputRange: [COLORS.danger, COLORS.success],
  });

  if (isOnline && !justReconnected) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }], backgroundColor }]}>
      <Text style={styles.text}>
        {justReconnected ? '✓ Back online' : '⚠ No internet connection'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', top: 0, left: 0, right: 0, height: 36, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  text:   { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});
