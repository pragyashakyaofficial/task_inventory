import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Sparkles, X, Package, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import { colors } from '../../../theme/constants';
import { ReorderSuggestion } from '../../../api/slices/inventoryApi';
import { mapBackendStatus } from '../types/inventory.types';

interface ReorderPredictionModalProps {
  isVisible: boolean;
  onClose: () => void;
  suggestions: ReorderSuggestion[];
  isLoading: boolean;
  error: string | null;
  message?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReorderPredictionModal: React.FC<ReorderPredictionModalProps> = ({
  isVisible,
  onClose,
  suggestions,
  isLoading,
  error,
  message,
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

  const hasUrgent = suggestions.some(s => s.status === 'OUT' || mapBackendStatus(s.status) === 'out-of-stock');

  const renderSuggestionItem = (item: ReorderSuggestion) => {
    const mappedStatus = mapBackendStatus(item.status);
    const isOut = mappedStatus === 'out-of-stock';
    const urgencyColor = isOut ? '#EF4444' : '#F59E0B';

    return (
      <View key={item.itemId} style={[styles.suggestionItem, { backgroundColor: urgencyColor + '08' }]}>
        <View style={styles.suggestionHeader}>
          <View style={[styles.suggestionIcon, { backgroundColor: urgencyColor + '20' }]}>
            {isOut ? (
              <AlertTriangle size={16} color={urgencyColor} />
            ) : (
              <Package size={16} color={urgencyColor} />
            )}
          </View>
          <View style={styles.suggestionInfo}>
            <Text style={[styles.suggestionName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.suggestionCategory, { color: colors.textSecondary }]}>{item.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: urgencyColor + '20' }]}>
            <Text style={[styles.statusText, { color: urgencyColor }]}>
              {isOut ? 'OUT OF STOCK' : 'LOW STOCK'}
            </Text>
          </View>
        </View>

        <View style={styles.suggestionDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Current:</Text>
            <Text style={[styles.detailValue, { color: urgencyColor }]}>{item.currentQuantity} {item.unit}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Suggest:</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>{item.suggestedQuantity} {item.unit}</Text>
          </View>
        </View>

        <Text style={[styles.suggestionReason, { color: colors.textSecondary }]}>
          {item.reason}
        </Text>
      </View>
    );
  };

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={styles.flex1} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.content, animatedContentStyle]}>
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: hasUrgent ? '#EF444420' : colors.primary + '20' }]}>
                <Sparkles size={24} color={hasUrgent ? '#EF4444' : colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>Reorder Plan</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI-Powered Analysis</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.body}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Analyzing inventory...</Text>
                </View>
              ) : error ? (
                <View style={[styles.errorBox, { backgroundColor: '#EF444408' }]}>
                  <AlertTriangle size={20} color="#EF4444" />
                  <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
                </View>
              ) : suggestions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <CheckCircle2 size={32} color="#10B981" />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>All Stocked Up!</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    No items need reordering right now.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                    {message || `Found ${suggestions.length} items that need reordering`}
                  </Text>
                  <ScrollView style={styles.suggestionsList}>
                    {suggestions.map(renderSuggestionItem)}
                  </ScrollView>
                </>
              )}
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
    width: SCREEN_WIDTH * 0.92,
    maxWidth: 440,
  },
  card: {
    padding: 20,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  suggestionsList: {
    maxHeight: 320,
  },
  suggestionItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '700',
  },
  suggestionCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  suggestionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionReason: {
    fontSize: 12,
    lineHeight: 16,
  },
  gotItButton: {
    width: '100%',
  },
});

export default ReorderPredictionModal;
