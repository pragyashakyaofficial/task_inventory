export const getStockStatus = (quantity: number): string => {
  if (quantity > 10) return "In Stock";
  if (quantity > 0) return "Low Stock";
  return "Out of Stock";
};
