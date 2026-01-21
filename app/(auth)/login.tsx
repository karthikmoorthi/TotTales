import React from 'react';
import {
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
import { LoadingSpinner, Button } from '@/components/ui';
import { COLORS, FONT_SIZES, SPACING } from '@/utils/constants';

export default function LoginScreen() {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const insets = useSafeAreaInsets();

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
      <View style={[styles.content, { paddingTop: insets.top + SPACING.xl }]}>
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
          <TouchableOpacity
            style={styles.googleButton}
            onPress={signIn}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={24} color={COLORS.text} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
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
    paddingHorizontal: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING['2xl'],
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
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
    flex: 1,
    justifyContent: 'center',
    marginVertical: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
