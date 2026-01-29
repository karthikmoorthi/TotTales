/**
 * Admin screen to generate theme and art style preview images
 * This is a one-time operation - once generated, images are stored in Supabase
 * and shared across all users.
 *
 * Access this screen at: /(main)/admin/generate-previews
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Header, Button } from '@/components/ui';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/utils/constants';
import {
  generateMissingThemePreviews,
  generateMissingStylePreviews,
} from '@/services/ai/previewImageGenerator';

interface GenerationLog {
  message: string;
  type: 'info' | 'success' | 'error';
  timestamp: Date;
}

export default function GeneratePreviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<GenerationLog[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs((prev) => [...prev, { message, type, timestamp: new Date() }]);
  };

  const handleGenerateThemes = async () => {
    setIsGenerating(true);
    setLogs([]);
    addLog('Starting theme preview generation...');

    try {
      await generateMissingThemePreviews((current, total, name) => {
        addLog(`Generating: ${name} (${current}/${total})`, 'info');
      });

      addLog('All theme previews generated successfully!', 'success');
      await queryClient.invalidateQueries({ queryKey: ['themes'] });
    } catch (error: any) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStyles = async () => {
    setIsGenerating(true);
    setLogs([]);
    addLog('Starting art style preview generation...');

    try {
      await generateMissingStylePreviews((current, total, name) => {
        addLog(`Generating: ${name} (${current}/${total})`, 'info');
      });

      addLog('All art style previews generated successfully!', 'success');
      await queryClient.invalidateQueries({ queryKey: ['artStyles'] });
    } catch (error: any) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    Alert.alert(
      'Generate All Previews',
      'This will generate preview images for all themes and art styles that are missing images. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            setIsGenerating(true);
            setLogs([]);

            addLog('Starting theme preview generation...');
            try {
              await generateMissingThemePreviews((current, total, name) => {
                addLog(`Theme: ${name} (${current}/${total})`, 'info');
              });
              addLog('Theme previews complete!', 'success');
            } catch (error: any) {
              addLog(`Theme error: ${error.message}`, 'error');
            }

            addLog('Starting art style preview generation...');
            try {
              await generateMissingStylePreviews((current, total, name) => {
                addLog(`Style: ${name} (${current}/${total})`, 'info');
              });
              addLog('Art style previews complete!', 'success');
            } catch (error: any) {
              addLog(`Style error: ${error.message}`, 'error');
            }

            await queryClient.invalidateQueries({ queryKey: ['themes'] });
            await queryClient.invalidateQueries({ queryKey: ['artStyles'] });

            addLog('All done!', 'success');
            setIsGenerating(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Generate Previews"
        subtitle="Admin"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + SPACING.xl },
        ]}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>One-Time Setup</Text>
          <Text style={styles.infoText}>
            Generate preview thumbnail images for themes and art styles. These
            images are stored in Supabase and shared across all users. You only
            need to run this once.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="Generate Theme Previews"
            onPress={handleGenerateThemes}
            disabled={isGenerating}
            variant="secondary"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Generate Style Previews"
            onPress={handleGenerateStyles}
            disabled={isGenerating}
            variant="secondary"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Generate All Previews"
            onPress={handleGenerateAll}
            disabled={isGenerating}
          />
        </View>

        {logs.length > 0 && (
          <View style={styles.logContainer}>
            <Text style={styles.logTitle}>Generation Log</Text>
            {logs.map((log, index) => (
              <View key={index} style={styles.logEntry}>
                <Text
                  style={[
                    styles.logText,
                    log.type === 'success' && styles.logSuccess,
                    log.type === 'error' && styles.logError,
                  ]}
                >
                  {log.type === 'success' && '✓ '}
                  {log.type === 'error' && '✗ '}
                  {log.message}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  infoBox: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryDark,
    lineHeight: 20,
  },
  buttonGroup: {
    marginBottom: SPACING.xl,
  },
  buttonSpacer: {
    height: SPACING.md,
  },
  logContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  logEntry: {
    paddingVertical: SPACING.xs,
  },
  logText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  logSuccess: {
    color: COLORS.success,
  },
  logError: {
    color: COLORS.error,
  },
});
