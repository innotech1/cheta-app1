import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme/colors';

export default function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.displayName || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.handle}>@{user?.username}</Text>
      </View>

      <View style={styles.menu}>
        <Pressable
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
          <Text style={styles.menuLabel}>Settings</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={signOut}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={[styles.menuLabel, { color: colors.danger }]}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl + spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 22,
  },
  name: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 17,
  },
  handle: {
    color: 'rgba(242,232,213,0.8)',
    fontSize: 13,
  },
  menu: {
    padding: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  menuLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
});
