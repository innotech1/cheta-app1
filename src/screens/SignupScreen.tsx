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
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!displayName.trim() || !username.trim() || !identifier.trim() || !password) {
      setFormError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await signup({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        identifier: identifier.trim(),
        password,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Signup failed');
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
        source={require('../../assets/images/logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.title}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Display name"
        placeholderTextColor={colors.textMuted}
        value={displayName}
        onChangeText={setDisplayName}
        editable={!isSubmitting}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={colors.textMuted}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isSubmitting}
      />
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
        onPress={handleSignup}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Text style={styles.primaryButtonText}>Sign up</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login')} disabled={isSubmitting}>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
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