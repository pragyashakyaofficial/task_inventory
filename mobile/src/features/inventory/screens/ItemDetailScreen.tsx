import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
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
  BarChart2,
  History,
  RefreshCw,
  ChevronLeft,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { colors, spacingSemantic } from '../../../theme/constants';
import Button from '../../../components/common/Button';
import GlassCard from '../../../components/common/GlassCard';
import { InventoryItem } from '../types/inventory.types';
import { useInventory, useInventoryItem } from '../hooks/useInventory';
import { usePredictReorderMutation, useCreateOrderMutation } from '../../../api/slices/inventoryApi';
import ReorderPredictionModal from '../components/ReorderPredictionModal';
import OrderModal from '../components/OrderModal';
import Toast, { ToastManager, ToastItem } from '../../../components/common/Toast';

type ItemDetailParams = { item?: InventoryItem; itemId?: string };

const ItemDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ ItemDetail: ItemDetailParams }, 'ItemDetail'>>();
  const { item: initialItem, itemId } = route.params || {};

  const { deleteItemDirect, isDeleteItemLoading } = useInventory();
  const [predictReorder, { isLoading: isPredicting }] = usePredictReorderMutation();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const {
    item: updatedItem,
    isLoading: isItemLoading,
    refreshItem
  } = useInventoryItem(itemId || initialItem?.id || '');

  const [predictionModalVisible, setPredictionModalVisible] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [predictionSuggestions, setPredictionSuggestions] = useState<any[]>([]);
  const [predictionMessage, setPredictionMessage] = useState<string | undefined>();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [orderSuggestedQty, setOrderSuggestedQty] = useState<number | undefined>();
  const [orderAiReason, setOrderAiReason] = useState<string | undefined>();

  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setToasts);
    return () => unsubscribe();
  }, []);

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
    if (!item?.id) return;
    try {
      await deleteItemDirect(item.id).unwrap();
      setDeleteModalVisible(false);
      ToastManager.getInstance().success(
        `${item.name} has been deleted successfully.`,
        { position: 'bottom' }
      );
      navigation.goBack();
    } catch {
      setDeleteModalVisible(false);
      ToastManager.getInstance().error(
        'Failed to delete item. Please try again.',
        { position: 'bottom' }
      );
    }
  };

  const handleAIReorder = async () => {
    if (!item?.id) return;
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

  const handlePredictionOrderNow = (suggestion: any) => {
    setPredictionModalVisible(false);
    setOrderSuggestedQty(suggestion.suggestedQuantity);
    setOrderAiReason(suggestion.reason);
    setOrderModalVisible(true);
  };

  const handleSubmitOrder = async (itemId: string, quantity: number, unit: string) => {
    try {
      await createOrder({ itemId, quantityOrdered: quantity, unit }).unwrap();
      setOrderModalVisible(false);
      ToastManager.getInstance().success('Order placed successfully!', { position: 'bottom' });
    } catch (error: any) {
      ToastManager.getInstance().error(error?.data?.message || 'Failed to place order.', { position: 'bottom' });
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.titleSection}>
            <Text style={[styles.category, { color: colors.primary }]}> SKU: {item.sku} {item.category}</Text>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('AddEditItem', { item })} style={styles.headerIcon}>
              <Pencil size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteModalVisible(true)} style={styles.headerIcon}>
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable style={styles.deleteOverlay} onPress={() => setDeleteModalVisible(false)}>
          <Pressable style={[styles.deleteModal, { backgroundColor: colors.backgroundSecondary }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteModalIconContainer}>
              <Trash2 size={32} color="#EF4444" />
            </View>
            <Text style={[styles.deleteModalTitle, { color: colors.text }]}>Delete Item?</Text>
            <Text style={[styles.deleteModalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to delete "{item?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton, { borderColor: colors.borderLight }]}
                onPress={() => setDeleteModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.deleteModalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.confirmDeleteButton]}
                onPress={handleDelete}
                activeOpacity={0.7}
                disabled={isDeleteItemLoading}
              >
                {isDeleteItemLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ReorderPredictionModal
        isVisible={predictionModalVisible}
        onClose={handleCloseModal}
        suggestions={predictionSuggestions}
        isLoading={isPredicting}
        error={predictionError}
        message={predictionMessage}
        onOrderNow={handlePredictionOrderNow}
      />

      <OrderModal
        isVisible={orderModalVisible}
        onClose={() => setOrderModalVisible(false)}
        item={item}
        suggestedQuantity={orderSuggestedQty}
        aiReason={orderAiReason}
        onSubmit={handleSubmitOrder}
        isLoading={isCreatingOrder}
      />

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onHide={() => ToastManager.getInstance().removeToast(toast.id)}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          position={toast.position}
        />
      ))}
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
  headerActions: {
    flexDirection: 'row',
    gap: spacingSemantic.sm,
    alignItems: 'center',
  },
  headerIcon: {
    padding: spacingSemantic.sm,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    width: '80%',
    maxWidth: 400,
    borderRadius: spacingSemantic.borderRadius.xl,
    padding: spacingSemantic.xl,
    alignItems: 'center',
  },
  deleteModalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacingSemantic.md,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacingSemantic.sm,
  },
  deleteModalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacingSemantic.lg,
    lineHeight: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: spacingSemantic.md,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    height: 44,
    borderRadius: spacingSemantic.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  deleteModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    backgroundColor: '#EF4444',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ItemDetailScreen;
