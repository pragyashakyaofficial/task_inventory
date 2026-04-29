# Restaurant Inventory Management System

A complete full-stack React Native + Node.js application for restaurant inventory management with AI-powered reorder planning.

## 🚀 Quick Start (Copy-Paste Commands)

### Prerequisites
- **Node.js** >= 18.0.0
- **MongoDB** running locally or MongoDB Atlas URI
- **React Native CLI** environment setup (Xcode for iOS, Android Studio for Android)

### 1. Install Dependencies

```bash
# From project root, install backend dependencies
cd backend && npm install

# From project root, install mobile dependencies  
cd mobile && npm install

# Return to project root
cd ..
```

### 2. Set Environment Variables

```bash
# Create backend .env file from example
cp backend/.env.example backend/.env

# Edit backend/.env with your values:
# MONGO_URI=mongodb://localhost:27017/inventory_management
# GEMINI_API_KEY=your_gemini_api_key_here (optional)
# PORT=5000
# JWT_SECRET=your_jwt_secret_here
# JWT_EXPIRE=30d
```

### 3. Seed the Database

```bash
cd backend && npm run seed
```

Expected output: Database populated with test restaurants, users, and inventory items.

### 4. Start Backend Server

```bash
cd backend && npm run seed
```

Server will start on `http://localhost:5000` (or your configured PORT)

**Verify backend is running:**
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 5. TypeScript Compilation Check (Optional but recommended)

```bash
# Backend TypeScript check
cd backend && npm run type-check

# Mobile TypeScript check  
cd mobile && npx tsc --noEmit
```

Both should pass with no errors.

### 6. Start Metro Bundler (Mobile)

Open a **new terminal** and run:

```bash
cd mobile && npm start
```

### 7. Run the Mobile App

**iOS:**
```bash
cd mobile && npm run ios
```

**Android:**
```bash
cd mobile && npm run android
```

### 8. Test the Reorder Planner Feature

1. **Login** with test account:
   - Email: `manager@restaurantA.com`
   - Password: `password@manager`

2. **Navigate to Inventory** tab

3. **Tap "Plan Reorder"** button to trigger AI analysis

4. **View results** showing low/out-of-stock items with reorder suggestions

## 📱 Features

- **Real-time Inventory Tracking** - Monitor stock levels with status badges
- **AI Reorder Planning** - Smart suggestions for low stock items (Gemini AI)
- **Restaurant Management** - Multi-restaurant support with role-based access
- **Stock Analytics** - Dashboard with critical alerts and statistics
- **Mobile First** - React Native CLI with TypeScript

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Mobile** | React Native CLI, TypeScript, Redux Toolkit, RTK Query |
| **Backend** | Node.js, Express, TypeScript, MongoDB, Mongoose |
| **AI** | Google Gemini (optional) |
| **Database** | MongoDB with Mongoose ODM |

## 📋 Acceptance Criteria

✅ **Database Seeding** - `npm run seed` populates DB with various stock states  
✅ **Reorder API** - `GET /api/inventory/reorder-plan` returns low/out-of-stock suggestions  
✅ **AI Fallback** - Gemini errors gracefully fallback without 500s  
✅ **Status Badges** - Inventory list shows correct status colors  
✅ **Lazy Loading** - Reorder plan fetched only on button tap  
✅ **Error States** - Loading, error, and empty states handled in UI  
✅ **TypeScript** - `tsc --noEmit` passes on both backend and mobile  

## 🔧 API Endpoints

### Inventory
- `GET /api/inventory` - List all inventory items
- `GET /api/inventory/reorder-plan` - Get reorder suggestions
- `GET /api/inventory/stats` - Inventory statistics
- `POST /api/inventory` - Create new item
- `PATCH /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## 🎯 Reorder Planner Feature

The core feature demonstrates:
1. **Backend Intelligence** - Analyzes stock levels against thresholds
2. **AI Integration** - Gemini provides smart reorder suggestions
3. **Mobile UX** - Lazy loading with proper loading/error states
4. **Type Safety** - Full TypeScript implementation

## 📱 Test Accounts

After seeding, use these accounts:
- **Manager**: `manager@restaurantA.com` / `password@manager`
- **Superadmin**: `super@admin.com` / `password@superadmin`

## 🚀 Complete Build & Run Workflow

### Full Setup (First Time)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd inventory_mgt

# 2. Install all dependencies
(cd backend && npm install) && (cd mobile && npm install)

# 3. Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and optional Gemini API key

# 4. Seed database
cd backend && npm run seed

# 5. Start backend (Terminal 1)
cd backend && npm start

# 6. Start Metro (Terminal 2)
cd mobile && npm start

# 7. Run mobile app (Terminal 3)
cd mobile && npm run ios    # or npm run android
```

### Development Mode (After Setup)

**Terminal 1 - Backend:**
```bash
cd backend && npm start
```

**Terminal 2 - Metro:**
```bash
cd mobile && npm start
```

**Terminal 3 - Mobile App:**
```bash
cd mobile && npm run ios     # iOS
# OR
cd mobile && npm run android # Android
```

### Build Commands

**Backend:**
```bash
cd backend
npm run type-check    # TypeScript validation
npm run seed          # Reset database with test data
npm start             # Start server
```

**Mobile:**
```bash
cd mobile
npx tsc --noEmit      # TypeScript validation
npm start             # Start Metro bundler
npm run ios           # Run iOS app
npm run android       # Run Android app
```

### Environment Variables

Create `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/inventory_management
GEMINI_API_KEY=your_gemini_api_key_here (optional)
PORT=5000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
NODE_ENV=development
```

### Troubleshooting

**Backend won't start:**
- Check MongoDB is running: `mongod --version`
- Verify `.env` file exists: `ls backend/.env`
- Check port availability: `lsof -i :5000`

**Mobile won't build:**
- iOS: Run `cd mobile/ios && pod install`
- Android: Check Android Studio SDK is installed
- Clear cache: `cd mobile && npm start -- --reset-cache`

**Android specific errors (path issues):**
```bash
cd mobile
rm -rf android/build android/app/build android/.gradle
rm -rf node_modules
npm install
npx react-native doctor  # Check environment
cd android && ./gradlew clean
```

**If you see "inventoryApp" path errors:**
The build may be caching old paths. Run:
```bash
cd mobile/android
./gradlew clean
rm -rf ~/.gradle/caches
find . -name "local.properties" -delete
cd .. && rm -rf node_modules && npm install
```

**TypeScript errors:**
- Backend: `cd backend && npm run type-check`
- Mobile: `cd mobile && npx tsc --noEmit`

### Verification Steps

1. **Backend running:** `curl http://localhost:5000/api/health`
2. **Database seeded:** Check low stock items exist
3. **Reorder API working:** `curl http://localhost:5000/api/inventory/reorder-plan`
4. **TypeScript compiles:** Both projects pass `tsc --noEmit`
5. **Mobile app loads:** App opens without red screen errors

## 📄 Project Structure

```
inventory-mgt/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic + AI
│   ├── seed.js             # Database seeding
│   └── tsconfig.json       # TypeScript config
└── mobile/                 # React Native CLI + TypeScript
    ├── src/
    │   ├── api/           # RTK Query API slices
    │   ├── components/    # Reusable UI components
    │   ├── features/      # Feature-based modules
    │   └── navigation/    # React Navigation setup
    └── App.tsx           # Main app component
```

## 🎥 Demo Walkthrough

The reorder planner feature showcases:
1. **Dashboard** - Shows critical stock alerts
2. **Inventory List** - Color-coded status badges
3. **Reorder Button** - Triggers lazy AI analysis
4. **Results Modal** - Displays smart reorder suggestions

