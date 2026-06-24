import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants';

export default function StarRating({ value = 0, onChange, size = 36 }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onChange?.(n)} activeOpacity={0.8}>
          <Text style={[styles.star, { fontSize: size }]}>
            {n <= value ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row:  { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  star: { color: COLORS.warning },
});
