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
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../navigation/MainNavigator';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/colors';
import * as listingService from '../services/listingService';
import { ApiListing, ListingStatus } from '../services/types';

type Props = NativeStackScreenProps<MainStackParamList, 'MyListings'>;

const FILTERS: { key: ListingStatus | 'all'; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'sold', label: 'Sold' },
  { key: 'archived', label: 'Archived' },
  { key: 'all', label: 'All' },
];

function formatPrice(price: number, currency: string) {
  const symbol: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return `${symbol[currency] || currency + ' '}${price.toLocaleString()}`;
}

export default function MyListingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [listings, setListings] = useState<ApiListing[]>([]);
  const [filter, setFilter] = useState<ListingStatus | 'all'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setError(null);
    try {
      const { listings: fetched } = await listingService.getMyListings(filter);
      setListings(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load listings');
    }
  }, [filter]);

  useEffect(() => {
    setIsLoading(true);
    loadListings().finally(() => setIsLoading(false));
  }, [loadListings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadListings();
    setIsRefreshing(false);
  };

  const handleMarkSold = async (listing: ApiListing) => {
    const newStatus: ListingStatus = listing.status === 'sold' ? 'active' : 'sold';
    try {
      const { listing: updated } = await listingService.updateListing(listing.id, {
        status: newStatus,
      });
      setListings((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );
    } catch (err) {
      Alert.alert(
        'Could not update',
        err instanceof Error ? err.message : 'Please try again.'
      );
    }
  };

  const handleDelete = (listing: ApiListing) => {
    Alert.alert('Delete listing?', `"${listing.title}" will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await listingService.deleteListing(listing.id);
            setListings((prev) => prev.filter((l) => l.id !== listing.id));
          } catch (err) {
            Alert.alert(
              'Delete failed',
              err instanceof Error ? err.message : 'Please try again.'
            );
          }
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    filtersRow: {
      paddingVertical: spacing.sm,
    },
    filtersContent: {
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 2,
      borderRadius: radius.full,
      borderWidth: 1,
      marginRight: spacing.sm,
    },
    filterText: {
      fontSize: 13,
      fontWeight: '600',
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: spacing.xl + insets.bottom,
      gap: spacing.sm,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardImage: {
      width: 100,
      height: 100,
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
      flex: 1,
      padding: spacing.sm,
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    cardPrice: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.primary,
    },
    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 4,
    },
    cardMeta: {
      fontSize: 12,
      color: colors.textMuted,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    statusText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    actionButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
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

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.primary : 'transparent',
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? colors.accent : colors.textMuted },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadListings} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const statusColors: Record<ListingStatus, string> = {
              active: colors.success,
              sold: colors.danger,
              archived: colors.textMuted,
            };
            return (
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
                      <Ionicons
                        name="image-outline"
                        size={28}
                        color={colors.textMuted}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardPrice}>
                      {formatPrice(item.price, item.currency)}
                    </Text>
                    <View style={styles.cardMetaRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColors[item.status] },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.cardMeta}>
                        {item.viewCount} views · {item.favoriteCount} saves
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('EditListing', { listingId: item.id });
                      }}
                    >
                      <Ionicons name="create-outline" size={14} color={colors.text} />
                      <Text style={styles.actionText}>Edit</Text>
                    </Pressable>

                    <Pressable
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleMarkSold(item);
                      }}
                    >
                      <Ionicons
                        name={item.status === 'sold' ? 'refresh-outline' : 'checkmark-outline'}
                        size={14}
                        color={colors.text}
                      />
                      <Text style={styles.actionText}>
                        {item.status === 'sold' ? 'Relist' : 'Mark Sold'}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="pricetags-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {filter === 'active'
                  ? "You haven't posted any active listings yet."
                  : `No ${filter} listings.`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}