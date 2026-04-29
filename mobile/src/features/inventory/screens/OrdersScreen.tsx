import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Package,
  CheckCircle2,
  ShoppingCart,
  Sparkles,
  User,
  Calendar,
  FileText,
} from 'lucide-react-native';
import { colors, spacingSemantic } from '../../../theme/constants';
import GlassCard from '../../../components/common/GlassCard';
import { useInventory } from '../../inventory/hooks/useInventory';
import { InventoryItem } from '../../inventory/types/inventory.types';
import {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useReceiveOrderMutation,
  usePredictReorderMutation,
} from '../../../api/slices/inventoryApi';
import OrderModal from '../components/OrderModal';
import ReorderPredictionModal from '../components/ReorderPredictionModal';
import Toast, { ToastManager, ToastItem } from '../../../components/common/Toast';

type TabType = 'critical' | 'ordered' | 'received';

const OrdersScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('critical');

  // Inventory for critical items
  const { items, refetchItems, isLoading: isItemsLoading } = useInventory({});
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [receiveOrder, { isLoading: isReceiving }] = useReceiveOrderMutation();
  const [predictReorder, { isLoading: isPredicting }] = usePredictReorderMutation();

  // Orders
  const { data: pendingOrdersData, isLoading: isPendingLoading, refetch: refetchPending } = useGetOrdersQuery({ isReceived: false });
  const { data: receivedOrdersData, isLoading: isReceivedLoading, refetch: refetchReceived } = useGetOrdersQuery({ isReceived: true });

  const pendingOrders = pendingOrdersData?.orders || [];
  const receivedOrders = receivedOrdersData?.orders || [];

  // Toast
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setToasts);
    return () => unsubscribe();
  }, []);

  // Order modal
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [suggestedQty, setSuggestedQty] = useState<number | undefined>();
  const [aiReason, setAiReason] = useState<string | undefined>();

  // Receive modal
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [receiveOrderId, setReceiveOrderId] = useState<string>('');
  const [receiveRemarks, setReceiveRemarks] = useState('');

  // Reorder prediction modal
  const [predictionModalVisible, setPredictionModalVisible] = useState(false);
  const [predictionSuggestions, setPredictionSuggestions] = useState<any[]>([]);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Critical items = out-of-stock or low-stock
  const criticalItems = useMemo(() =>
    items.filter(i => i.status === 'out-of-stock' || i.status === 'low-stock'),
    [items]
  );

  const handleOpenOrderModal = (item: InventoryItem, suggested?: number, reason?: string) => {
    setSelectedItem(item);
    setSuggestedQty(suggested);
    setAiReason(reason);
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

  const handleAISuggestAll = async () => {
    if (criticalItems.length === 0) return;
    try {
      const suggestions = await Promise.all(
        criticalItems.map(async (item) => {
          try {
            const result = await predictReorder(item.id).unwrap();
            return {
              itemId: item.id,
              name: item.name,
              status: item.status,
              currentQuantity: item.quantity,
              suggestedQuantity: result.suggestedQuantity,
              unit: item.unit,
              reason: result.reason,
              category: item.category,
            };
          } catch {
            return {
              itemId: item.id,
              name: item.name,
              status: item.status,
              currentQuantity: item.quantity,
              suggestedQuantity: item.maxQuantity - item.quantity,
              unit: item.unit,
              reason: 'AI unavailable. Suggested based on stock levels.',
              category: item.category,
            };
          }
        })
      );
      setPredictionSuggestions(suggestions);
      setPredictionError(null);
      setPredictionModalVisible(true);
    } catch {
      setPredictionError('Failed to generate AI suggestions.');
      setPredictionModalVisible(true);
    }
  };

  const handlePredictionOrderNow = (suggestion: any) => {
    setPredictionModalVisible(false);
    const item = criticalItems.find(i => i.id === suggestion.itemId);
    if (item) {
      handleOpenOrderModal(item, suggestion.suggestedQuantity, suggestion.reason);
    }
  };

  const handleOpenReceiveModal = (orderId: string) => {
    setReceiveOrderId(orderId);
    setReceiveRemarks('');
    setReceiveModalVisible(true);
  };

  const handleConfirmReceive = async () => {
    try {
      await receiveOrder({ id: receiveOrderId, remarks: receiveRemarks }).unwrap();
      setReceiveModalVisible(false);
      ToastManager.getInstance().success('Order received and inventory updated!', { position: 'bottom' });
    } catch (error: any) {
      ToastManager.getInstance().error(error?.data?.message || 'Failed to mark as received.', { position: 'bottom' });
    }
  };

  const onRefresh = async () => {
    await Promise.all([refetchItems(), refetchPending(), refetchReceived()]);
  };

  const tabs: { key: TabType; label: string; icon: any; count: number }[] = [
    { key: 'critical', label: 'Critical', icon: AlertTriangle, count: criticalItems.length },
    { key: 'ordered', label: 'Ordered', icon: ShoppingCart, count: pendingOrders.length },
    { key: 'received', label: 'Received', icon: CheckCircle2, count: receivedOrders.length },
  ];

  const renderCriticalItem = ({ item }: { item: InventoryItem }) => {
    const isOut = item.status === 'out-of-stock';
    const urgencyColor = isOut ? '#EF4444' : '#F59E0B';

    return (
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemCardHeader}>
          <View style={[styles.statusDot, { backgroundColor: urgencyColor }]} />
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>{item.category}</Text>
          </View>
          <View style={[styles.stockBadge, { backgroundColor: urgencyColor + '20' }]}>
            <Text style={[styles.stockBadgeText, { color: urgencyColor }]}>
              {isOut ? 'OUT' : 'LOW'} · {item.quantity} {item.unit}
            </Text>
          </View>
        </View>
        <View style={styles.itemCardFooter}>
          <Text style={[styles.itemMin, { color: colors.textSecondary }]}>
            Min: {item.minQuantity} | Max: {item.maxQuantity}
          </Text>
          <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: colors.primary }]}
            onPress={() => handleOpenOrderModal(item)}
            activeOpacity={0.7}
          >
            <ShoppingCart size={14} color="#fff" />
            <Text style={styles.orderButtonText}>Order</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  const renderOrderedItem = ({ item: order }: { item: any }) => {
    const itemData = typeof order.itemId === 'object' ? order.itemId : null;

    return (
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemCardHeader}>
          <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {itemData?.name || 'Unknown Item'}
            </Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
              {itemData?.category || '—'}
            </Text>
          </View>
        </View>
        <View style={styles.orderDetails}>
          <View style={styles.orderDetailRow}>
            <Package size={14} color={colors.textSecondary} />
            <Text style={[styles.orderDetailText, { color: colors.text }]}>
              {order.quantityOrdered} {order.unit || itemData?.unit || 'pcs'}
            </Text>
          </View>
          <View style={styles.orderDetailRow}>
            <User size={14} color={colors.textSecondary} />
            <Text style={[styles.orderDetailText, { color: colors.text }]}>
              {typeof order.orderedBy === 'object' ? order.orderedBy.name : '—'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.receiveButton, { backgroundColor: '#10B981' }]}
          onPress={() => handleOpenReceiveModal(order._id)}
          activeOpacity={0.7}
        >
          <CheckCircle2 size={14} color="#fff" />
          <Text style={styles.receiveButtonText}>Received</Text>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  const renderReceivedItem = ({ item: order }: { item: any }) => {
    const itemData = typeof order.itemId === 'object' ? order.itemId : null;

    return (
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemCardHeader}>
          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {itemData?.name || 'Unknown Item'}
            </Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
              {itemData?.category || '—'}
            </Text>
          </View>
          <View style={[styles.stockBadge, { backgroundColor: '#10B98120' }]}>
            <Text style={[styles.stockBadgeText, { color: '#10B981' }]}>RECEIVED</Text>
          </View>
        </View>
        <View style={styles.orderDetails}>
          <View style={styles.orderDetailRow}>
            <Package size={14} color={colors.textSecondary} />
            <Text style={[styles.orderDetailText, { color: colors.text }]}>
              {order.quantityOrdered} {order.unit || itemData?.unit || 'pcs'}
            </Text>
          </View>
          <View style={styles.orderDetailRow}>
            <User size={14} color={colors.textSecondary} />
            <Text style={[styles.orderDetailText, { color: colors.text }]}>
              Ordered: {typeof order.orderedBy === 'object' ? order.orderedBy.name : '—'}
            </Text>
          </View>
          <View style={styles.orderDetailRow}>
            <User size={14} color={colors.textSecondary} />
            <Text style={[styles.orderDetailText, { color: colors.text }]}>
              Received: {typeof order.receivedBy === 'object' ? order.receivedBy.name : '—'}
            </Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.orderDetailText, { color: colors.text }]}>
              {new Date(order.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          {order.remarks ? (
            <View style={styles.orderDetailRow}>
              <FileText size={14} color={colors.textSecondary} />
              <Text style={[styles.orderDetailText, { color: colors.textSecondary }]}>
                {order.remarks}
              </Text>
            </View>
          ) : null}
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Orders</Text>
        {activeTab === 'critical' && criticalItems.length > 0 && (
          <TouchableOpacity
            style={[styles.aiButton, { backgroundColor: colors.primary + '20' }]}
            onPress={handleAISuggestAll}
            activeOpacity={0.7}
          >
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.aiButtonText, { color: colors.primary }]}>AI Suggest All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.backgroundSecondary }]}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && { backgroundColor: colors.primary + '20' }]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Icon size={16} color={isActive ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabLabel, { color: isActive ? colors.primary : colors.textSecondary }]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: isActive ? colors.primary : colors.textSecondary + '40' }]}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'critical' && (
          <FlatList
            data={criticalItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCriticalItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <CheckCircle2 size={48} color="#10B981" />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>All Stocked Up!</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  No critical items need ordering right now.
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={isItemsLoading} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          />
        )}

        {activeTab === 'ordered' && (
          <FlatList
            data={pendingOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderedItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ShoppingCart size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Pending Orders</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Place orders from the Critical tab.
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={isPendingLoading} onRefresh={refetchPending} tintColor={colors.primary} />
            }
          />
        )}

        {activeTab === 'received' && (
          <FlatList
            data={receivedOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderReceivedItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Package size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Received Orders</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Mark orders as received from the Ordered tab.
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={isReceivedLoading} onRefresh={refetchReceived} tintColor={colors.primary} />
            }
          />
        )}
      </View>

      {/* Order Modal */}
      <OrderModal
        isVisible={orderModalVisible}
        onClose={() => setOrderModalVisible(false)}
        item={selectedItem}
        suggestedQuantity={suggestedQty}
        aiReason={aiReason}
        onSubmit={handleSubmitOrder}
        isLoading={isCreatingOrder}
      />

      {/* Receive Confirmation Modal */}
      <Modal
        visible={receiveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReceiveModalVisible(false)}
      >
        <Pressable style={styles.receiveOverlay} onPress={() => setReceiveModalVisible(false)}>
          <Pressable style={[styles.receiveModal, { backgroundColor: colors.backgroundSecondary }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.receiveModalHeader}>
              <CheckCircle2 size={28} color="#10B981" />
              <Text style={[styles.receiveModalTitle, { color: colors.text }]}>Confirm Received</Text>
            </View>
            <Text style={[styles.receiveModalMessage, { color: colors.textSecondary }]}>
              Confirm that this order has been received. Inventory stock will be updated automatically.
            </Text>
            <TextInput
              style={[styles.remarksInput, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.background }]}
              placeholder="Add remarks (optional)"
              placeholderTextColor={colors.textTertiary}
              value={receiveRemarks}
              onChangeText={setReceiveRemarks}
              multiline
            />
            <View style={styles.receiveModalActions}>
              <TouchableOpacity
                style={[styles.receiveModalButton, styles.cancelButton, { borderColor: colors.borderLight }]}
                onPress={() => setReceiveModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.receiveModalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.receiveModalButton, { backgroundColor: '#10B981' }]}
                onPress={handleConfirmReceive}
                activeOpacity={0.7}
                disabled={isReceiving}
              >
                {isReceiving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmReceiveButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Reorder Prediction Modal */}
      <ReorderPredictionModal
        isVisible={predictionModalVisible}
        onClose={() => setPredictionModalVisible(false)}
        suggestions={predictionSuggestions}
        isLoading={isPredicting}
        error={predictionError}
        onOrderNow={handlePredictionOrderNow}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingSemantic.screen,
    paddingVertical: spacingSemantic.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacingSemantic.borderRadius.xl,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacingSemantic.screen,
    borderRadius: spacingSemantic.borderRadius.xl,
    padding: 4,
    marginBottom: spacingSemantic.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: spacingSemantic.borderRadius.lg,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacingSemantic.screen,
    paddingBottom: spacingSemantic.xl * 2,
  },
  itemCard: {
    padding: spacingSemantic.md,
    borderRadius: spacingSemantic.borderRadius.xl,
    marginBottom: spacingSemantic.sm,
  },
  itemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMin: {
    fontSize: 12,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacingSemantic.borderRadius.lg,
  },
  orderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  orderDetails: {
    gap: 4,
    marginBottom: 8,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderDetailText: {
    fontSize: 13,
    fontWeight: '500',
  },
  receiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: spacingSemantic.borderRadius.lg,
  },
  receiveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  // Receive modal styles
  receiveOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiveModal: {
    width: '80%',
    maxWidth: 400,
    borderRadius: spacingSemantic.borderRadius.xl,
    padding: spacingSemantic.xl,
  },
  receiveModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacingSemantic.md,
  },
  receiveModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  receiveModalMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacingSemantic.md,
  },
  remarksInput: {
    borderWidth: 1,
    borderRadius: spacingSemantic.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: spacingSemantic.lg,
  },
  receiveModalActions: {
    flexDirection: 'row',
    gap: spacingSemantic.md,
  },
  receiveModalButton: {
    flex: 1,
    height: 44,
    borderRadius: spacingSemantic.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  receiveModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmReceiveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default OrdersScreen;
