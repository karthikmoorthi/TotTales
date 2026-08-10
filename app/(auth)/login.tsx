import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui';
import { COLORS, FONT_SIZES, SPACING } from '@/utils/constants';

export default function LoginScreen() {
  const {
    isAuthenticated,
    isLoading,
    googleConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  async function handleEmailSubmit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 8) {
      Alert.alert('Check your details', 'Enter a valid email and a password of at least 8 characters.');
      return;
    }

    try {
      if (isCreatingAccount) {
        const confirmationRequired = await signUpWithEmail(normalizedEmail, password);
        if (confirmationRequired) {
          Alert.alert('Check your email', 'Confirm your email, then return here to sign in.');
          setIsCreatingAccount(false);
        }
      } else {
        await signInWithEmail(normalizedEmail, password);
      }
    } catch (error) {
      Alert.alert(
        isCreatingAccount ? 'Could not create account' : 'Could not sign in',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(main)" />;
  }

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.content, { paddingTop: insets.top + SPACING.xl }]}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="book" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>TotTales</Text>
          <Text style={styles.subtitle}>
            Personalized storybooks where your child is the hero
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem
            icon="camera"
            title="Upload Photos"
            description="Add photos of your child"
          />
          <FeatureItem
            icon="color-palette"
            title="Choose a Theme"
            description="Pick an exciting adventure"
          />
          <FeatureItem
            icon="sparkles"
            title="AI Magic"
            description="Watch stories come to life"
          />
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email address"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            autoCapitalize="none"
            autoComplete={isCreatingAccount ? 'new-password' : 'current-password'}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleEmailSubmit}
          />
          <TouchableOpacity style={styles.emailButton} onPress={handleEmailSubmit}>
            <Text style={styles.emailButtonText}>
              {isCreatingAccount ? 'Create account' : 'Sign in'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsCreatingAccount((value) => !value)}>
            <Text style={styles.modeText}>
              {isCreatingAccount ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </Text>
          </TouchableOpacity>

          {googleConfigured && (
            <TouchableOpacity
              style={styles.googleButton}
              onPress={signInWithGoogle}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={24} color={COLORS.text} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.termsText}>
            Private revival build — privacy and parental-consent controls are not finalized
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  logoContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
  },
  features: {
    marginVertical: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footer: {
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    color: COLORS.text,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZES.base,
  },
  emailButton: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
  modeText: {
    color: '#FFFFFF',
    marginVertical: SPACING.md,
    fontSize: FONT_SIZES.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  googleButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  termsText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
  },
});
