import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Brain, Check, X, AlertCircle } from 'lucide-react-native';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import { useTheme } from '../../../theme/ThemeContext';

interface AISuggestionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (suggestion: number) => void;
  suggestion: {
    value: number;
    confidence: number;
    reasoning: string;
  } | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AISuggestionModal: React.FC<AISuggestionModalProps> = ({
  isVisible,
  onClose,
  onApply,
  suggestion,
}) => {
  const { theme } = useTheme();
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      progress.value = withTiming(suggestion?.confidence || 0, { duration: 1000 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
      progress.value = 0;
    }
  }, [isVisible, suggestion]);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: interpolate(
      progress.value,
      [0, 0.5, 0.8, 1],
      ['#EF4444', '#F59E0B', '#10B981', '#059669'] as any[]
    ) as unknown as string,
  }));

  if (!suggestion) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={styles.flex1} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.content, animatedContentStyle]}>
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Brain size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: theme.colors.text }]}>AI Optimization</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Smart Inventory Analysis</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.body}>
              <View style={styles.suggestionBox}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Suggested Quantity</Text>
                <Text style={[styles.suggestionValue, { color: theme.colors.primary }]}>{suggestion.value}</Text>
              </View>

              <View style={styles.confidenceSection}>
                <View style={styles.confidenceHeader}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Confidence Score</Text>
                  <Text style={[styles.confidenceValue, { color: theme.colors.primary }]}>
                    {Math.round(suggestion.confidence * 100)}%
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.colors.borderLight }]}>
                  <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
                </View>
              </View>

              <View style={[styles.reasoningBox, { backgroundColor: theme.colors.primary + '08' }]}>
                <View style={styles.reasoningHeader}>
                  <AlertCircle size={16} color={theme.colors.primary} />
                  <Text style={[styles.reasoningTitle, { color: theme.colors.primary }]}>AI Reasoning</Text>
                </View>
                <Text style={[styles.reasoningText, { color: theme.colors.text }]}>{suggestion.reasoning}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title="Reject"
                variant="outline"
                onPress={onClose}
                style={styles.footerButton}
              />
              <Button
                title="Apply"
                onPress={() => {
                  onApply(suggestion.value);
                  onClose();
                }}
                style={styles.footerButton}
              />
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  flex1: {
    flex: 1,
  },
  content: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
  },
  card: {
    padding: 24,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    marginBottom: 24,
  },
  suggestionBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  suggestionValue: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  confidenceSection: {
    marginBottom: 24,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  reasoningBox: {
    padding: 16,
    borderRadius: 12,
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasoningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  reasoningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});

export default AISuggestionModal;
