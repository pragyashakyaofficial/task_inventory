# Restaurant Inventory Management System

A complete full-stack React Native + Node.js application for restaurant inventory management with AI-powered reorder planning.

## 🚀 Quick Start (Copy-Paste Commands)

### Prerequisites
- **Node.js** >= 18.0.0
- **MongoDB** running locally or MongoDB Atlas URI
- **React Native CLI** environment setup (Xcode for iOS, Android Studio for Android)
- **pnpm** (recommended) or npm for package management

### 1. Install Dependencies

**Using pnpm (Recommended):**
```bash
# From project root, install backend dependencies
cd backend && pnpm install

# From project root, install mobile dependencies  
cd mobile && pnpm install

# Return to project root
cd ..
```

**Using npm (Alternative):**
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

# Create mobile .env.dev file from example (if not exists)
cp mobile/.env.example mobile/.env.dev

# Edit backend/.env with your values:
# MONGO_URI=mongodb://localhost:27017/inventory_management
# GEMINI_API_KEY=your_gemini_api_key_here (optional)
# PORT=5000
# JWT_SECRET=your_jwt_secret_here
# JWT_EXPIRE=30d
# CLIENT_URL=http://localhost:3000

# Edit mobile/.env.dev with your backend URL:
# API_BASE_URL=http://localhost:5000
```

### 3. Seed the Database

```bash
# Using pnpm:
cd backend && pnpm seed

# Using npm:
cd backend && npm run seed
```

Expected output: Database populated with test restaurants, users, and inventory items.

### 4. Start Backend Server

```bash
# Using pnpm:
cd backend && pnpm start

# Using npm:
cd backend && npm start
```

Server will start on `http://localhost:5000` (or your configured PORT)

**Verify backend is running:**
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 5. TypeScript Compilation Check (Required for Submission)

```bash
# Backend TypeScript check
cd backend && pnpm type-check  # or npm run type-check

# Mobile TypeScript check  
cd mobile && npx tsc --noEmit
```

Both should pass with no errors. This is required for the hiring task.

### 6. Start Metro Bundler (Mobile)

Open a **new terminal** and run:

```bash
# Using pnpm:
cd mobile && pnpm start

# Using npm:
cd mobile && npm start
```

### 7. Run the Mobile App

**iOS:**
```bash
# Using pnpm:
cd mobile && pnpm ios

# Using npm:
cd mobile && npm run ios
```

**Android:**
```bash
# Using pnpm:
cd mobile && pnpm android

# Using npm:
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
| **Package Manager** | pnpm (recommended) or npm |

## 📋 Hiring Task Acceptance Criteria

✅ **Database Seeding** - `pnpm seed` or `npm run seed` populates DB with various stock states  
✅ **Reorder API** - `GET /api/inventory/reorder-plan` returns low/out-of-stock suggestions  
✅ **AI Fallback** - Gemini errors gracefully fallback without 500s  
✅ **Status Badges** - Inventory list shows correct status colors  
✅ **Lazy Loading** - Reorder plan fetched only on button tap  
✅ **Error States** - Loading, error, and empty states handled in UI  
✅ **TypeScript** - `tsc --noEmit` passes on both backend and mobile  
✅ **Public Endpoint** - Reorder plan API is public (no auth required) for demo purposes  

## 🔧 API Endpoints

### Inventory
- `GET /api/inventory` - List all inventory items
- `GET /api/inventory/reorder-plan` - **Public endpoint** - Get reorder suggestions (no auth required)
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
2. **AI Integration** - Gemini provides smart reorder suggestions with fallback
3. **Mobile UX** - Lazy loading with proper loading/error states
4. **Type Safety** - Full TypeScript implementation
5. **Public Access** - Reorder plan API is public for easy testing

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

