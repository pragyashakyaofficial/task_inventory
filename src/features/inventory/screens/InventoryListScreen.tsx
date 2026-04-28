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
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Plus, PackageX, ClipboardList, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useInventory } from '../hooks/useInventory';
import { useLazyGetReorderPlanQuery, ReorderSuggestion, InventoryItem } from '../../../api/slices/inventoryApi';
import { colors, spacingSemantic } from '../../../theme/constants';
import { StockStatus } from '../types/inventory.types';
import StatusBadge from '../../../components/common/StatusBadge';
import GlassCard from '../../../components/common/GlassCard';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';

const FILTER_OPTIONS: { label: string; value: StockStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
];

const InventoryListScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | 'all'>('all');
  const [isReorderModalVisible, setIsReorderModalVisible] = useState(false);

  const [triggerReorderPlan, { data: reorderData, isFetching: isReordering, error: reorderError }] = useLazyGetReorderPlanQuery();

  const handleGetReorderPlan = async () => {
    setIsReorderModalVisible(true);
    await triggerReorderPlan();
  };

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
    return items.filter((item: InventoryItem) => item.status === selectedStatus);
  }, [items, selectedStatus]);

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

  const handleStatusFilter = (status: StockStatus | 'all') => {
    setSelectedStatus(status);
  };

  const renderItem = useCallback(({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ItemDetail', { item: item })}
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
          <StatusBadge status={item.status} size="small" />
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.itemStat}>
            <PackageX size={14} color={colors.textTertiary} />
            <Text style={[styles.itemStatText, { color: colors.textSecondary }]}>
              {item.quantity} units
            </Text>
          </View>
          <View style={styles.itemStat}>
            <Text style={[styles.itemPrice, { color: colors.primary }]}>
              ${item.price.toFixed(2)}
            </Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  ), [navigation]);

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
        <TouchableOpacity
          style={[styles.reorderButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
          onPress={handleGetReorderPlan}
          disabled={isReordering}
        >
          <ClipboardList size={20} color={colors.primary} />
          <Text style={[styles.reorderButtonText, { color: colors.primary }]}>
            Plan Reorder
          </Text>
        </TouchableOpacity>
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
      <FlashList<InventoryItem>
        // ... existing props
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        estimatedItemSize={100}
        {...({ refreshControl: (
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        )} as any)}
      />

      {isReorderModalVisible && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, padding: 20, justifyContent: 'center' }]}>
          <GlassCard style={{ maxHeight: '80%', padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Reorder Plan</Text>
              <TouchableOpacity onPress={() => setIsReorderModalVisible(false)}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
            </View>

            {isReordering ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <RefreshCw size={32} color={colors.primary} style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.textSecondary }}>Analyzing inventory...</Text>
              </View>
            ) : reorderError ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <AlertCircle size={32} color={colors.error} style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.error, textAlign: 'center' }}>Failed to fetch reorder plan</Text>
              </View>
            ) : reorderData?.suggestions.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <PackageX size={32} color={colors.success} style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>All items are well stocked!</Text>
              </View>
            ) : (
              <ScrollView style={{ flexGrow: 0 }}>
                {reorderData?.suggestions.map((suggestion: ReorderSuggestion) => (
                  <View key={suggestion.itemId} style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: colors.backgroundSecondary }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontWeight: 'bold', color: colors.text }}>{suggestion.name}</Text>
                      <Text style={{ color: colors.primary, fontWeight: '700' }}>+{suggestion.suggestedQuantity}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{suggestion.reason}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </GlassCard>
        </View>
      )}

      <TouchableOpacity
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
      </TouchableOpacity>
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
  },
  header: {
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
});

export default InventoryListScreen;
