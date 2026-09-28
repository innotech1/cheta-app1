import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/colors';

export default function CustomDrawerContent(props: any) {
  const { user } = useAuth();
  const { colors } = useTheme();

  const goToMarketplace = () => {
    props.navigation.closeDrawer();
    props.navigation.navigate('MainTabs', {
      screen: 'Marketplace',
    });
  };

  const goToMyListings = () => {
    props.navigation.closeDrawer();
    props.navigation.navigate('MainTabs', {
      screen: 'MyListings',
    });
  };

  const goToFavorites = () => {
    props.navigation.closeDrawer();
    props.navigation.navigate('MainTabs', {
      screen: 'Favorites',
    });
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ backgroundColor: colors.background }}
    >
      {/* User header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Image
          source={
            user?.avatarUrl
              ? { uri: user.avatarUrl }
              : require('../../assets/images/logo.png')
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.displayName ?? 'Guest'}
          </Text>
          <Text style={[styles.username, { color: colors.textMuted }]}>
            @{user?.username ?? 'guest'}
          </Text>
        </View>
      </View>

      {/* Default drawer items (MainTabs, Settings) */}
      <DrawerItemList {...props} />

      {/* Marketplace section */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Marketplace
      </Text>

      <DrawerItem
        label="Browse"
        labelStyle={{ color: colors.text, fontWeight: '600' }}
        icon={({ size }) => (
          <Ionicons name="storefront-outline" size={size} color={colors.primary} />
        )}
        onPress={goToMarketplace}
      />

      <DrawerItem
        label="My Listings"
        labelStyle={{ color: colors.text, fontWeight: '600' }}
        icon={({ size }) => (
          <Ionicons name="pricetags-outline" size={size} color={colors.primary} />
        )}
        onPress={goToMyListings}
      />

      <DrawerItem
        label="Saved"
        labelStyle={{ color: colors.text, fontWeight: '600' }}
        icon={({ size }) => (
          <Ionicons name="heart-outline" size={size} color={colors.primary} />
        )}
        onPress={goToFavorites}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
  },
  username: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
});