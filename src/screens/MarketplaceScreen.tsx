import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../navigation/MainNavigator';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/colors';
import * as listingService from '../services/listingService';
import { ApiListing, ListingCategory } from '../services/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Marketplace'>;

const CATEGORIES: { key: ListingCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'home', label: 'Home' },
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'property', label: 'Property' },
  { key: 'services', label: 'Services' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'other', label: 'Other' },
];

const SORTS: { key: 'newest' | 'price_asc' | 'price_desc'; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
];

function formatPrice(price: number, currency: string) {
  const symbol: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const s = symbol[currency] || currency + ' ';
  return `${s}${price.toLocaleString()}`;
}

function ListingCard({
  listing,
  onPress,
  colors,
}: {
  listing: ApiListing;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const cover = listing.images[0];
  const cardStyles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    imageWrap: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.border,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      padding: spacing.sm,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    price: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 2,
    },
    meta: {
      fontSize: 12,
      color: colors.textMuted,
    },
    soldBadge: {
      position: 'absolute',
      top: spacing.xs,
      left: spacing.xs,
      backgroundColor: colors.danger,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    soldText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
  });

  return (
    <Pressable style={cardStyles.card} onPress={onPress}>
      <View style={cardStyles.imageWrap}>
        {cover ? (
          <Image source={{ uri: cover }} style={cardStyles.image} resizeMode="cover" />
        ) : (
          <View style={cardStyles.placeholder}>
            <Ionicons name="image-outline" size={40} color={colors.textMuted} />
          </View>
        )}
        {listing.status === 'sold' ? (
          <View style={cardStyles.soldBadge}>
            <Text style={cardStyles.soldText}>SOLD</Text>
          </View>
        ) : null}
      </View>
      <View style={cardStyles.body}>
        <Text style={cardStyles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={cardStyles.price}>{formatPrice(listing.price, listing.currency)}</Text>
        {listing.location ? (
          <Text style={cardStyles.meta} numberOfLines={1}>
            📍 {listing.location}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function MarketplaceScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [listings, setListings] = useState<ApiListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [category, setCategory] = useState<ListingCategory | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const loadListings = useCallback(
    async (targetPage: number, append = false) => {
      setError(null);
      try {
        const { listings: fetched, hasMore: more } = await listingService.getListings({
          page: targetPage,
          category,
          q: activeSearch,
          sort,
        });
        setListings((prev) => (append ? [...prev, ...fetched] : fetched));
        setHasMore(more);
        setPage(targetPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load listings');
      }
    },
    [category, activeSearch, sort]
  );

  // Reset + reload whenever a filter changes
  useEffect(() => {
    setIsLoading(true);
    loadListings(1, false).finally(() => setIsLoading(false));
  }, [loadListings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadListings(1, false);
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    await loadListings(page + 1, true);
    setIsLoadingMore(false);
  };

  const handleSearchSubmit = () => {
    setActiveSearch(searchQuery.trim());
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundDark,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      padding: 0,
    },
    categoriesRow: {
      paddingBottom: spacing.sm,
    },
    categoriesContent: {
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    categoryChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 2,
      borderRadius: radius.full,
      borderWidth: 1,
      marginRight: spacing.sm,
    },
    categoryText: {
      fontSize: 13,
      fontWeight: '600',
    },
    sortRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    sortChip: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 4,
      borderRadius: radius.sm,
      borderWidth: 1,
    },
    sortText: {
      fontSize: 12,
      fontWeight: '600',
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl + insets.bottom,
      gap: spacing.sm,
    },
    columnWrapper: {
      gap: spacing.sm,
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
    fab: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.lg + insets.bottom,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={() => navigation.navigate('MyListings')}>
            <Ionicons name="list-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Favorites')}>
            <Ionicons name="heart-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search listings..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery ? (
            <Pressable onPress={() => { setSearchQuery(''); setActiveSearch(''); }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesRow}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCategory(c.key)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: active ? colors.primary : 'transparent',
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: active ? colors.accent : colors.textMuted },
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sortRow}>
        {SORTS.map((s) => {
          const active = sort === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => setSort(s.key)}
              style={[
                styles.sortChip,
                {
                  backgroundColor: active ? colors.backgroundDark : 'transparent',
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sortText,
                  { color: active ? colors.primary : colors.textMuted },
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => loadListings(1, false)} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
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
            <ListingCard
              listing={item}
              colors={colors}
              onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { marginTop: spacing.md }]}>
                {activeSearch
                  ? `No listings match "${activeSearch}"`
                  : 'No listings yet. Be the first to post!'}
              </Text>
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
            ) : null
          }
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing')}
      >
        <Ionicons name="add" size={28} color={colors.accent} />
      </Pressable>
    </View>
  );
}