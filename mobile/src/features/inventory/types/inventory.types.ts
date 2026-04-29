export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  category: string;
  sku: string;
  unit: string;
  price: number;
  cost: number;
  location?: string;
  supplier?: string;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
  lastRestocked?: string;
  tags?: string[];
  imageUrl?: string;
  images?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  barcode?: string;
  notes?: string;
  minimumStock?: number;
  suggestedOrder?: number;
}

// Backend sends: OK, LOW, OUT — mapped to these frontend values at the API boundary
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

// Mapping utility for backend → frontend status
export const mapBackendStatus = (status: string): StockStatus => {
  switch (status) {
    case 'OUT': return 'out-of-stock';
    case 'LOW': return 'low-stock';
    case 'OK': return 'in-stock';
    default: return 'in-stock';
  }
};

export interface CreateItemRequest {
  name: string;
  description?: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  category: string;
  sku: string;
  unit: string;
  price: number;
  cost: number;
  location?: string;
  supplier?: string;
  tags?: string[];
  imageUrl?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  barcode?: string;
  notes?: string;
}

export interface UpdateItemRequest {
  id: string;
  name?: string;
  description?: string;
  quantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  category?: string;
  sku?: string;
  price?: number;
  cost?: number;
  location?: string;
  supplier?: string;
  tags?: string[];
  imageUrl?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  barcode?: string;
  notes?: string;
  status?: StockStatus;
}

export interface DeleteItemRequest {
  id: string;
  reason?: string;
}

export interface InventoryFilter {
  category?: string;
  status?: StockStatus;
  search?: string;
  location?: string;
  supplier?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  tags?: string[];
}

export interface InventorySort {
  field: 'name' | 'quantity' | 'price' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface InventoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetItemsResponse {
  items: InventoryItem[];
  pagination: InventoryPagination;
  filters: InventoryFilter;
  sort: InventorySort;
}

export interface GetItemsParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: StockStatus;
  search?: string;
  location?: string;
  supplier?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  tags?: string[];
  sortBy?: 'name' | 'quantity' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateItemResponse {
  item: InventoryItem;
  message: string;
}

export interface UpdateItemResponse {
  item: InventoryItem;
  message: string;
}

export interface DeleteItemResponse {
  success: boolean;
  message: string;
}

export interface AISuggestion {
  id: string;
  type: 'restock' | 'pricing' | 'category' | 'optimization';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: any;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  type: 'low-stock' | 'out-of-stock' | 'overstock';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
  acknowledged: boolean;
}
