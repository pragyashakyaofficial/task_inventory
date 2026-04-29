// API cache tags for RTK Query
export const apiTags = {
  INVENTORY: 'Inventory',
  PRODUCT: 'Product',
  CATEGORY: 'Category',
  USER: 'User',
  ORDER: 'Order',
} as const;

// Export individual tags
export const {
  INVENTORY,
  PRODUCT,
  CATEGORY,
  USER,
  ORDER,
} = apiTags;
