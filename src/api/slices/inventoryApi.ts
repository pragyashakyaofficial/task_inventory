import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENV } from '../../config/env';

// API configuration
const API_CONFIG = {
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API endpoints
const ENDPOINTS = {
  // Inventory endpoints
  INVENTORY: '/inventory',
  INVENTORY_ITEM: (id: string) => `/inventory/${id}`,
  
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  
  // User endpoints
  PROFILE: '/user/profile',
  
  // Add more endpoints as needed
} as const;

// Types for inventory items
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
  location?: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  minimumStock?: number;
  tags?: string[];
  images?: string[];
}

export interface CreateItemRequest {
  name: string;
  description?: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
  location?: string;
  supplier?: string;
  minimumStock?: number;
  tags?: string[];
  images?: string[];
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {
  id: string;
}

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
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoriesCount: number;
  recentActivity: {
    action: 'created' | 'updated' | 'deleted';
    itemName: string;
    timestamp: string;
  }[];
  topCategories: {
    category: string;
    count: number;
    value: number;
  }[];
}

export interface AISuggestionRequest {
  itemName?: string;
  category?: string;
  description?: string;
  context?: 'pricing' | 'stock_level' | 'category' | 'description';
}

export interface AISuggestionResponse {
  suggestions: {
    type: 'price' | 'quantity' | 'category' | 'description';
    value: string | number;
    confidence: number;
    reasoning: string;
  }[];
}

// Cache tags
export const inventoryTags = {
  items: 'ITEMS',
  item: (id: string) => ({ type: 'ITEMS' as const, id }),
  dashboard: 'DASHBOARD',
  aiSuggestion: 'AI_SUGGESTION',
} as const;

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    prepareHeaders: async (headers) => {
        headers.set('Content-Type', 'application/json');
        // Add auth token if available
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            headers.set('authorization', `Bearer ${token}`);
          }
        } catch (error) {
          console.warn('Failed to get auth token:', error);
        }
        return headers;
      },
  }),
  tagTypes: ['ITEMS', 'DASHBOARD', 'AI_SUGGESTION'],
  endpoints: (builder) => ({
    // Get all inventory items
    getItems: builder.query<GetItemsResponse, GetItemsParams>({
      query: (params) => ({
        url: ENDPOINTS.INVENTORY,
        params,
      }),
      providesTags: [inventoryTags.items],
    }),

    // Get single item by ID
    getItemById: builder.query<InventoryItem, string>({
      query: (id) => ENDPOINTS.INVENTORY_ITEM(id),
      providesTags: (_result, _error, id) => [inventoryTags.item(id)],
    }),

    // Create new item
    createItem: builder.mutation<InventoryItem, CreateItemRequest>({
      query: (item) => ({
        url: ENDPOINTS.INVENTORY,
        method: 'POST',
        body: item,
      }),
      invalidatesTags: [inventoryTags.items, inventoryTags.dashboard],
      onQueryStarted: async (item, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const tempItem: InventoryItem = {
          ...item,
          id: tempId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: item.quantity === 0 ? 'out_of_stock' : 
                  item.minimumStock && item.quantity <= item.minimumStock ? 'low_stock' : 'in_stock',
        };

        // Update cache optimistically
        const patchResult = dispatch(
          inventoryApi.util.updateQueryData('getItems', {}, (draft) => {
            draft.items.unshift(tempItem);
            draft.total += 1;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),

    // Update existing item
    updateItem: builder.mutation<InventoryItem, UpdateItemRequest>({
      query: ({ id, ...patch }) => ({
        url: ENDPOINTS.INVENTORY_ITEM(id),
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        inventoryTags.items,
        inventoryTags.item(id),
        inventoryTags.dashboard,
      ],
      onQueryStarted: async ({ id, ...patch }, { dispatch, queryFulfilled }) => {
        // Optimistic update for individual item
        const patchItemResult = dispatch(
          inventoryApi.util.updateQueryData('getItemById', id, (draft) => {
            Object.assign(draft, patch, { updatedAt: new Date().toISOString() });
            
            // Update status based on quantity
            if (patch.quantity !== undefined) {
              draft.status = patch.quantity === 0 ? 'out_of_stock' : 
                           draft.minimumStock && patch.quantity <= draft.minimumStock ? 'low_stock' : 'in_stock';
            }
          })
        );

        // Optimistic update for list view
        const patchListResult = dispatch(
          inventoryApi.util.updateQueryData('getItems', {}, (draft) => {
            const itemIndex = draft.items.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
              Object.assign(draft.items[itemIndex], patch, { updatedAt: new Date().toISOString() });
              
              // Update status based on quantity
              if (patch.quantity !== undefined) {
                const item = draft.items[itemIndex];
                item.status = patch.quantity === 0 ? 'out_of_stock' : 
                             item.minimumStock && patch.quantity <= item.minimumStock ? 'low_stock' : 'in_stock';
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchItemResult.undo();
          patchListResult.undo();
        }
      },
    }),

    // Delete item
    deleteItem: builder.mutation<void, string>({
      query: (id) => ({
        url: ENDPOINTS.INVENTORY_ITEM(id),
        method: 'DELETE',
      }),
      invalidatesTags: [inventoryTags.items, inventoryTags.dashboard],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        // Optimistic update for list view
        const patchListResult = dispatch(
          inventoryApi.util.updateQueryData('getItems', {}, (draft) => {
            draft.items = draft.items.filter(item => item.id !== id);
            draft.total -= 1;
          })
        );

        // Optimistic update for individual item cache
        const patchItemResult = dispatch(
          inventoryApi.util.updateQueryData('getItemById', id, () => {
            return undefined;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchListResult.undo();
          patchItemResult.undo();
        }
      },
    }),

    // Get AI suggestions
    getAISuggestion: builder.mutation<AISuggestionResponse, AISuggestionRequest>({
      query: (request) => ({
        url: `${ENDPOINTS.INVENTORY}/ai-suggestions`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: [inventoryTags.aiSuggestion],
    }),

    // Get dashboard statistics
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => `${ENDPOINTS.INVENTORY}/dashboard/stats`,
      providesTags: [inventoryTags.dashboard],
    }),
  }),
});

// Export hooks
export const {
  useGetItemsQuery,
  useGetItemByIdQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useGetAISuggestionMutation,
  useGetDashboardStatsQuery,
} = inventoryApi;

// Export selectors for advanced usage
export const selectItemsResult = inventoryApi.endpoints.getItems.select({});
export const selectItemByIdResult = (id: string) => inventoryApi.endpoints.getItemById.select(id);
export const selectDashboardStatsResult = inventoryApi.endpoints.getDashboardStats.select();
