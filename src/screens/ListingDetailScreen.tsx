import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../navigation/MainNavigator';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import * as listingService from '../services/listingService';
import * as conversationService from '../services/conversationService';
import { ApiListing } from '../services/types';

type Props = NativeStackScreenProps<MainStackParamList, 'ListingDetail'>;

const SCREEN_WIDTH = Dimensions.get('window').width;

function formatPrice(price: number, currency: string) {
  const symbol: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return `${symbol[currency] || currency + ' '}${price.toLocaleString()}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ListingDetailScreen({ navigation, route }: Props) {
  const { listingId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [listing, setListing] = useState<ApiListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isContacting, setIsContacting] = useState(false);

  const isOwner = user && listing?.author?.id === user.id;

  const loadListing = useCallback(async () => {
    setError(null);
    try {
      const { listing: fetched } = await listingService.getListing(listingId);
      setListing(fetched);
      setFavoriteCount(fetched.favoriteCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load listing');
    }
  }, [listingId]);

  useEffect(() => {
    setIsLoading(true);
    loadListing().finally(() => setIsLoading(false));
  }, [loadListing]);

  const handleFavorite = async () => {
    if (!listing || isFavoriteLoading) return;
    setIsFavoriteLoading(true);
    const wasFavorited = isFavorited;
    const prevCount = favoriteCount;
    setIsFavorited(!wasFavorited);
    setFavoriteCount(wasFavorited ? prevCount - 1 : prevCount + 1);
    try {
      const { favorited, favoriteCount: newCount } = await listingService.toggleFavorite(
        listing.id
      );
      setIsFavorited(favorited);
      setFavoriteCount(newCount);
    } catch {
      setIsFavorited(wasFavorited);
      setFavoriteCount(prevCount);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!listing?.author?.username || isContacting) return;
    setIsContacting(true);
    try {
      const { conversation } = await conversationService.getOrCreateConversation(
        listing.author.username
      );
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        otherUserName: listing.author.displayName,
      });
    } catch (err) {
      Alert.alert(
        'Could not open chat',
        err instanceof Error ? err.message : 'Please try again later.'
      );
    } finally {
      setIsContacting(false);
    }
  };

  const handleDelete = () => {
    if (!listing) return;
    Alert.alert('Delete listing?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await listingService.deleteListing(listing.id);
            navigation.goBack();
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

  const handleMarkSold = async () => {
    if (!listing) return;
    const newStatus = listing.status === 'sold' ? 'active' : 'sold';
    try {
      const { listing: updated } = await listingService.updateListing(listing.id, {
        status: newStatus,
      });
      setListing(updated);
    } catch (err) {
      Alert.alert(
        'Could not update',
        err instanceof Error ? err.message : 'Please try again.'
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    gallery: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH,
      backgroundColor: colors.backgroundDark,
    },
    galleryImage: {
      width: '100%',
      height: '100%',
    },
    galleryPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    galleryDots: {
      position: 'absolute',
      bottom: spacing.sm,
      alignSelf: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    galleryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    galleryDotActive: {
      backgroundColor: '#fff',
    },
    body: {
      padding: spacing.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    title: {
      flex: 1,
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    favoriteButton: {
      padding: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.backgroundDark,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    price: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.primary,
    },
    negotiableTag: {
      backgroundColor: colors.success,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    negotiableText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
    soldBanner: {
      backgroundColor: colors.danger,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      marginTop: spacing.sm,
      alignItems: 'center',
    },
    soldText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: 1,
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    section: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: spacing.sm,
      letterSpacing: 0.5,
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
    },
    sellerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: colors.backgroundDark,
      borderRadius: radius.md,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.border,
    },
    sellerInfo: {
      flex: 1,
    },
    sellerName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    sellerUsername: {
      fontSize: 13,
      color: colors.textMuted,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },
    ownerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    ownerButton: {
      flex: 1,
      paddingVertical: spacing.sm + 4,
      borderRadius: radius.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    ownerButtonText: {
      fontWeight: '700',
      fontSize: 14,
    },
    footer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md + insets.bottom,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    contactButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm + 6,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
    },
    contactButtonText: {
      color: colors.accent,
      fontWeight: '800',
      fontSize: 16,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Listing not found'}</Text>
        <Pressable onPress={loadListing} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const hasImages = listing.images.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.gallery}>
          {hasImages ? (
            <>
              <Image
                source={{ uri: listing.images[currentImage] }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
              {listing.images.length > 1 ? (
                <View style={styles.galleryDots}>
                  {listing.images.map((_, i) => (
                    <Pressable
                      key={i}
                      onPress={() => setCurrentImage(i)}
                      style={[
                        styles.galleryDot,
                        i === currentImage && styles.galleryDotActive,
                      ]}
                    />
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.galleryPlaceholder}>
              <Ionicons name="image-outline" size={64} color={colors.textMuted} />
            </View>
          )}
        </View>

        {hasImages && listing.images.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: spacing.md,
              gap: spacing.sm,
              paddingTop: spacing.sm,
            }}
          >
            {listing.images.map((uri, i) => (
              <Pressable key={i} onPress={() => setCurrentImage(i)}>
                <Image
                  source={{ uri }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: radius.sm,
                    borderWidth: i === currentImage ? 2 : 0,
                    borderColor: colors.primary,
                  }}
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.body}>
          {listing.status === 'sold' ? (
            <View style={styles.soldBanner}>
              <Text style={styles.soldText}>SOLD</Text>
            </View>
          ) : null}

          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <Pressable
              onPress={handleFavorite}
              style={styles.favoriteButton}
              disabled={isFavoriteLoading || isOwner}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorited ? colors.danger : colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatPrice(listing.price, listing.currency)}
            </Text>
            {listing.negotiable ? (
              <View style={styles.negotiableTag}>
                <Text style={styles.negotiableText}>NEGOTIABLE</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>{listing.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="sparkles-outline" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>{listing.condition}</Text>
            </View>
            {listing.location ? (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={styles.metaText}>{listing.location}</Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>{listing.viewCount} views</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="heart-outline" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>{favoriteCount} saves</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <View style={styles.sellerCard}>
              {listing.author?.avatarUrl ? (
                <Image source={{ uri: listing.author.avatarUrl }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    { alignItems: 'center', justifyContent: 'center' },
                  ]}
                >
                  <Ionicons name="person" size={24} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>
                  {listing.author?.displayName ?? 'Unknown'}
                </Text>
                <Text style={styles.sellerUsername}>
                  @{listing.author?.username ?? ''}
                </Text>
              </View>
            </View>

            {isOwner ? (
              <View style={styles.ownerActions}>
                <Pressable
                  style={[styles.ownerButton, { borderColor: colors.primary }]}
                  onPress={() =>
                    navigation.navigate('EditListing', { listingId: listing.id })
                  }
                >
                  <Text style={[styles.ownerButtonText, { color: colors.primary }]}>
                    Edit
                  </Text>
                </Pressable>
                <Pressable style={styles.ownerButton} onPress={handleMarkSold}>
                  <Text style={[styles.ownerButtonText, { color: colors.text }]}>
                    {listing.status === 'sold' ? 'Mark Active' : 'Mark Sold'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.ownerButton, { borderColor: colors.danger }]}
                  onPress={handleDelete}
                >
                  <Text style={[styles.ownerButtonText, { color: colors.danger }]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted</Text>
            <Text style={styles.description}>{formatDate(listing.createdAt)}</Text>
          </View>
        </View>
      </ScrollView>

      {!isOwner ? (
        <View style={styles.footer}>
          <Pressable
            style={styles.contactButton}
            onPress={handleContactSeller}
            disabled={isContacting}
          >
            {isContacting ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <Ionicons name="chatbubble-outline" size={20} color={colors.accent} />
                <Text style={styles.contactButtonText}>Contact Seller</Text>
              </>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}