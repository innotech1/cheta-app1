import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setFormError('Enter your phone/email and password.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await login(identifier.trim(), password);
      // RootNavigator swaps to the main app automatically once `user` is set.
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Image
        source={require('../../../assets/images/logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.logo}>Chetá</Text>
      <Text style={styles.tagline}>See what's happening, stay close to who matters.</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone or email"
        placeholderTextColor={colors.textMuted}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        editable={!isSubmitting}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isSubmitting}
      />

      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

      <Pressable
        style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Text style={styles.primaryButtonText}>Log in</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Signup')} disabled={isSubmitting}>
        <Text style={styles.link}>New to Chetá? Create an account</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: 14,
  },
});
