export const getStockStatus = (quantity: number, minThreshold: number = 10): string => {
  if (quantity > minThreshold) return "In Stock";
  if (quantity > 0) return "Low Stock";
  return "Out of Stock";
};
