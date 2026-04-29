// API cache tags for RTK Query
export const apiTags = {
  INVENTORY: 'Inventory',
  USER: 'User',
} as const;

// Export individual tags
export const {
  INVENTORY,
  USER,
} = apiTags;
