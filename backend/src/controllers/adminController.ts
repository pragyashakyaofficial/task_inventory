import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request { user?: any; }
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import Inventory from '../models/Inventory';

export const getGlobalStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [restaurantCount, userCount, inventoryCount] = await Promise.all([
      Restaurant.countDocuments({ isDeleted: false }),
      User.countDocuments({ status: 'ACTIVE' }),
      Inventory.countDocuments({ isDeleted: false })
    ]);

    res.status(200).json({
      stats: {
        restaurants: restaurantCount,
        users: userCount,
        inventory: inventoryCount
      }
    });
  } catch (error) {
    next(error);
  }
};
