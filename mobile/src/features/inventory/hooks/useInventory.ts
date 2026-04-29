import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  useGetItemsQuery,
  useGetItemByIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useGetDashboardStatsQuery,
} from '../../../api/slices/inventoryApi';
import {
  CreateItemRequest,
  UpdateItemRequest,
  DeleteItemRequest,
  GetItemsParams,
} from '../types/inventory.types';

export const useInventory = (initialParams?: GetItemsParams) => {
  const [params, setParams] = useState<GetItemsParams>(initialParams || {});

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
                  await deleteItem(itemData.id).unwrap();
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

  return useMemo(() => ({
    // Data
    items: itemsData?.items || [],
    pagination: itemsData ? {
      total: itemsData.total,
    } : undefined,
    filters: undefined,
    sort: undefined,

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

    // Response data
    createItemData,
    updateItemData,
    deleteItemData,
  }), [
    itemsData,
    isGetItemsLoading,
    isCreateItemLoading,
    isUpdateItemLoading,
    isDeleteItemLoading,
    getItemsError,
    createItemError,
    updateItemError,
    deleteItemError,
    isCreateItemSuccess,
    isUpdateItemSuccess,
    isDeleteItemSuccess,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    updateQuantity,
    refetchItems,
    updateParams,
    createItemData,
    updateItemData,
    deleteItemData,
  ]);
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  const {
    data: stats,
    error,
    isLoading,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery();

  return {
    stats,
    error,
    isLoading,
    refetchStats,
  };
};

// Hook for single item operations
export const useInventoryItem = (itemId: string) => {
  const {
    data: item,
    error: fetchError,
    isLoading: isFetchLoading,
    refetch: refreshItem,
  } = useGetItemByIdQuery(itemId, {
    skip: !itemId,
  });

  const {
    updateItem,
    deleteItem,
    isUpdateItemLoading,
    isDeleteItemLoading,
  } = useInventory();

  const error = fetchError ? 'Failed to fetch item' : null;

  return {
    item: item || null,
    isLoading: isFetchLoading || isUpdateItemLoading || isDeleteItemLoading,
    error,
    refreshItem,
    updateItem,
    deleteItem,
  };
};
