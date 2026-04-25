import { StockStatus } from '../../inventory/types/inventory.types';
import { lightColors } from '../../../theme/colors';

export const getStockStatus = (
  quantity: number,
  minQuantity: number = 0,
  maxQuantity: number = Infinity
): StockStatus => {
  if (quantity === 0) {
    return 'out-of-stock';
  }
  
  if (quantity <= minQuantity) {
    return 'low-stock';
  }
  
  if (quantity > maxQuantity) {
    return 'pending'; // Overstock, pending review
  }
  
  return 'in-stock';
};

export const getStockColor = (status: StockStatus): string => {
  switch (status) {
    case 'in-stock':
      return lightColors.success;
    case 'low-stock':
      return lightColors.warning;
    case 'out-of-stock':
      return lightColors.error;
    case 'discontinued':
      return lightColors.gray;
    case 'pending':
      return lightColors.info;
    default:
      return lightColors.gray;
  }
};

export const getStockBackgroundColor = (status: StockStatus): string => {
  switch (status) {
    case 'in-stock':
      return lightColors.success + '20';
    case 'low-stock':
      return lightColors.warning + '20';
    case 'out-of-stock':
      return lightColors.error + '20';
    case 'discontinued':
      return lightColors.background;
    case 'pending':
      return lightColors.primary + '20';
    default:
      return lightColors.background;
  }
};

export const formatQuantity = (quantity: number): string => {
  if (quantity >= 1000000) {
    return `${(quantity / 1000000).toFixed(1)}M`;
  }
  
  if (quantity >= 1000) {
    return `${(quantity / 1000).toFixed(1)}K`;
  }
  
  return quantity.toString();
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const calculateStockPercentage = (
  quantity: number,
  minQuantity: number,
  maxQuantity: number
): number => {
  if (maxQuantity === minQuantity) return 100;
  
  const range = maxQuantity - minQuantity;
  const position = quantity - minQuantity;
  
  return Math.min(100, Math.max(0, (position / range) * 100));
};

export const getStockLevel = (percentage: number): 'critical' | 'low' | 'normal' | 'high' => {
  if (percentage === 0) return 'critical';
  if (percentage <= 25) return 'low';
  if (percentage <= 75) return 'normal';
  return 'high';
};

export const shouldRestock = (
  quantity: number,
  minQuantity: number,
  leadTime: number = 7,
  dailyUsage: number = 1
): boolean => {
  const projectedStock = quantity - (leadTime * dailyUsage);
  return projectedStock <= minQuantity;
};

export const calculateOptimalStock = (
  dailyUsage: number,
  leadTime: number,
  safetyStock: number = 0.2
): {
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
} => {
  const leadTimeDemand = dailyUsage * leadTime;
  const safetyStockAmount = leadTimeDemand * safetyStock;
  
  const minQuantity = Math.ceil(safetyStockAmount);
  const maxQuantity = Math.ceil(leadTimeDemand * 2 + safetyStockAmount);
  const reorderPoint = Math.ceil(leadTimeDemand + safetyStockAmount);
  
  return {
    minQuantity,
    maxQuantity,
    reorderPoint,
  };
};

export const calculateInventoryValue = (
  items: Array<{ quantity: number; cost: number }>
): {
  totalCost: number;
  totalValue: number;
  itemCount: number;
} => {
  return items.reduce(
    (acc, item) => ({
      totalCost: acc.totalCost + (item.quantity * item.cost),
      totalValue: acc.totalValue + (item.quantity * item.cost), // Same as cost for now
      itemCount: acc.itemCount + item.quantity,
    }),
    { totalCost: 0, totalValue: 0, itemCount: 0 }
  );
};

export const getStockTrend = (
  currentQuantity: number,
  previousQuantity: number
): 'increasing' | 'decreasing' | 'stable' => {
  const difference = currentQuantity - previousQuantity;
  const threshold = Math.max(1, Math.abs(previousQuantity) * 0.05); // 5% threshold
  
  if (Math.abs(difference) <= threshold) {
    return 'stable';
  }
  
  return difference > 0 ? 'increasing' : 'decreasing';
};

export const getDaysOfSupply = (
  quantity: number,
  dailyUsage: number
): number => {
  if (dailyUsage <= 0) return Infinity;
  return Math.floor(quantity / dailyUsage);
};

export const getStockoutRisk = (
  quantity: number,
  dailyUsage: number,
  leadTime: number
): 'low' | 'medium' | 'high' | 'critical' => {
  if (quantity === 0) return 'critical';
  if (dailyUsage <= 0) return 'low';
  
  const daysOfSupply = getDaysOfSupply(quantity, dailyUsage);
  
  if (daysOfSupply <= leadTime) return 'critical';
  if (daysOfSupply <= leadTime * 2) return 'high';
  if (daysOfSupply <= leadTime * 3) return 'medium';
  return 'low';
};

export const generateStockAlert = (
  quantity: number,
  minQuantity: number,
  itemName: string,
  dailyUsage: number = 1,
  leadTime: number = 7
): {
  type: 'info' | 'warning' | 'critical';
  message: string;
  action: string;
} | null => {
  const status = getStockStatus(quantity, minQuantity);
  const risk = getStockoutRisk(quantity, dailyUsage, leadTime);
  
  if (status === 'out-of-stock') {
    return {
      type: 'critical',
      message: `${itemName} is out of stock`,
      action: 'Urgent restock required',
    };
  }
  
  if (status === 'low-stock' || risk === 'critical') {
    const daysOfSupply = getDaysOfSupply(quantity, dailyUsage);
    return {
      type: 'warning',
      message: `${itemName} is low on stock (${quantity} units, ${daysOfSupply} days of supply)`,
      action: 'Restock recommended',
    };
  }
  
  if (risk === 'high') {
    return {
      type: 'info',
      message: `${itemName} stock level requires attention`,
      action: 'Monitor stock levels',
    };
  }
  
  return null;
};
