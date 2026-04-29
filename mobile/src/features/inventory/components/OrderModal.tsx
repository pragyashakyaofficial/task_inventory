import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { X, Package, Sparkles } from 'lucide-react-native';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import { colors, spacingSemantic } from '../../../theme/constants';
import { InventoryItem } from '../../inventory/types/inventory.types';

interface OrderModalProps {
  isVisible: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  suggestedQuantity?: number;
  aiReason?: string;
  onSubmit: (itemId: string, quantity: number, unit: string) => Promise<void>;
  isLoading?: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({
  isVisible,
  onClose,
  item,
  suggestedQuantity,
  aiReason,
  onSubmit,
  isLoading = false,
}) => {
  const [quantity, setQuantity] = useState('');
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (isVisible && suggestedQuantity) {
      setQuantity(String(suggestedQuantity));
    } else if (isVisible) {
      setQuantity('');
    }
  }, [isVisible, suggestedQuantity]);

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

  const handleSubmit = async () => {
    const qty = parseFloat(quantity);
    if (!item || isNaN(qty) || qty <= 0) return;
    await onSubmit(item.id, qty, item.unit || 'pcs');
    setQuantity('');
  };

  if (!item) return null;

  const minOrder = item.minQuantity || 0;
  const maxOrder = item.maxQuantity || 0;

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={styles.flex1} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.content, animatedContentStyle]}>
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Package size={24} color={colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>Place Order</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Order stock for item</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Row 1: Item Name */}
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Item Name</Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>{item.name}</Text>
              </View>

              {/* Row 2: Category */}
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Category</Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>{item.category}</Text>
              </View>

              {/* Row 3: Unit | Min - Max Order */}
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Unit</Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>{item.unit || 'pcs'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Min / Max Order</Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>{minOrder} — {maxOrder} {item.unit || 'pcs'}</Text>
              </View>

              {/* Row 4: Quantity Input */}
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Quantity</Text>
                <TextInput
                  style={[styles.quantityInput, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.backgroundSecondary }]}
                  placeholder="Enter quantity"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              {/* Row 5: AI Suggested Quantity */}
              {suggestedQuantity !== undefined && suggestedQuantity > 0 && (
                <View style={[styles.aiRow, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
                  <View style={styles.aiRowHeader}>
                    <Sparkles size={16} color={colors.primary} />
                    <Text style={[styles.aiRowLabel, { color: colors.primary }]}>AI Suggested Quantity</Text>
                  </View>
                  <Text style={[styles.aiRowValue, { color: colors.primary }]}>{suggestedQuantity} {item.unit || 'pcs'}</Text>
                  {aiReason ? (
                    <Text style={[styles.aiRowReason, { color: colors.textSecondary }]}>{aiReason}</Text>
                  ) : null}
                </View>
              )}
            </ScrollView>

            {/* Row 6: Submit Order Button */}
            <Button
              title="Submit Order"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={!quantity || parseFloat(quantity) <= 0 || isNaN(parseFloat(quantity))}
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  flex1: {
    flex: 1,
  },
  content: {
    width: '92%',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  quantityInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: spacingSemantic.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 12,
  },
  aiRow: {
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  aiRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiRowLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiRowValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  aiRowReason: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  submitButton: {
    width: '100%',
    marginTop: 4,
  },
});

export default OrderModal;
