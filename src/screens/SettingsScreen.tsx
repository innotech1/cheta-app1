import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/colors';
import ThemeToggle from '../components/ThemeToggle';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  destructive,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <Pressable
      style={[
        rowStyles.row,
        { borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={destructive ? colors.danger : colors.textMuted}
      />
      <Text
        style={[
          rowStyles.rowLabel,
          { color: destructive ? colors.danger : colors.text },
        ]}
      >
        {label}
      </Text>
      {value ? (
        <Text style={[rowStyles.rowValue, { color: colors.textMuted }]}>{value}</Text>
      ) : null}
      {onPress && !destructive ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Account</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <SettingsRow
          icon="person-outline"
          label="Display name"
          value={user?.displayName}
          colors={colors}
        />
        <SettingsRow
          icon="at-outline"
          label="Username"
          value={`@${user?.username ?? ''}`}
          colors={colors}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            padding: spacing.md,
          },
        ]}
      >
        <ThemeToggle />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>About</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <SettingsRow
          icon="information-circle-outline"
          label="Chetá"
          value="v1.0.0"
          colors={colors}
        />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <SettingsRow
          icon="log-out-outline"
          label="Sign out"
          onPress={signOut}
          destructive
          colors={colors}
        />
      </View>
    </ScrollView>
  );
}

// Static styles that don't depend on theme colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

// Row styles — colors are applied inline since they depend on the theme
const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
  },
  rowValue: {
    fontSize: 14,
  },
});