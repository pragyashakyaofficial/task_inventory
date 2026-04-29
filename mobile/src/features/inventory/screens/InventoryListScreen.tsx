import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Plus, PackageX } from 'lucide-react-native';
// import { ClipboardList } from 'lucide-react-native'; // Used by commented-out Plan Reorder button
import { useInventory } from '../hooks/useInventory';
import { /* useLazyGetReorderPlanQuery, */ useCreateStockRequestMutation } from '../../../api/slices/inventoryApi';
import { InventoryItem } from '../../../api/slices/inventoryApi';
import { colors, spacingSemantic } from '../../../theme/constants';
import StatusBadge from '../../../components/common/StatusBadge';
import GlassCard from '../../../components/common/GlassCard';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import ReorderPredictionModal from '../components/ReorderPredictionModal';

const FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'OK' },
  { label: 'Low Stock', value: 'LOW' },
  { label: 'Out of Stock', value: 'OUT' },
];

const InventoryListScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [reorderModalVisible, setReorderModalVisible] = useState(false);
  const [orderedItemIds, setOrderedItemIds] = useState<Set<string>>(new Set());
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<InventoryItem | null>(null);
  const [createStockRequest, { isLoading: isCreatingStockRequest }] = useCreateStockRequestMutation();

  // Lazy query for reorder plan - only fetches when button is tapped
  // Commented out along with Plan Reorder button
  // const [getReorderPlan, {
  //   data: reorderData,
  //   isLoading: isReordering,
  //   error: reorderError
  // }] = useLazyGetReorderPlanQuery();
  const reorderData = undefined as any;
  const isReordering = false;
  const reorderError = undefined as any;

  const {
    items,
    isLoading,
    refetchItems,
    updateParams,
  } = useInventory({
    search: searchQuery,
    // Status is handled client-side for filtering to ensure immediate feedback
  });

  // Log API data
  useEffect(() => {
    console.log('Inventory List Data Updated:', {
      count: items.length,
      isLoading,
      firstItem: items[0] ? { name: items[0].name, status: items[0].status } : 'none'
    });
  }, [items, isLoading]);

  const filteredItems = useMemo(() => {
    if (selectedStatus === 'all') return items;
    return items.filter((item: InventoryItem) => {
      const itemStatus = String(item.status).toUpperCase();
      return itemStatus === selectedStatus;
    });
  }, [items, selectedStatus]);

  // Handle reorder plan button tap - triggers lazy loading
  // Commented out along with Plan Reorder button
  // const handleGetReorderPlan = useCallback(async () => {
  //   try {
  //     await getReorderPlan();
  //     setReorderModalVisible(true);
  //   } catch (error) {
  //     console.error('Failed to get reorder plan:', error);
  //   }
  // }, [getReorderPlan]);

  const handleCloseReorderModal = useCallback(() => {
    setReorderModalVisible(false);
  }, []);

  const handleSuggestedOrderPress = useCallback((item: InventoryItem) => {
    setSelectedOrderItem(item);
    setOrderModalVisible(true);
  }, []);

  const handleConfirmOrder = useCallback(async () => {
    if (!selectedOrderItem) return;
    try {
      await createStockRequest({
        inventoryId: selectedOrderItem.id,
        requestedQuantity: selectedOrderItem.suggestedOrder || 0,
        notes: `Auto-suggested reorder for ${selectedOrderItem.name}`,
      }).unwrap();
      setOrderedItemIds(prev => new Set(prev).add(selectedOrderItem.id));
      setOrderModalVisible(false);
      setSelectedOrderItem(null);
      Alert.alert('Order Placed', `Successfully placed order for ${selectedOrderItem.name}`);
    } catch (error: any) {
      Alert.alert('Order Failed', error.data?.message || 'Failed to place order. Please try again.');
    }
  }, [selectedOrderItem, createStockRequest]);

  const onRefresh = React.useCallback(() => {
    refetchItems();
  }, [refetchItems]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateParams({ search: searchQuery });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, updateParams]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
  };

  const renderItem = useCallback(({ item }: { item: InventoryItem }) => {
    const isLowOrOut = item.status === 'low-stock' || item.status === 'out-of-stock';
    const isOrdered = orderedItemIds.has(item.id);

    return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      activeOpacity={0.7}
      style={styles.itemWrapper}
    >
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
              {item.category}
            </Text>
          </View>
          <StatusBadge status={String(item.status).toUpperCase()} size="small" />
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.itemStat}>
            <PackageX size={14} color={colors.textTertiary} />
            <Text style={[styles.itemStatText, { color: colors.textSecondary }]}>
              {item.quantity} units
            </Text>
          </View>
          <View style={styles.itemStat}>
            <Text style={[styles.itemStatText, { color: colors.primary, textTransform: 'capitalize' }]}>
              {item.unit}
            </Text>
          </View>
        </View>

        {isLowOrOut && item.suggestedOrder !== undefined && item.suggestedOrder > 0 && (
          <TouchableOpacity
            style={[styles.suggestedOrderBadge, { backgroundColor: isOrdered ? colors.success + '10' : colors.primary + '10' }]}
            onPress={() => !isOrdered && handleSuggestedOrderPress(item)}
            disabled={isOrdered}
            activeOpacity={0.7}
          >
            <Text style={[styles.suggestedOrderText, { color: isOrdered ? colors.success : colors.primary }]}>
              {isOrdered ? 'Ordered' : `Suggested Order: ${item.suggestedOrder} ${item.unit}`}
            </Text>
          </TouchableOpacity>
        )}
      </GlassCard>
    </TouchableOpacity>
  )}, [navigation, orderedItemIds, handleSuggestedOrderPress]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <PackageX size={64} {...({ color: colors.textTertiary } as any)} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No items found
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Inventory</Text>
        {/* Plan Reorder button - commented out as per requirement
        <TouchableOpacity
          style={[styles.reorderButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
          onPress={handleGetReorderPlan}
          disabled={isReordering}
        >
          <ClipboardList size={20} color={colors.primary} />
          <Text style={[styles.reorderButtonText, { color: colors.primary }]}>
            {isReordering ? 'Analyzing...' : 'Plan Reorder'}
          </Text>
        </TouchableOpacity>
        */}
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Search items..."
          placeholderTextColor={colors.textTertiary}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterScrollView}
      >
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleStatusFilter(option.value)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  selectedStatus === option.value
                    ? colors.primary
                    : colors.backgroundSecondary,
                borderWidth: 1,
                borderColor: selectedStatus === option.value ? colors.primary : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    selectedStatus === option.value
                      ? 'white'
                      : colors.textSecondary,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (isLoading && items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <LoadingSkeleton height={48} borderRadius={12} style={{ marginBottom: 12 }} />
          <View style={{ flexDirection: 'row' }}>
            {[1, 2, 3, 4].map((i) => (
              <LoadingSkeleton key={i} width={80} height={32} borderRadius={20} style={{ marginRight: 8 }} />
            ))}
          </View>
        </View>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.backgroundSecondary + '40' }]}>
              <View style={styles.skeletonContent}>
                <LoadingSkeleton width={48} height={48} borderRadius={12} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <LoadingSkeleton width="70%" height={16} style={{ marginBottom: 8 }} />
                  <LoadingSkeleton width="40%" height={12} style={{ marginBottom: 8 }} />
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <LoadingSkeleton width={60} height={14} style={{ marginRight: 8 }} />
                    <LoadingSkeleton width={80} height={20} borderRadius={10} />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <LoadingSkeleton width={50} height={20} style={{ marginBottom: 8 }} />
                  <LoadingSkeleton width={20} height={20} borderRadius={10} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={{ flex: 1 }}>
        <FlashList
          {...({
            data: filteredItems,
            renderItem: renderItem,
            keyExtractor: (item: InventoryItem) => item.id,
            estimatedItemSize: 120,
            contentContainerStyle: styles.listContent,
            extraData: filteredItems,
            refreshControl: (
              <RefreshControl
                refreshing={isLoading}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            ),
            ListEmptyComponent: renderEmptyState,
            ListHeaderComponent: renderHeader,
            showsVerticalScrollIndicator: false,
          } as any)}
        />
      </View>

      {/* <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: insets.bottom + 20,
          },
        ]}
        onPress={() => navigation.navigate('AddEditItem')}
      >
        <Plus size={28} {...({ color: 'white' } as any)} />
      </TouchableOpacity> */}

      {/* Reorder Plan Modal - Lazy loaded results */}
      <ReorderPredictionModal
        isVisible={reorderModalVisible}
        onClose={handleCloseReorderModal}
        suggestions={reorderData?.suggestions ?? []}
        isLoading={isReordering}
        error={reorderError ? 'Failed to analyze inventory. Please try again.' : null}
        message={reorderData?.message}
      />

      {/* Order Confirmation Modal */}
      <Modal
        transparent
        visible={orderModalVisible}
        animationType="fade"
        onRequestClose={() => setOrderModalVisible(false)}
      >
        <View style={styles.orderModalOverlay}>
          <Pressable style={styles.orderModalFlex} onPress={() => setOrderModalVisible(false)} />
          <View style={[styles.orderModalContent, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.orderModalTitle, { color: colors.text }]}>Confirm Order</Text>
            <Text style={[styles.orderModalItemName, { color: colors.text }]}>
              {selectedOrderItem?.name}
            </Text>
            <Text style={[styles.orderModalQuantity, { color: colors.textSecondary }]}>
              Order Quantity: {selectedOrderItem?.suggestedOrder} {selectedOrderItem?.unit}
            </Text>
            <Text style={[styles.orderModalCurrentStock, { color: colors.textTertiary }]}>
              Current Stock: {selectedOrderItem?.quantity} {selectedOrderItem?.unit}
            </Text>
            <View style={styles.orderModalButtons}>
              <TouchableOpacity
                style={[styles.orderModalCancelBtn, { backgroundColor: colors.backgroundTertiary }]}
                onPress={() => setOrderModalVisible(false)}
              >
                <Text style={[styles.orderModalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.orderModalConfirmBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirmOrder}
                disabled={isCreatingStockRequest}
              >
                {isCreatingStockRequest ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.orderModalConfirmText}>Confirm Order</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    marginTop: spacingSemantic.sm,
    paddingHorizontal: spacingSemantic.screen,
    paddingTop: spacingSemantic.md,
    paddingBottom: spacingSemantic.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingSemantic.lg,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingSemantic.md,
    height: 52,
    borderRadius: spacingSemantic.borderRadius.lg,
    marginBottom: spacingSemantic.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchIcon: {
    marginRight: spacingSemantic.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  filterContainer: {
    paddingHorizontal: spacingSemantic.screen,
    paddingBottom: spacingSemantic.xs,
    gap: spacingSemantic.xs,
  },
  filterScrollView: {
    marginHorizontal: -spacingSemantic.screen,
  },
  filterChip: {
    paddingHorizontal: spacingSemantic.lg,
    paddingVertical: spacingSemantic.sm,
    borderRadius: spacingSemantic.borderRadius.full,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemWrapper: {
    paddingHorizontal: spacingSemantic.screen,
    marginBottom: spacingSemantic.md,
  },
  itemCard: {
    padding: spacingSemantic.md,
    borderRadius: spacingSemantic.borderRadius.lg,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingSemantic.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacingSemantic.md,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacingSemantic.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestedOrderBadge: {
    marginTop: spacingSemantic.sm,
    paddingHorizontal: spacingSemantic.sm,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  suggestedOrderText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemStatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacingSemantic.screen,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacingSemantic.md,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: spacingSemantic.sm,
    textAlign: 'center',
  },
  skeletonContainer: {
    padding: spacingSemantic.screen,
  },
  skeletonCard: {
    padding: spacingSemantic.sm * 1.5,
    borderRadius: spacingSemantic.borderRadius.lg,
    marginBottom: spacingSemantic.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skeletonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacingSemantic.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  orderModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  orderModalFlex: {
    ...StyleSheet.absoluteFill,
  },
  orderModalContent: {
    width: '85%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  orderModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  orderModalItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  orderModalQuantity: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderModalCurrentStock: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 20,
  },
  orderModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  orderModalCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  orderModalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderModalConfirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderModalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});

export default InventoryListScreen;
