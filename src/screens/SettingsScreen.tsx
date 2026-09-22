import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme/colors';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <Ionicons name={icon} size={20} color={destructive ? colors.danger : colors.textMuted} />
      <Text style={[styles.rowLabel, destructive && { color: colors.danger }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && !destructive ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <SettingsRow icon="person-outline" label="Display name" value={user?.displayName} />
        <SettingsRow icon="at-outline" label="Username" value={`@${user?.username ?? ''}`} />
      </View>

      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <SettingsRow icon="information-circle-outline" label="Chetá" value="v1.0.0" />
      </View>

      <View style={styles.card}>
        <SettingsRow icon="log-out-outline" label="Sign out" onPress={signOut} destructive />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  rowValue: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
