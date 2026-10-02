import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../navigation/MainNavigator';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/colors';
import * as listingService from '../services/listingService';
import { uploadMedia } from '../services/mediaService';
import { ListingCategory } from '../services/types';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateListing' | 'EditListing'>;

const CATEGORIES: { key: ListingCategory; label: string }[] = [
  { key: 'electronics', label: 'Electronics' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'home', label: 'Home' },
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'property', label: 'Property' },
  { key: 'services', label: 'Services' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'other', label: 'Other' },
];

const CONDITIONS = ['new', 'used', 'refurbished', 'not_applicable'] as const;
const MAX_IMAGES = 8;

export default function CreateListingScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const editingId =
    route.params && 'listingId' in route.params
      ? (route.params as { listingId?: string }).listingId
      : undefined;
  const isEditing = Boolean(editingId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [category, setCategory] = useState<ListingCategory>('other');
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number]>('used');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const { listing } = await listingService.getListing(editingId);
        setTitle(listing.title);
        setDescription(listing.description);
        setPrice(String(listing.price));
        setNegotiable(listing.negotiable);
        setCategory(listing.category);
        setCondition(listing.condition);
        setLocation(listing.location);
        setImages(listing.images);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load listing');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [editingId]);

  const handlePickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit reached', `You can attach up to ${MAX_IMAGES} images.`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: type === 'video' ? ['videos'] : ['images'],  // 👈 array API
  allowsMultipleSelection: true,
  selectionLimit: 0,   // 0 = no limit; or a specific number
  quality: 0.8,
});

    if (result.canceled || !result.assets?.length) return;

    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (const asset of result.assets) {
        const { url } = await uploadMedia(asset.uri, 'image');
        uploaded.push(url);
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, MAX_IMAGES));
    } catch (err) {
      Alert.alert(
        'Upload failed',
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError('Please add a title');
      return;
    }
    if (!description.trim()) {
      setError('Please add a description');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        negotiable,
        category,
        condition,
        location: location.trim(),
        images,
      };

      if (isEditing && editingId) {
        await listingService.updateListing(editingId, payload);
      } else {
        await listingService.createListing(payload);
      }

      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: spacing.xl + insets.bottom,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.background,
    },
    textarea: { minHeight: 120, textAlignVertical: 'top' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      marginTop: spacing.xs,
    },
    rowLabel: { fontSize: 15, color: colors.text },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    categoryChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 2,
      borderRadius: radius.full,
      borderWidth: 1,
    },
    categoryText: { fontSize: 13, fontWeight: '600' },
    imagesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    imageWrap: {
      width: 90,
      height: 90,
      borderRadius: radius.sm,
      overflow: 'hidden',
      position: 'relative',
    },
    image: { width: '100%', height: '100%' },
    removeBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addImageButton: {
      width: 90,
      height: 90,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      color: colors.danger,
      fontSize: 14,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.sm + 6,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    submitButtonText: {
      color: colors.accent,
      fontWeight: '800',
      fontSize: 16,
    },
    buttonDisabled: { opacity: 0.6 },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.label}>Photos ({images.length}/{MAX_IMAGES})</Text>
      <View style={styles.imagesRow}>
        {images.map((uri, i) => (
          <View key={i} style={styles.imageWrap}>
            <Image source={{ uri }} style={styles.image} />
            <Pressable style={styles.removeBadge} onPress={() => handleRemoveImage(i)}>
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {images.length < MAX_IMAGES ? (
          <Pressable
            style={styles.addImageButton}
            onPress={handlePickImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={24} color={colors.primary} />
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                  Add photo
                </Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="What are you selling?"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        maxLength={120}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Describe the item"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={3000}
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Price is negotiable</Text>
        <Switch
          value={negotiable}
          onValueChange={setNegotiable}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
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
      </View>

      <Text style={styles.label}>Condition</Text>
      <View style={styles.categoryGrid}>
        {CONDITIONS.map((c) => {
          const active = condition === c;
          return (
            <Pressable
              key={c}
              onPress={() => setCondition(c)}
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
                {c.replace('_', ' ')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Location (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Port Harcourt"
        placeholderTextColor={colors.textMuted}
        value={location}
        onChangeText={setLocation}
        maxLength={100}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <>
            <Ionicons
              name={isEditing ? 'checkmark-circle-outline' : 'add-circle-outline'}
              size={20}
              color={colors.accent}
            />
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Save Changes' : 'Post Listing'}
            </Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}