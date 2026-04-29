import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';
import { InventoryItem as FeatureInventoryItem } from '../../features/inventory/types/inventory.types';

// API endpoints
const ENDPOINTS = {
  // Inventory endpoints
  INVENTORY: '/api/inventory',
  INVENTORY_ITEM: (id: string) => `/api/inventory/${id}`,

  // Category endpoints
  CATEGORIES: '/api/categories',

  // Dashboard endpoints
  DASHBOARD_STATS: '/api/inventory/stats',
  
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  
  // User endpoints
  PROFILE: '/api/users/profile',
  
  // Reorder Planner endpoints
  REORDER_PLAN: '/api/inventory/reorder-plan',
  PREDICT_REORDER: (id: string) => `/api/inventory/${id}`,

  // Stock Request endpoints
  STOCK_REQUESTS: '/api/stock-requests',

  // Order endpoints
  ORDERS: '/api/orders',
  ORDER: (id: string) => `/api/orders/${id}`,
  RECEIVE_ORDER: (id: string) => `/api/orders/${id}/receive`,
  STOCK_REQUEST: (id: string) => `/api/stock-requests/${id}`,
  APPROVE_STOCK_REQUEST: (id: string) => `/api/stock-requests/${id}/approve`,
  REJECT_STOCK_REQUEST: (id: string) => `/api/stock-requests/${id}/reject`,
  FULFILL_STOCK_REQUEST: (id: string) => `/api/stock-requests/${id}/fulfill`,
} as const;

// Re-export shared types
export type InventoryItem = FeatureInventoryItem;


export interface CreateItemRequest {
  name: string;
  description?: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
  unit: string;
  location?: string;
  supplier?: string;
  minimumStock?: number;
  tags?: string[];
  images?: string[];
}

export interface Category {
  _id: string;
  name: string;
  restaurantId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
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
}

export interface DashboardStats {
  stats: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  criticalStockAlerts: InventoryItem[];
  recentActivity?: {
    action: 'created' | 'updated' | 'deleted';
    itemName: string;
    timestamp: string;
  }[];
  topCategories?: {
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

export interface StockRequest {
  _id: string;
  inventoryId: InventoryItem | string;
  restaurantId: string;
  requestedQuantity: number;
  currentStock: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  requestedBy: { name: string; email: string };
  approvedBy?: { name: string; email: string };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockRequestPayload {
  inventoryId: string;
  requestedQuantity: number;
  notes?: string;
}

export interface Order {
  _id: string;
  itemId: {
    _id: string;
    name: string;
    category: string;
    unit: string;
    price: number;
    sku: string;
  } | string;
  restaurantId: string;
  quantityOrdered: number;
  unit: string;
  isReceived: boolean;
  orderedBy: { _id: string; name: string; email: string } | string;
  receivedBy?: { _id: string; name: string; email: string } | string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  itemId: string;
  quantityOrdered: number;
  unit?: string;
  remarks?: string;
}

export interface ReceiveOrderPayload {
  remarks?: string;
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
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ITEMS', 'DASHBOARD', 'AI_SUGGESTION', 'STOCK_REQUEST', 'ORDERS'],
  endpoints: (builder) => ({
    // Get all inventory items
    getItems: builder.query<GetItemsResponse, GetItemsParams>({
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

    // Get categories for user's restaurant
    getCategories: builder.query<{ count: number; categories: Category[] }, void>({
      query: () => ENDPOINTS.CATEGORIES,
      transformResponse: (response: any) => {
        return {
          count: response?.count || 0,
          categories: response?.categories || [],
        };
      },
    }),

    // Get single item by ID
    getItemById: builder.query<InventoryItem, string>({
      query: (id) => ENDPOINTS.INVENTORY_ITEM(id),
      transformResponse: (response: any) => {
        const item = response?.inventory || response;
        return {
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
        };
      },
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
          status: item.quantity === 0 ? 'out-of-stock' : 
                  item.minimumStock && item.quantity <= item.minimumStock ? 'low-stock' : 'in-stock',
          minQuantity: item.minimumStock || 0,
          maxQuantity: 100,
          category: item.category || 'Uncategorized',
          sku: item.sku || '',
          price: item.price || 0,
          cost: 0,
          unit: 'units',
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
              draft.status = patch.quantity === 0 ? 'out-of-stock' : 
                           draft.minimumStock && patch.quantity <= draft.minimumStock ? 'low-stock' : 'in-stock';
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
                item.status = patch.quantity === 0 ? 'out-of-stock' : 
                             item.minimumStock && patch.quantity <= item.minimumStock ? 'low-stock' : 'in-stock';
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

    // Get reorder plan (lazy)
    getReorderPlan: builder.query<ReorderPlanResponse, void>({
      query: () => ENDPOINTS.REORDER_PLAN,
      providesTags: [inventoryTags.aiSuggestion],
    }),

    // Predict reorder for a specific item
    predictReorder: builder.mutation<{ suggestedQuantity: number; when: string; reason: string }, string>({
      query: (id) => ({
        url: ENDPOINTS.PREDICT_REORDER(id),
        method: 'POST', // Using POST to trigger prediction logic
      }),
      invalidatesTags: (_result, _error, id) => [inventoryTags.item(id)],
    }),

    // Get dashboard statistics
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ENDPOINTS.DASHBOARD_STATS,
      transformResponse: (response: any) => {
        return {
          stats: {
            total: response.stats?.total || 0,
            inStock: response.stats?.ok || 0,
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

    // Stock Requests
    getStockRequests: builder.query<StockRequest[], void>({
      query: () => ENDPOINTS.STOCK_REQUESTS,
      transformResponse: (response: any) => response.stockRequests || [],
      providesTags: ['STOCK_REQUEST'],
    }),

    createStockRequest: builder.mutation<StockRequest, CreateStockRequestPayload>({
      query: (payload) => ({
        url: ENDPOINTS.STOCK_REQUESTS,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['STOCK_REQUEST', 'ITEMS', 'DASHBOARD'],
    }),

    approveStockRequest: builder.mutation<StockRequest, string>({
      query: (id) => ({
        url: ENDPOINTS.APPROVE_STOCK_REQUEST(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['STOCK_REQUEST'],
    }),

    rejectStockRequest: builder.mutation<StockRequest, string>({
      query: (id) => ({
        url: ENDPOINTS.REJECT_STOCK_REQUEST(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['STOCK_REQUEST'],
    }),

    fulfillStockRequest: builder.mutation<StockRequest, string>({
      query: (id) => ({
        url: ENDPOINTS.FULFILL_STOCK_REQUEST(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['STOCK_REQUEST', 'ITEMS', 'DASHBOARD'],
    }),

    // Get orders
    getOrders: builder.query<{ count: number; orders: Order[] }, { isReceived?: boolean }>({
      query: (params) => ({
        url: ENDPOINTS.ORDERS,
        params,
      }),
      providesTags: ['ORDERS'],
    }),

    // Create order
    createOrder: builder.mutation<{ message: string; order: Order }, CreateOrderPayload>({
      query: (payload) => ({
        url: ENDPOINTS.ORDERS,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['ORDERS', 'ITEMS', 'DASHBOARD'],
    }),

    // Receive order
    receiveOrder: builder.mutation<{ message: string; order: Order }, { id: string; remarks?: string }>({
      query: ({ id, remarks }) => ({
        url: ENDPOINTS.RECEIVE_ORDER(id),
        method: 'PATCH',
        body: { remarks },
      }),
      invalidatesTags: ['ORDERS', 'ITEMS', 'DASHBOARD'],
    }),

    // Delete order
    deleteOrder: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: ENDPOINTS.ORDER(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['ORDERS'],
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
  useLazyGetReorderPlanQuery,
  usePredictReorderMutation,
  useGetStockRequestsQuery,
  useCreateStockRequestMutation,
  useApproveStockRequestMutation,
  useRejectStockRequestMutation,
  useFulfillStockRequestMutation,
  useGetCategoriesQuery,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useReceiveOrderMutation,
  useDeleteOrderMutation,
} = inventoryApi;

// Export selectors for advanced usage
export const selectItemsResult = inventoryApi.endpoints.getItems.select({});
export const selectItemByIdResult = (id: string) => inventoryApi.endpoints.getItemById.select(id);
export const selectDashboardStatsResult = inventoryApi.endpoints.getDashboardStats.select();
