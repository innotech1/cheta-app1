import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../theme/ThemeContext';
import { radius } from '../theme/colors';

export default function ThemeToggle() {
  const { mode, setMode, colors } = useTheme();

  const options: { key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = mode === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => setMode(opt.key)}
            style={[
              styles.option,
              {
                backgroundColor: active ? colors.primary : 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name={opt.icon}
              size={16}
              color={active ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: active ? colors.accent : colors.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 3,
    gap: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});