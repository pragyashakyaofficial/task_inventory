import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  useGetItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} from '../../../api/slices/inventoryApi';
import {
  InventoryItem,
  CreateItemRequest,
  UpdateItemRequest,
  DeleteItemRequest,
  GetItemsParams,
  AISuggestion,
} from '../types/inventory.types';

export const useInventory = (initialParams?: GetItemsParams) => {
  const [params, setParams] = useState<GetItemsParams>(initialParams || {});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Get items with auto-refresh
  const {
    data: itemsData,
    error: getItemsError,
    isLoading: isGetItemsLoading,
    refetch: refetchItems,
  } = useGetItemsQuery(params);

  // Create item mutation
  const [
    createItem,
    {
      data: createItemData,
      error: createItemError,
      isLoading: isCreateItemLoading,
      isSuccess: isCreateItemSuccess,
    },
  ] = useCreateItemMutation();

  // Update item mutation
  const [
    updateItem,
    {
      data: updateItemData,
      error: updateItemError,
      isLoading: isUpdateItemLoading,
      isSuccess: isUpdateItemSuccess,
    },
  ] = useUpdateItemMutation();

  // Delete item mutation
  const [
    deleteItem,
    {
      data: deleteItemData,
      error: deleteItemError,
      isLoading: isDeleteItemLoading,
      isSuccess: isDeleteItemSuccess,
    },
  ] = useDeleteItemMutation();

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchItems();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetchItems]);

  // Update params with auto-refetch
  const updateParams = useCallback((newParams: Partial<GetItemsParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Create item with error handling
  const handleCreateItem = useCallback(
    async (itemData: CreateItemRequest) => {
      try {
        const result = await createItem(itemData).unwrap();
        return result;
      } catch (error: any) {
        const errorMessage = error.data?.message || 'Failed to create item';
        Alert.alert('Error', errorMessage);
        throw error;
      }
    },
    [createItem]
  );

  // Update item with optimistic update
  const handleUpdateItem = useCallback(
    async (itemData: UpdateItemRequest) => {
      try {
        const result = await updateItem(itemData).unwrap();
        return result;
      } catch (error: any) {
        const errorMessage = error.data?.message || 'Failed to update item';
        Alert.alert('Error', errorMessage);
        throw error;
      }
    },
    [updateItem]
  );

  // Delete item with confirmation
  const handleDeleteItem = useCallback(
    async (itemData: DeleteItemRequest) => {
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Confirm Delete',
          'Are you sure you want to delete this item? This action cannot be undone.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteItem(itemData).unwrap();
                  resolve(true);
                } catch (error: any) {
                  const errorMessage = error.data?.message || 'Failed to delete item';
                  Alert.alert('Error', errorMessage);
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    },
    [deleteItem]
  );

  // Quick update quantity
  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      return handleUpdateItem({ id, quantity });
    },
    [handleUpdateItem]
  );

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Set refresh interval
  const setRefreshIntervalTime = useCallback((interval: number) => {
    setRefreshInterval(interval);
  }, []);

  return {
    // Data
    items: itemsData?.items || [],
    pagination: itemsData?.pagination,
    filters: itemsData?.filters,
    sort: itemsData?.sort,

    // Loading states
    isLoading: isGetItemsLoading,
    isCreateItemLoading,
    isUpdateItemLoading,
    isDeleteItemLoading,

    // Error states
    getItemsError,
    createItemError,
    updateItemError,
    deleteItemError,

    // Success states
    isCreateItemSuccess,
    isUpdateItemSuccess,
    isDeleteItemSuccess,

    // Actions
    createItem: handleCreateItem,
    updateItem: handleUpdateItem,
    deleteItem: handleDeleteItem,
    updateQuantity,
    refetchItems,
    updateParams,

    // Auto-refresh
    autoRefresh,
    toggleAutoRefresh,
    setRefreshInterval: setRefreshIntervalTime,
    refreshInterval,

    // Response data
    createItemData,
    updateItemData,
    deleteItemData,
  };
};

// Hook for AI suggestions
export const useAISuggestion = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async (items: InventoryItem[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate AI API call
      await new Promise<void>(resolve => setTimeout(resolve, 1500));

      const newSuggestions: AISuggestion[] = [];

      // Low stock suggestions
      const lowStockItems = items.filter(item => item.status === 'low-stock');
      if (lowStockItems.length > 0) {
        newSuggestions.push({
          id: 'low-stock-alert',
          type: 'restock',
          title: 'Low Stock Alert',
          description: `${lowStockItems.length} items need restocking soon`,
          impact: 'high',
          confidence: 0.9,
          data: { items: lowStockItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })) },
          createdAt: new Date().toISOString(),
        });
      }

      // Pricing optimization
      const highCostItems = items.filter(item => item.cost > item.price * 0.8);
      if (highCostItems.length > 0) {
        newSuggestions.push({
          id: 'pricing-optimization',
          type: 'pricing',
          title: 'Pricing Optimization',
          description: `Consider adjusting prices for ${highCostItems.length} items with high cost ratio`,
          impact: 'medium',
          confidence: 0.75,
          data: { items: highCostItems.map(item => ({ id: item.id, name: item.name, cost: item.cost, price: item.price })) },
          createdAt: new Date().toISOString(),
        });
      }

      // Category optimization
      const categories = [...new Set(items.map(item => item.category))];
      const categoriesWithFewItems = categories.filter(category => 
        items.filter(item => item.category === category).length < 3
      );
      
      if (categoriesWithFewItems.length > 0) {
        newSuggestions.push({
          id: 'category-optimization',
          type: 'category',
          title: 'Category Optimization',
          description: `Some categories have few items, consider consolidation or expansion`,
          impact: 'low',
          confidence: 0.6,
          data: { categories: categoriesWithFewItems },
          createdAt: new Date().toISOString(),
        });
      }

      setSuggestions(newSuggestions);
    } catch (err) {
      setError('Failed to generate AI suggestions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    generateSuggestions,
    clearSuggestions,
  };
};

// Hook for single item operations
export const useInventoryItem = (itemId: string) => {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    updateItem,
    deleteItem,
    isUpdateItemLoading,
    isDeleteItemLoading,
  } = useInventory();

  const refreshItem = useCallback(async () => {
    if (!itemId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // This would typically be a specific API call to get one item
      // For now, we'll use the existing hook and filter
      const result = await updateItem({ id: itemId });
      setItem(result.item);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch item');
    } finally {
      setIsLoading(false);
    }
  }, [itemId, updateItem]);

  return {
    item,
    isLoading: isLoading || isUpdateItemLoading || isDeleteItemLoading,
    error,
    refreshItem,
    updateItem,
    deleteItem,
  };
};
