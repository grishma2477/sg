import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants';

export default function TapChips({ chips = [], selected = [], onToggle, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {chips.map(chip => {
        const active = selected.includes(chip.key);
        return (
          <TouchableOpacity
            key={chip.key}
            onPress={() => onToggle?.(chip.key)}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.75}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{chip.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.gray200, backgroundColor: COLORS.white },
  chipActive:  { borderColor: COLORS.primary, backgroundColor: '#ede9fe' },
  label:       { fontSize: 13, color: COLORS.gray500 },
  labelActive: { color: COLORS.primary, fontWeight: '600' },
});
