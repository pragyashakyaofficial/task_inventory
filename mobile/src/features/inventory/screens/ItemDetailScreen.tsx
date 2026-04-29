import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from 'react-native-reanimated';
import {
  Package,
  Layers,
  DollarSign,
  BarChart2,
  History,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react-native';
import { colors, spacingSemantic } from '../../../theme/constants';
import Button from '../../../components/common/Button';
import GlassCard from '../../../components/common/GlassCard';
import StatusBadge from '../../../components/common/StatusBadge';
import { InventoryItem } from '../types/inventory.types';
import { useInventory, useInventoryItem } from '../hooks/useInventory';
import { usePredictReorderMutation } from '../../../api/slices/inventoryApi';
import ReorderPredictionModal from '../components/ReorderPredictionModal';

type ItemDetailParams = { item?: InventoryItem; itemId?: string };

const ItemDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ ItemDetail: ItemDetailParams }, 'ItemDetail'>>();
  const { item: initialItem, itemId } = route.params || {};

  const { deleteItem, isDeleteItemLoading } = useInventory();
  const [predictReorder, { isLoading: isPredicting }] = usePredictReorderMutation();
  const {
    item: updatedItem,
    isLoading: isItemLoading,
    refreshItem
  } = useInventoryItem(itemId || initialItem?.id || '');

  const [predictionModalVisible, setPredictionModalVisible] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [predictionSuggestions, setPredictionSuggestions] = useState<any[]>([]);
  const [predictionMessage, setPredictionMessage] = useState<string | undefined>();

  const item = updatedItem || initialItem;

  useEffect(() => {
    if (itemId || initialItem?.id) {
      refreshItem();
    }
  }, [refreshItem, itemId, initialItem?.id]);

  if (isItemLoading && !item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <RefreshCw size={32} color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading item details...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Item not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const handleDelete = async () => {
    if (!item?.id) {
      Alert.alert('Error', 'Item ID is not available');
      return;
    }
    const success = await deleteItem({ id: item.id });
    if (success) {
      navigation.goBack();
    }
  };

  const handleAIReorder = async () => {
    if (!item?.id) {
      Alert.alert('Error', 'Item ID is not available');
      return;
    }
    try {
      const result = await predictReorder(item.id).unwrap();
      // Wrap single prediction result into suggestions array for the modal
      setPredictionSuggestions([{
        itemId: item.id,
        name: item.name,
        status: item.status,
        currentQuantity: item.quantity,
        suggestedQuantity: result.suggestedQuantity,
        unit: item.unit,
        reason: result.reason,
        category: item.category,
      }]);
      setPredictionMessage(undefined);
      setPredictionError(null);
      setPredictionModalVisible(true);
    } catch (error: any) {
      setPredictionError(error?.data?.message || 'AI failed to generate a prediction.');
      setPredictionSuggestions([]);
      setPredictionModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setPredictionModalVisible(false);
    setPredictionSuggestions([]);
    setPredictionError(null);
    setPredictionMessage(undefined);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isItemLoading}
            onRefresh={refreshItem}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.titleSection}>
            <Text style={[styles.category, { color: colors.primary }]}> SKU: {item.sku} {item.category}</Text>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            {/* <Text style={[styles.sku, { color: colors.textSecondary }]}>SKU: {item.sku}</Text> */}
          </View>
          <StatusBadge status={item.status} />
        </Animated.View>

        <View style={styles.statsRow}>
          <Animated.View entering={FadeInRight.delay(100)} layout={Layout.springify()} style={{ width: '45%', margin: '2%' }}>
            <GlassCard style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Package size={16} color={colors.primary} />
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                  In Stock
                </Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {item.quantity}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(300)} layout={Layout.springify()} style={{ width: '45%', margin: '2%' }}>
            <GlassCard style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Layers size={16} color={colors.primary} />
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                  Min Alert
                </Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {item.minQuantity}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Insights</Text>
          <GlassCard style={styles.aiInsightsCard}>
            <View style={styles.aiInsightRow}>
              <BarChart2 size={20} color={colors.primary} />
              <View style={styles.aiInsightText}>
                <Text style={[styles.insightTitle, { color: colors.text }]}>Demand Outlook</Text>
                <Text style={[styles.insightDesc, { color: colors.textSecondary }]}>
                  {item.suggestedOrder && item.suggestedOrder > 0 
                    ? `AI suggests reordering ${item.suggestedOrder} units based on current stock levels and demand trends.`
                    : "Stock levels are currently optimal based on historical demand patterns."}
                </Text>
              </View>
            </View>
            <Button
              title="Predict Reorder"
              variant="outline"
              onPress={handleAIReorder}
              loading={isPredicting}
              style={styles.reorderButton}
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <History size={16} color={colors.textSecondary} />
              <Text style={[styles.activityText, { color: colors.text }]}>
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.activityItem}>
              <RefreshCw size={16} color={colors.textSecondary} />
              <Text style={[styles.activityText, { color: colors.text }]}>
                Last Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomActions, { borderTopColor: colors.borderLight }]}>
        <Button
          title="Delete"
          variant="error"
          onPress={handleDelete}
          loading={isDeleteItemLoading}
          style={styles.actionButton}
        />
        <Button
          title="Edit Item"
          onPress={() => navigation.navigate('AddEditItem', { itemId: item.id })}
          style={StyleSheet.flatten([styles.actionButton, { flex: 2 }])}
        />
      </View>

      <ReorderPredictionModal
        isVisible={predictionModalVisible}
        onClose={handleCloseModal}
        suggestions={predictionSuggestions}
        isLoading={isPredicting}
        error={predictionError}
        message={predictionMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingSemantic.screen,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    marginTop:spacingSemantic.xl,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingSemantic.xl,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: spacingSemantic.sm,
    marginTop: 2,
  },
  titleSection: {
    flex: 1,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacingSemantic.xs,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacingSemantic.xs,
  },
  sku: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // paddingHorizontal: spacingSemantic.sm,
    justifyContent: 'space-between',
    marginBottom: spacingSemantic.xl,
  },
  statCard: {
    width: '100%',
    padding: spacingSemantic.md,
    borderRadius: spacingSemantic.borderRadius.xl,
    flexDirection: 'column',
    minHeight: 120,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacingSemantic.sm,
    width: '100%',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: spacingSemantic.borderRadius.sm * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: spacingSemantic.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacingSemantic.md,
  },
  aiInsightsCard: {
    padding: spacingSemantic.xl,
    borderRadius: 24,
  },
  aiInsightRow: {
    flexDirection: 'row',
    gap: spacingSemantic.md,
    marginBottom: spacingSemantic.xl,
  },
  aiInsightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacingSemantic.xs,
  },
  insightDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  reorderButton: {
    marginTop: spacingSemantic.sm,
  },
  activityList: {
    gap: spacingSemantic.sm * 1.5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingSemantic.sm * 1.5,
  },
  activityText: {
    fontSize: 14,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacingSemantic.screen,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacingSemantic.screen,
    gap: spacingSemantic.md,
    backgroundColor: 'rgba(26, 31, 46, 0.8)',
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
  },
});

export default ItemDetailScreen;
