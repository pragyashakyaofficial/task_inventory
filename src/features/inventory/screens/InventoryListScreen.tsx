import React, { useState, useCallback, useEffect } from 'react';
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
import { Search, Plus, PackageX } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useInventory } from '../hooks/useInventory';
import { spacingSemantic } from '../../../theme/spacing';
import InventoryCard from '../components/InventoryCard';
import { StockStatus, InventoryItem } from '../types/inventory.types';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';

const FILTER_OPTIONS: { label: string; value: StockStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
];

const InventoryListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | 'all'>('all');

  const {
    items,
    isLoading,
    refetchItems,
    updateParams,
  } = useInventory({
    search: searchQuery,
    status: selectedStatus === 'all' ? undefined : selectedStatus as any,
  });

  const handleRefresh = useCallback(() => {
    refetchItems();
  }, [refetchItems]);

  // Debounced search
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
    updateParams({ status: status === 'all' ? undefined : status as any });
  };

  const renderItem = useCallback(({ item }: { item: InventoryItem; index: number }) => (
    <InventoryCard
      item={item}
      onEdit={(i) => navigation.navigate('AddEditItem', { item: i })}
      onDelete={(i) => console.log('Delete', i.id)}
      onPress={(i) => navigation.navigate('ItemDetail', { item: i })}
    />
  ), [navigation]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <PackageX size={64} {...({ color: theme.colors.textTertiary } as any)} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No items found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
        <Search size={20} {...({ color: theme.colors.textSecondary } as any)} style={styles.searchIcon} />
        <TextInput
          placeholder="Search items..."
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.searchInput, { color: theme.colors.text }]}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
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
                    ? theme.colors.primary
                    : theme.colors.backgroundSecondary,
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
                      : theme.colors.textSecondary,
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
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
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
            <View key={i} style={[styles.skeletonCard, { backgroundColor: theme.colors.backgroundSecondary + '40' }]}>
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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <FlashList
        data={items as InventoryItem[]}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        estimatedItemSize={100}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
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
    paddingVertical: spacingSemantic.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingSemantic.md,
    height: 48,
    borderRadius: spacingSemantic.borderRadius.md,
    marginBottom: spacingSemantic.md,
  },
  searchIcon: {
    marginRight: spacingSemantic.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    paddingBottom: spacingSemantic.xs,
  },
  filterChip: {
    paddingHorizontal: spacingSemantic.md,
    paddingVertical: spacingSemantic.sm,
    borderRadius: spacingSemantic.borderRadius.full,
    marginRight: spacingSemantic.sm,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
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
