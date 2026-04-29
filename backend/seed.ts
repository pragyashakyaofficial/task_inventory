import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all models
import Restaurant from './src/models/Restaurant';
import User from './src/models/User';
import Category from './src/models/Category';
import Inventory from './src/models/Inventory';
import InventoryLog from './src/models/InventoryLog';

dotenv.config();

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      Restaurant.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({}),
      Inventory.deleteMany({}),
      InventoryLog.deleteMany({})
    ]);
    console.log('Cleared existing data.');

    // ========== 1. CREATE RESTAURANTS ==========
    console.log('\n--- Creating Restaurants ---');
    const restaurantA = await Restaurant.create({
      name: 'Burger Palace Downtown',
      location: '123 Main Street, Downtown',
      status: 'ACTIVE'
    });

    const restaurantB = await Restaurant.create({
      name: 'Burger Palace Mall',
      location: 'Westfield Mall, Unit 45',
      status: 'ACTIVE'
    });

    console.log(`Created restaurants: ${restaurantA.name}, ${restaurantB.name}`);

    // ========== 2. CREATE USERS ==========
    console.log('\n--- Creating Users ---');

    // Superadmin
    const superadmin = await User.create({
      name: 'Super Admin',
      email: 'super@admin.com',
      password: 'password@superadmin',
      role: 'superadmin',
      restaurantId: null,
      status: 'ACTIVE'
    });

    // Manager for Restaurant A
    const managerA = await User.create({
      name: 'Restaurant A Manager',
      email: 'manager@restaurantA.com',
      password: 'password@manager',
      role: 'manager',
      restaurantId: restaurantA._id,
      status: 'ACTIVE'
    });

    // Manager for Restaurant B
    const managerB = await User.create({
      name: 'Restaurant B Manager',
      email: 'manager@restaurantB.com',
      password: 'password@manager',
      role: 'manager',
      restaurantId: restaurantB._id,
      status: 'ACTIVE'
    });

    console.log('Created users:');
    console.log(`  - Superadmin: ${superadmin.email}`);
    console.log(`  - Manager A: ${managerA.email} (${restaurantA.name})`);
    console.log(`  - Manager B: ${managerB.email} (${restaurantB.name})`);

    // ========== 3. CREATE CATEGORIES ==========
    console.log('\n--- Creating Categories ---');
    
    // Categories for Restaurant A
    const categoriesA = await Category.insertMany([
      { name: 'Vegetables', restaurantId: restaurantA._id },
      { name: 'Dairy', restaurantId: restaurantA._id },
      { name: 'Meat', restaurantId: restaurantA._id },
      { name: 'Bakery', restaurantId: restaurantA._id },
      { name: 'Condiments', restaurantId: restaurantA._id }
    ]);

    // Categories for Restaurant B
    const categoriesB = await Category.insertMany([
      { name: 'Vegetables', restaurantId: restaurantB._id },
      { name: 'Dairy', restaurantId: restaurantB._id },
      { name: 'Meat', restaurantId: restaurantB._id },
      { name: 'Beverages', restaurantId: restaurantB._id }
    ]);

    const catA_Veg = categoriesA.find(c => c.name === 'Vegetables')!;
    const catA_Dairy = categoriesA.find(c => c.name === 'Dairy')!;
    const catA_Meat = categoriesA.find(c => c.name === 'Meat')!;
    const catA_Bakery = categoriesA.find(c => c.name === 'Bakery')!;
    const catA_Condiments = categoriesA.find(c => c.name === 'Condiments')!;

    console.log(`Created ${categoriesA.length} categories for Restaurant A`);
    console.log(`Created ${categoriesB.length} categories for Restaurant B`);

    // ========== 4. CREATE INVENTORY ITEMS ==========
    console.log('\n--- Creating Inventory Items ---');
    
    // Restaurant A Inventory
    const inventoryA = await Inventory.insertMany([
      // Vegetables - various stock levels
      {
        name: 'Tomatoes',
        categoryId: catA_Veg._id,
        restaurantId: restaurantA._id,
        unit: 'kg',
        currentStock: 5,
        minThreshold: 10,
        maxStock: 50,
        lastUpdatedBy: superadmin._id
      },
      {
        name: 'Lettuce',
        categoryId: catA_Veg._id,
        restaurantId: restaurantA._id,
        unit: 'pcs',
        currentStock: 20,
        minThreshold: 15,
        maxStock: 100,
        lastUpdatedBy: superadmin._id
      },
      {
        name: 'Onions',
        categoryId: catA_Veg._id,
        restaurantId: restaurantA._id,
        unit: 'kg',
        currentStock: 2,
        minThreshold: 5,
        maxStock: 30,
        lastUpdatedBy: superadmin._id
      },
      {
        name: 'Potatoes',
        categoryId: catA_Veg._id,
        restaurantId: restaurantA._id,
        unit: 'kg',
        currentStock: 0,
        minThreshold: 10,
        maxStock: 50,
        lastUpdatedBy: superadmin._id
      },
      // Dairy
      {
        name: 'Cheese Slices',
        categoryId: catA_Dairy._id,
        restaurantId: restaurantA._id,
        unit: 'pcs',
        currentStock: 200,
        minThreshold: 100,
        maxStock: 500,
        lastUpdatedBy: superadmin._id
      },
      {
        name: 'Milk',
        categoryId: catA_Dairy._id,
        restaurantId: restaurantA._id,
        unit: 'litre',
        currentStock: 8,
        minThreshold: 10,
        maxStock: 30,
        lastUpdatedBy: superadmin._id
      },
      // Meat
      {
        name: 'Beef Patties',
        categoryId: catA_Meat._id,
        restaurantId: restaurantA._id,
        unit: 'pcs',
        currentStock: 150,
        minThreshold: 50,
        maxStock: 300,
        lastUpdatedBy: superadmin._id
      },
      {
        name: 'Chicken Breast',
        categoryId: catA_Meat._id,
        restaurantId: restaurantA._id,
        unit: 'kg',
        currentStock: 3,
        minThreshold: 5,
        maxStock: 20,
        lastUpdatedBy: superadmin._id
      },
      // Bakery
      {
        name: 'Burger Buns',
        categoryId: catA_Bakery._id,
        restaurantId: restaurantA._id,
        unit: 'pcs',
        currentStock: 0,
        minThreshold: 50,
        maxStock: 200,
        lastUpdatedBy: superadmin._id
      },
      // Condiments
      {
        name: 'Ketchup',
        categoryId: catA_Condiments._id,
        restaurantId: restaurantA._id,
        unit: 'litre',
        currentStock: 25,
        minThreshold: 10,
        maxStock: 40,
        lastUpdatedBy: superadmin._id
      },
      {
        name: 'Mayonnaise',
        categoryId: catA_Condiments._id,
        restaurantId: restaurantA._id,
        unit: 'litre',
        currentStock: 6,
        minThreshold: 5,
        maxStock: 20,
        lastUpdatedBy: superadmin._id
      }
    ]);

    // Restaurant B Inventory (partial)
    const catB_Veg = categoriesB.find(c => c.name === 'Vegetables')!;
    const catB_Meat = categoriesB.find(c => c.name === 'Meat')!;

    const inventoryB = await Inventory.insertMany([
      {
        name: 'Tomatoes',
        categoryId: catB_Veg._id,
        restaurantId: restaurantB._id,
        unit: 'kg',
        currentStock: 15,
        minThreshold: 10,
        maxStock: 50,
        lastUpdatedBy: superadmin._id
      },
      {
        name: 'Beef Patties',
        categoryId: catB_Meat._id,
        restaurantId: restaurantB._id,
        unit: 'pcs',
        currentStock: 80,
        minThreshold: 50,
        maxStock: 200,
        lastUpdatedBy: superadmin._id
      }
    ]);

    console.log(`Created ${inventoryA.length} inventory items for Restaurant A`);
    console.log(`Created ${inventoryB.length} inventory items for Restaurant B`);

    // ========== 5. CREATE INVENTORY LOGS ==========
    console.log('\n--- Creating Inventory Logs ---');
    
    // Create some sample logs for demonstration
    const lowStockItems = inventoryA.filter(item => 
      item.currentStock <= item.minThreshold
    );

    const logs = [];
    
    // Log for the out-of-stock potatoes
    const potatoes = inventoryA.find(i => i.name === 'Potatoes')!;
    logs.push({
      inventoryId: potatoes._id,
      restaurantId: restaurantA._id,
      action: 'REMOVE',
      quantity: -10,
      previousStock: 10,
      newStock: 0,
      note: 'Used for daily prep - ran out',
      createdBy: superadmin._id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    });

    // Log for low stock tomatoes
    const tomatoes = inventoryA.find(i => i.name === 'Tomatoes')!;
    logs.push({
      inventoryId: tomatoes._id,
      restaurantId: restaurantA._id,
      action: 'REMOVE',
      quantity: -20,
      previousStock: 25,
      newStock: 5,
      note: 'Heavy lunch rush',
      createdBy: superadmin._id,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    });

    // Log for adding beef patties
    const patties = inventoryA.find(i => i.name === 'Beef Patties')!;
    logs.push({
      inventoryId: patties._id,
      restaurantId: restaurantA._id,
      action: 'ADD',
      quantity: 100,
      previousStock: 50,
      newStock: 150,
      note: 'Morning delivery received',
      createdBy: superadmin._id,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
    });

    // Log for adjusting milk stock
    const milk = inventoryA.find(i => i.name === 'Milk')!;
    logs.push({
      inventoryId: milk._id,
      restaurantId: restaurantA._id,
      action: 'ADJUST',
      quantity: 2,
      previousStock: 6,
      newStock: 8,
      note: 'Correction: found extra cartons',
      createdBy: superadmin._id,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    });

    await InventoryLog.insertMany(logs);
    console.log(`Created ${logs.length} inventory logs`);

    // ========== SUMMARY ==========
    console.log('\n========================================');
    console.log('SEEDING COMPLETE!');
    console.log('========================================');
    console.log('\nTest Accounts:');
    console.log('  Superadmin: super@admin.com / password@superadmin');
    console.log('  Manager A: manager@restaurantA.com / password@manager');
    console.log('  Manager B: manager@restaurantB.com / password@manager');
    console.log('\nRestaurants:');
    console.log(`  - ${restaurantA.name} (${restaurantA._id})`);
    console.log(`  - ${restaurantB.name} (${restaurantB._id})`);
    console.log('\nLow Stock / Out of Stock Items:');
    lowStockItems.forEach(item => {
      const status = item.currentStock === 0 ? 'OUT' : 'LOW';
      const suggested = item.maxStock - item.currentStock;
      console.log(`  - ${item.name}: ${item.currentStock} ${item.unit} (${status}, suggest: +${suggested})`);
    });
    console.log('\n========================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
