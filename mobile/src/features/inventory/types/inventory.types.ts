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
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
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

export interface GetItemsParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: StockStatus;
  search?: string;
  sortBy?: 'name' | 'quantity' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
