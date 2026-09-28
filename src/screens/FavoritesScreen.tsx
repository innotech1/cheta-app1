import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../navigation/MainNavigator';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/colors';
import * as listingService from '../services/listingService';
import { ApiListing } from '../services/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Favorites'>;

function formatPrice(price: number, currency: string) {
  const symbol: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return `${symbol[currency] || currency + ' '}${price.toLocaleString()}`;
}

export default function FavoritesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [listings, setListings] = useState<ApiListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setError(null);
    try {
      const { listings: fetched } = await listingService.getFavorites();
      setListings(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load favorites');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadFavorites().finally(() => setIsLoading(false));
  }, [loadFavorites]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFavorites();
    setIsRefreshing(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: spacing.xl + insets.bottom,
      gap: spacing.sm,
    },
    columnWrapper: {
      gap: spacing.sm,
    },
    card: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardImage: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.backgroundDark,
    },
    cardImageReal: {
      width: '100%',
      height: '100%',
    },
    cardImagePlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBody: {
      padding: spacing.sm,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    cardPrice: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.primary,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    errorText: {
      color: colors.danger,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      fontSize: 15,
      marginTop: spacing.md,
    },
    retryButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
    retryText: {
      color: colors.accent,
      fontWeight: '600',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={loadFavorites} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('ListingDetail', { listingId: item.id })
            }
          >
            <View style={styles.cardImage}>
              {item.images[0] ? (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.cardImageReal}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color={colors.textMuted} />
                </View>
              )}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardPrice}>
                {formatPrice(item.price, item.currency)}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              You haven't saved any listings yet. Tap the heart on a listing to save it here.
            </Text>
          </View>
        }
      />
    </View>
  );
}