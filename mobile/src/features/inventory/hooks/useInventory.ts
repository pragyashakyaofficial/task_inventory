import { useState, useCallback, useMemo } from 'react';
import {
  useGetItemsQuery,
  useGetDashboardStatsQuery,
} from '../../../api/slices/inventoryApi';
import { GetItemsParams } from '../types/inventory.types';

export const useInventory = (initialParams?: GetItemsParams) => {
  const [params, setParams] = useState<GetItemsParams>(initialParams || {});

  const {
    data: itemsData,
    error: getItemsError,
    isLoading: isGetItemsLoading,
    refetch: refetchItems,
  } = useGetItemsQuery(params);

  // Update params with auto-refetch
  const updateParams = useCallback((newParams: Partial<GetItemsParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return useMemo(() => ({
    items: itemsData?.items || [],
    isLoading: isGetItemsLoading,
    getItemsError,
    refetchItems,
    updateParams,
  }), [
    itemsData,
    isGetItemsLoading,
    getItemsError,
    refetchItems,
    updateParams,
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
