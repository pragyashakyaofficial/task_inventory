import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../baseQuery';
import { InventoryItem as FeatureInventoryItem } from '../../features/inventory/types/inventory.types';

// API endpoints
const ENDPOINTS = {
  INVENTORY: '/api/inventory',
  DASHBOARD_STATS: '/api/inventory/stats',
  REORDER_PLAN: '/api/inventory/reorder-plan',
} as const;

// Re-export shared types
export type InventoryItem = FeatureInventoryItem;

export interface GetItemsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'name' | 'quantity' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  status?: InventoryItem['status'];
}

export interface GetItemsResponse {
  items: InventoryItem[];
  total: number;
}

export interface DashboardStats {
  stats: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  criticalStockAlerts: InventoryItem[];
}

export interface ReorderSuggestion {
  itemId: string;
  name: string;
  category: string;
  currentQuantity: number;
  minThreshold: number;
  maxStock: number;
  unit: string;
  status: string;
  shouldReorder: boolean;
  suggestedQuantity: number;
  reason: string;
  price?: number;
}

export interface ReorderPlanResponse {
  success: boolean;
  suggestions: ReorderSuggestion[];
  message?: string;
}

// Cache tags
export const inventoryTags = {
  items: 'ITEMS',
  dashboard: 'DASHBOARD',
  aiSuggestion: 'AI_SUGGESTION',
} as const;

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['ITEMS', 'DASHBOARD', 'AI_SUGGESTION'],
  endpoints: (builder) => ({
    // Get all inventory items
    getItems: builder.query<GetItemsResponse, GetItemsParams | void>({
      query: (params) => ({
        url: ENDPOINTS.INVENTORY,
        params,
      }),
      transformResponse: (response: any) => {
        const mapItem = (item: any): InventoryItem => ({
          ...item,
          id: item._id || item.id,
          status: (item.status || 'in-stock').toLowerCase().replace(' ', '-'),
          quantity: item.currentStock !== undefined ? item.currentStock : item.quantity || 0,
          minQuantity: item.minThreshold !== undefined ? item.minThreshold : item.minimumStock || 0,
          maxQuantity: item.maxStock || 100,
          price: item.price || 0,
          cost: item.cost || 0,
          sku: item.sku || '',
          category: typeof item.categoryId === 'object' ? item.categoryId.name : item.category || 'Uncategorized',
          suggestedOrder: item.suggestedOrder || 0,
          unit: item.unit || 'units',
        });

        if (response && response.inventory && Array.isArray(response.inventory)) {
          return {
            items: response.inventory.map(mapItem),
            total: response.count || response.inventory.length,
          };
        }

        if (Array.isArray(response)) {
          return {
            items: response.map(mapItem),
            total: response.length,
          };
        }

        if (response && response.items) {
          return {
            ...response,
            items: response.items.map(mapItem),
          };
        }

        return response;
      },
      providesTags: [inventoryTags.items],
    }),

    // Get reorder plan (lazy)
    getReorderPlan: builder.query<ReorderPlanResponse, void>({
      query: () => ENDPOINTS.REORDER_PLAN,
      providesTags: [inventoryTags.aiSuggestion],
    }),

    // Get dashboard statistics
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ENDPOINTS.DASHBOARD_STATS,
      transformResponse: (response: any) => {
        return {
          stats: {
            total: response.stats?.total || 0,
            inStock: response.stats?.inStock || 0,
            lowStock: response.stats?.lowStock || 0,
            outOfStock: response.stats?.outOfStock || 0,
          },
          criticalStockAlerts: (response.criticalStockAlerts || []).map((item: any) => ({
            ...item,
            id: item._id || item.id,
            status: item.currentStock === 0 ? 'out-of-stock' : 'low-stock',
            quantity: item.currentStock,
            minQuantity: item.minThreshold,
          })),
        };
      },
      providesTags: [inventoryTags.dashboard],
    }),
  }),
});

// Export hooks
export const {
  useGetItemsQuery,
  useLazyGetReorderPlanQuery,
  useGetDashboardStatsQuery,
} = inventoryApi;

// Export selectors
export const selectItemsResult = inventoryApi.endpoints.getItems.select({});
export const selectDashboardStatsResult = inventoryApi.endpoints.getDashboardStats.select();
