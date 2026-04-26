import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import GlassCard from '../../../components/common/GlassCard';
import StatusBadge from '../../../components/common/StatusBadge';
import { InventoryItem } from '../types/inventory.types';
import { useTheme } from '../../../theme/ThemeContext';
import { Package, Edit2, Trash2, ChevronRight, LucideProps } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.2;

interface InventoryCardProps {
  item: InventoryItem;
  onPress?: (item: InventoryItem) => void;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
}

const InventoryCard: React.FC<InventoryCardProps> = memo(({
  item,
  onPress,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + context.value.x;
      // Limit swipe to the left
      if (translateX.value > 0) translateX.value = 0;
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-140);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            translateX.value = withSpring(0);
            onEdit?.(item);
          }}
        >
          <Edit2 {...({ size: 20, color: 'white' } as LucideProps)} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => {
            translateX.value = withSpring(0);
            onDelete?.(item);
          }}
        >
          <Trash2 {...({ size: 20, color: 'white' } as LucideProps)} />
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyle}>
          <GlassCard
            style={styles.card}
            onPress={() => onPress?.(item)}
          >
            <View style={styles.content}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Package {...({ size: 24, color: theme.colors.primary } as LucideProps)} />
              </View>

              <View style={styles.mainInfo}>
                <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.sku, { color: theme.colors.textSecondary }]}>
                  SKU: {item.sku}
                </Text>
                <View style={styles.stockRow}>
                  <Text style={[styles.quantity, { color: theme.colors.text }]}>
                    {item.quantity} units
                  </Text>
                  <StatusBadge status={item.status} size="small" showPulse />
                </View>
              </View>

              <View style={styles.rightInfo}>
                <Text style={[styles.price, { color: theme.colors.primary }]}>
                  ${item.price.toFixed(2)}
                </Text>
                <ChevronRight {...({ size: 20, color: theme.colors.textTertiary } as LucideProps)} />
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

InventoryCard.displayName = 'InventoryCard';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    position: 'relative',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
  card: {
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sku: {
    fontSize: 12,
    marginBottom: 4,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  rightInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
});

export default InventoryCard;
