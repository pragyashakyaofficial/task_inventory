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
} from 'react-native-reanimated';
import { Sparkles, X, Clock, Package, CheckCircle2 } from 'lucide-react-native';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import { colors } from '../../../theme/constants';

interface ReorderPredictionModalProps {
  isVisible: boolean;
  onClose: () => void;
  prediction: {
    suggestedQuantity: number;
    when: string;
    reason: string;
  } | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReorderPredictionModal: React.FC<ReorderPredictionModalProps> = ({
  isVisible,
  onClose,
  prediction,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
    }
  }, [isVisible]);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!prediction) return null;

  const isUrgent = prediction.when.toLowerCase().includes('immediately') ||
                   prediction.when.toLowerCase().includes('critically');

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={styles.flex1} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.content, animatedContentStyle]}>
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: isUrgent ? '#EF444420' : colors.primary + '20' }]}>
                <Sparkles size={24} color={isUrgent ? '#EF4444' : colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>AI Reorder Prediction</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Smart Restock Analysis</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.body}>
              <View style={styles.quantityBox}>
                <Package size={32} color={colors.primary} />
                <Text style={[styles.quantityValue, { color: colors.primary }]}>
                  {prediction.suggestedQuantity}
                </Text>
                <Text style={[styles.quantityLabel, { color: colors.textSecondary }]}>
                  units suggested
                </Text>
              </View>

              <View style={[styles.timingBox, { backgroundColor: isUrgent ? '#EF444408' : colors.primary + '08' }]}>
                <View style={styles.timingHeader}>
                  <Clock size={16} color={isUrgent ? '#EF4444' : colors.primary} />
                  <Text style={[styles.timingTitle, { color: isUrgent ? '#EF4444' : colors.primary }]}>
                    Recommended Timing
                  </Text>
                </View>
                <Text style={[styles.timingText, { color: colors.text }]}>
                  {prediction.when}
                </Text>
              </View>

              <View style={[styles.reasonBox, { backgroundColor: colors.primary + '08' }]}>
                <View style={styles.reasonHeader}>
                  <CheckCircle2 size={16} color={colors.primary} />
                  <Text style={[styles.reasonTitle, { color: colors.primary }]}>AI Reasoning</Text>
                </View>
                <Text style={[styles.reasonText, { color: colors.text }]}>
                  {prediction.reason}
                </Text>
              </View>
            </View>

            <Button
              title="Got it"
              onPress={onClose}
              style={styles.gotItButton}
            />
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
    gap: 16,
  },
  quantityBox: {
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityValue: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 8,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  timingBox: {
    padding: 16,
    borderRadius: 12,
  },
  timingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  timingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  reasonBox: {
    padding: 16,
    borderRadius: 12,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  gotItButton: {
    width: '100%',
  },
});

export default ReorderPredictionModal;
