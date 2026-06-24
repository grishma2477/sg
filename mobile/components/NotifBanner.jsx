import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants';

export default function NotifBanner({ notification, onDismiss }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (!notification) return;

    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => dismiss(), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  function dismiss() {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -80, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss?.());
  }

  if (!notification) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity onPress={dismiss} activeOpacity={0.9} style={styles.row}>
        <Text style={styles.title}>{notification.title ?? 'SG'}</Text>
        <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position:      'absolute',
    top:            60,
    left:           16,
    right:          16,
    backgroundColor:COLORS.gray900,
    borderRadius:   14,
    padding:        14,
    zIndex:         999,
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.25,
    shadowRadius:   8,
    elevation:      8,
  },
  row:   { gap: 4 },
  title: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  body:  { color: COLORS.gray200, fontSize: 13 },
});
