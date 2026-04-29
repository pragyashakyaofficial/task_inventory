# Restaurant Inventory Reorder Planner

A simplified full-stack React Native + Node.js application for restaurant managers to view inventory status and generate AI-powered reorder plans.

## 🚀 Quick Start (Copy-Paste Commands)

### Prerequisites
- **Node.js** >= 18.0.0
- **MongoDB** running locally or MongoDB Atlas URI
- **React Native CLI** environment setup (Android Studio for Android)
- **pnpm** (recommended) or npm

### 1. Install

```bash
# Install backend dependencies
cd backend && pnpm install

# Install mobile dependencies  
cd ../mobile && pnpm install
```

### 2. Environment Setup

```bash
# Backend env
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI

# Mobile env
cd ../mobile
cp .env.example .env.dev
# Edit .env.dev with your backend URL (e.g., http://192.168.1.x:5000)
```

### 3. Seed Database

```bash
cd backend
pnpm seed
```

Creates: 1 restaurant, 1 manager user, 9 inventory items (in-stock, low-stock, out-of-stock)

### 4. Start Backend

```bash
cd backend
pnpm dev
```

Server runs on `http://localhost:5000`

### 5. Start Mobile

```bash
# Terminal 1: Start Metro
cd mobile
pnpm start

# Terminal 2: Run Android
cd mobile
npx react-native run-android
```

### 6. Login & Test

- **Email:** `manager@restaurant.com`
- **Password:** `manager123`

**Flow:** Dashboard → Tap "Reorder Plan" → Generate Plan → View Suggestions

### TypeScript Check (Required)

```bash
# Backend
cd backend && npx tsc --noEmit

# Mobile
cd mobile && npx tsc --noEmit
```

## 📱 Features

- **Dashboard** - Stats (Total, In Stock, Low Stock, Out of Stock) + Critical items list
- **Inventory List** - All items with status badges (OK / LOW / OUT)
- **Reorder Plan** - Lazy fetch: API only called when "Generate Plan" button tapped
- **AI + Fallback** - Uses Gemini AI if available, otherwise calculates based on stock levels

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Mobile** | React Native CLI, TypeScript, Redux Toolkit, RTK Query |
| **Backend** | Node.js, Express, TypeScript, MongoDB, Mongoose |
| **AI** | Google Gemini (optional) |
| **Database** | MongoDB with Mongoose ODM |
| **Package Manager** | pnpm (recommended) or npm |

## ✅ Acceptance Criteria

- [x] **Seed Script** - `pnpm seed` inserts sample data (users + items)
- [x] **Status Badges** - OK 🟢 / LOW 🟡 / OUT 🔴 on inventory items
- [x] **Lazy Fetch** - API only called when button clicked
- [x] **UI States** - Loading ⏳ / Error ❌ / Empty 📭 handled
- [x] **AI Fallback** - Try AI first, fallback to normal logic on error
- [x] **TypeScript** - `tsc --noEmit` passes (0 errors)  

## 🔧 API Endpoints

### Inventory
- `GET /api/inventory` - List all inventory items
- `GET /api/inventory/reorder-plan` - Get reorder suggestions (lazy load endpoint)
- `GET /api/inventory/stats` - Dashboard statistics

### Authentication
- `POST /api/auth/login` - User login

## 🎯 App Workflow

1. **Login** - Manager enters credentials
2. **Dashboard** - See stats and critical items (low/out of stock)
3. **Inventory Tab** - View all items with status badges
4. **Reorder Plan Tab** - 
   - Initial: "Generate Plan" button shown
   - On tap: API called, loading state shown
   - Success: List of items to reorder with quantities
   - Error: "Something went wrong" with retry button
   - Empty: "Everything is well stocked" message

## 🎯 Reorder Planner Logic

**Backend Calculation:**
```
Tomato: Stock=2, Min=10, Max=50 → Suggest: order 8 more
Cheese: Stock=0, Min=5, Max=20 → Suggest: order 5 more
Chicken: Stock=20, Min=10 → No suggestion (OK status)
```

**AI Fallback:**
```
try {
  // Call Gemini AI for smart suggestions
} catch {
  // Fallback: maxStock - currentStock for low/out items
}
```

## 📱 Test Account

After `pnpm seed`:
- **Email:** `manager@restaurant.com`
- **Password:** `manager123`

**Sample Data:**
- 3 In-Stock items (Onions, Potatoes, Milk)
- 3 Low-Stock items (Tomatoes, Cheese, Chicken)
- 3 Out-of-Stock items (Lettuce, Butter, Beef)

## 🚀 Complete Build & Run Workflow

### Full Setup (First Time)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd inventory_mgt

# 2. Install all dependencies (using pnpm recommended)
(cd backend && pnpm install) && (cd mobile && pnpm install)
# OR using npm:
(cd backend && npm install) && (cd mobile && npm install)

# 3. Setup environment
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env.dev
# Edit backend/.env with your MongoDB URI and optional Gemini API key
# Edit mobile/.env.dev with your backend URL

# 4. Seed database
cd backend && pnpm seed  # or npm run seed

# 5. Start backend (Terminal 1)
cd backend && pnpm start  # or npm start

# 6. Start Metro (Terminal 2)
cd mobile && pnpm start  # or npm start

# 7. Run mobile app (Terminal 3)
cd mobile && pnpm ios    # or npm run ios
# OR
cd mobile && pnpm android # or npm run android
```

### Development Mode (After Setup)

**Terminal 1 - Backend:**
```bash
cd backend && pnpm start  # or npm start
```

**Terminal 2 - Metro:**
```bash
cd mobile && pnpm start  # or npm start
```

**Terminal 3 - Mobile App:**
```bash
cd mobile && pnpm ios     # iOS
# OR
cd mobile && pnpm android # Android
```

### Build Commands

**Backend:**
```bash
cd backend
pnpm type-check    # TypeScript validation (or npm run type-check)
pnpm seed          # Reset database with test data (or npm run seed)
pnpm start         # Start server (or npm start)
```

**Mobile:**
```bash
cd mobile
npx tsc --noEmit      # TypeScript validation
pnpm start         # Start Metro bundler (or npm start)
pnpm ios           # Run iOS app (or npm run ios)
pnpm android       # Run Android app (or npm run android)
```

### Environment Variables

**Create `backend/.env`:**
```
MONGO_URI=mongodb://localhost:27017/inventory_management
GEMINI_API_KEY=your_gemini_api_key_here (optional)
PORT=5000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Create `mobile/.env.dev`:**
```
API_BASE_URL=http://localhost:5000
```

### Troubleshooting

**Backend won't start:**
- Check MongoDB is running: `mongod --version`
- Verify `.env` file exists: `ls backend/.env`
- Check port availability: `lsof -i :5000`
- Verify seed script works: `cd backend && pnpm seed` (or `npm run seed`)

**Mobile won't build:**
- iOS: Run `cd mobile/ios && pod install`
- Android: Check Android Studio SDK is installed
- Clear cache: `cd mobile && pnpm start -- --reset-cache` (or `npm start -- --reset-cache`)
- Verify mobile .env.dev exists: `ls mobile/.env.dev`

**Android specific errors (path issues):**
```bash
cd mobile
rm -rf android/build android/app/build android/.gradle
rm -rf node_modules
pnpm install  # or npm install
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
cd .. && rm -rf node_modules && pnpm install  # or npm install
```

**TypeScript errors:**
- Backend: `cd backend && pnpm type-check` (or `npm run type-check`)
- Mobile: `cd mobile && npx tsc --noEmit`
- Both must pass for hiring task submission

### Verification Steps (Required for Hiring Task)

1. **Backend running:** `curl http://localhost:5000/api/health`
2. **Database seeded:** Check low stock items exist
3. **Reorder API working:** `curl http://localhost:5000/api/inventory/reorder-plan`
4. **TypeScript compiles:** Both projects pass `tsc --noEmit` ✅
5. **Mobile app loads:** App opens without red screen errors
6. **Reorder feature works:** Tap "Plan Reorder" button in mobile app

## 📄 Project Structure

```
inventory-mgt/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic + AI
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   ├── seed.ts             # Database seeding (TypeScript)
│   ├── tsconfig.json       # TypeScript config
│   └── package.json        # Dependencies and scripts
└── mobile/                 # React Native CLI + TypeScript
    ├── src/
    │   ├── api/           # RTK Query API slices
    │   ├── components/    # Reusable UI components
    │   ├── features/      # Feature-based modules
    │   └── navigation/    # React Navigation setup
    ├── .env.dev           # Mobile environment variables
    └── package.json       # Dependencies and scripts
```

## 🎥 Demo Walkthrough (For Loom Recording)

The reorder planner feature showcases:
1. **Dashboard** - Shows critical stock alerts
2. **Inventory List** - Color-coded status badges (In Stock/Low Stock/Out of Stock)
3. **Reorder Button** - Triggers lazy AI analysis (only on button tap)
4. **Results Modal** - Displays smart reorder suggestions with AI fallback

## 🎯 Hiring Task Submission Checklist

- [ ] Backend TypeScript: `cd backend && npx tsc --noEmit` passes
- [ ] Mobile TypeScript: `cd mobile && npx tsc --noEmit` passes
- [ ] Database seeded: `pnpm seed` or `npm run seed` works
- [ ] Reorder API: `GET /api/inventory/reorder-plan` returns suggestions
- [ ] AI fallback: Works without Gemini API key
- [ ] Status badges: Correct colors in mobile UI
- [ ] Lazy loading: Reorder plan only on button tap
- [ ] Error states: Loading/error/empty states handled
- [ ] README: Copy-paste commands work on fresh machine

