import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  Pressable,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Package, X, Plus, Minus, AlertTriangle } from 'lucide-react-native';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import { colors } from '../../../theme/constants';
import { InventoryItem } from '../../inventory/types/inventory.types';

interface StockRequestModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
  item: InventoryItem | null;
  isLoading?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const StockRequestModal: React.FC<StockRequestModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  item,
  isLoading,
}) => {
  const [quantity, setQuantity] = useState(1);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      setQuantity(item?.suggestedOrder || item?.maxQuantity || 10);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
    }
  }, [isVisible, item]);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleSubmit = () => {
    onSubmit(quantity);
  };

  if (!item) return null;

  const isCritical = item.status === 'out-of-stock';
  const urgencyColor = isCritical ? '#EF4444' : '#F59E0B';

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={styles.flex1} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.content, animatedContentStyle]}>
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: urgencyColor + '20' }]}>
                <Package size={24} color={urgencyColor} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>Request Stock</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{item.name}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Current</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{item.quantity}</Text>
                <Text style={[styles.infoUnit, { color: colors.textSecondary }]}>{item.unit}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Min Threshold</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{item.minQuantity}</Text>
                <Text style={[styles.infoUnit, { color: colors.textSecondary }]}>{item.unit}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Suggested</Text>
                <Text style={[styles.infoValue, { color: urgencyColor }]}>
                  {item.suggestedOrder || item.maxQuantity - item.quantity}
                </Text>
                <Text style={[styles.infoUnit, { color: colors.textSecondary }]}>{item.unit}</Text>
              </View>
            </View>

            {isCritical && (
              <View style={[styles.alertBox, { backgroundColor: '#EF444408' }]}>
                <AlertTriangle size={16} color="#EF4444" />
                <Text style={[styles.alertText, { color: '#EF4444' }]}>
                  This item is out of stock. Immediate reorder recommended.
                </Text>
              </View>
            )}

            <View style={styles.quantitySection}>
              <Text style={[styles.quantityLabel, { color: colors.textSecondary }]}>
                Request Quantity
              </Text>
              <View style={styles.quantityControls}>
                <Pressable
                  onPress={decrement}
                  style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                >
                  <Minus size={20} color={colors.text} />
                </Pressable>
                <TextInput
                  style={[styles.quantityInput, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                  value={quantity.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    if (!isNaN(num) && num > 0) {
                      setQuantity(num);
                    }
                  }}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <Pressable
                  onPress={increment}
                  style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                >
                  <Plus size={20} color={colors.text} />
                </Pressable>
              </View>
              <Text style={[styles.quantityUnit, { color: colors.textSecondary }]}>
                {item.unit}
              </Text>
            </View>

            <Button
              title={isLoading ? 'Submitting...' : 'Submit Request'}
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
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
    fontSize: 14,
    marginTop: 2,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBox: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  infoUnit: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  quantitySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    width: 80,
    height: 44,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '700',
  },
  quantityUnit: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  submitButton: {
    width: '100%',
  },
});

export default StockRequestModal;
