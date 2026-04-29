import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User';
import Restaurant from '../models/Restaurant';
import Category from '../models/Category';
import Inventory from '../models/Inventory';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory-app');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Category.deleteMany({});
    await Inventory.deleteMany({});
    console.log('Cleared existing data');

    // Create restaurant
    const restaurant = await Restaurant.create({
      name: 'Sample Restaurant',
      location: '123 Main Street, New York, NY 10001',
    });
    console.log('Created restaurant:', restaurant.name);

    // Create manager user
    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@restaurant.com',
      password: 'manager123',
      role: 'manager',
      restaurantId: restaurant._id,
    });
    console.log('Created manager user:', manager.email);

    // Create categories
    const produceCategory = await Category.create({
      name: 'Produce',
      restaurantId: restaurant._id,
    });
    const dairyCategory = await Category.create({
      name: 'Dairy',
      restaurantId: restaurant._id,
    });
    const meatCategory = await Category.create({
      name: 'Meat',
      restaurantId: restaurant._id,
    });
    console.log('Created categories');

    // Create items with different stock statuses
    const items = [
      // In-stock items
      {
        name: 'Onions',
        categoryId: produceCategory._id,
        restaurantId: restaurant._id,
        unit: 'kg',
        currentStock: 50,
        minThreshold: 10,
        maxStock: 100,
        price: 2.5,
        sku: 'ONN-001',
        description: 'Fresh onions',
        lastUpdatedBy: manager._id,
      },
      {
        name: 'Potatoes',
        categoryId: produceCategory._id,
        restaurantId: restaurant._id,
        unit: 'kg',
        currentStock: 80,
        minThreshold: 20,
        maxStock: 150,
        price: 1.8,
        sku: 'POT-001',
        description: 'Fresh potatoes',
        lastUpdatedBy: manager._id,
      },
      {
        name: 'Milk',
        categoryId: dairyCategory._id,
        restaurantId: restaurant._id,
        unit: 'liters',
        currentStock: 30,
        minThreshold: 10,
        maxStock: 50,
        price: 3.5,
        sku: 'MLK-001',
        description: 'Fresh milk',
        lastUpdatedBy: manager._id,
      },
      // Low stock items
      {
        name: 'Tomatoes',
        categoryId: produceCategory._id,
        restaurantId: restaurant._id,
        unit: 'kg',
        currentStock: 2,
        minThreshold: 10,
        maxStock: 50,
        price: 4.0,
        sku: 'TMT-001',
        description: 'Fresh tomatoes',
        lastUpdatedBy: manager._id,
      },
      {
        name: 'Cheese',
        categoryId: dairyCategory._id,
        restaurantId: restaurant._id,
        unit: 'kg',
        currentStock: 0.5,
        minThreshold: 5,
        maxStock: 20,
        price: 15.0,
        sku: 'CHS-001',
        description: 'Cheddar cheese',
        lastUpdatedBy: manager._id,
      },
      {
        name: 'Chicken',
        categoryId: meatCategory._id,
        restaurantId: restaurant._id,
        unit: 'kg',
        currentStock: 3,
        minThreshold: 15,
        maxStock: 40,
        price: 12.0,
        sku: 'CHK-001',
        description: 'Fresh chicken breast',
        lastUpdatedBy: manager._id,
      },
      // Out of stock items
      {
        name: 'Lettuce',
        categoryId: produceCategory._id,
        restaurantId: restaurant._id,
        unit: 'kg',
        currentStock: 0,
        minThreshold: 5,
        maxStock: 20,
        price: 3.0,
        sku: 'LTC-001',
        description: 'Fresh lettuce',
        lastUpdatedBy: manager._id,
      },
      {
        name: 'Butter',
        categoryId: dairyCategory._id,
        restaurantId: restaurant._id,
        unit: 'kg',
        currentStock: 0,
        minThreshold: 3,
        maxStock: 10,
        price: 10.0,
        sku: 'BTR-001',
        description: 'Salted butter',
        lastUpdatedBy: manager._id,
      },
      {
        name: 'Beef',
        categoryId: meatCategory._id,
        restaurantId: restaurant._id,
        unit: 'kg',
        currentStock: 0,
        minThreshold: 10,
        maxStock: 30,
        price: 25.0,
        sku: 'BF-001',
        description: 'Fresh beef steak',
        lastUpdatedBy: manager._id,
      },
    ];

    await Inventory.insertMany(items);
    console.log(`Created ${items.length} inventory items`);

    // Summary
    const inStock = items.filter(i => i.currentStock > i.minThreshold).length;
    const lowStock = items.filter(i => i.currentStock > 0 && i.currentStock <= i.minThreshold).length;
    const outOfStock = items.filter(i => i.currentStock === 0).length;

    console.log('\n=== Seed Summary ===');
    console.log(`Restaurant: ${restaurant.name}`);
    console.log(`Manager: ${manager.email} (password: manager123)`);
    console.log(`Total Items: ${items.length}`);
    console.log(`In Stock: ${inStock}`);
    console.log(`Low Stock: ${lowStock}`);
    console.log(`Out of Stock: ${outOfStock}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

seedDatabase();
