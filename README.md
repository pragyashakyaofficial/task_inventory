# Restaurant Inventory Management — Reorder Planner

A full-stack restaurant inventory management app with an AI-powered Reorder Planner. When a manager taps a button, the app analyses which ingredients are running low and returns reorder suggestions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native CLI (not Expo), TypeScript |
| State / API | Redux Toolkit + RTK Query |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| AI | Google Gemini (optional, with fallback) |

## Project Structure

```
inventory_mgt/
├── backend/          # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth & error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API route definitions
│   │   ├── scripts/      # Database seed script
│   │   ├── services/     # AI & stock logic
│   │   ├── types/        # TypeScript type extensions
│   │   ├── utils/        # Custom error class
│   │   └── server.ts     # Entry point
│   └── package.json
│
└── mobile/           # React Native CLI + TypeScript
    ├── src/
    │   ├── api/          # RTK Query API slices
    │   ├── components/   # Shared UI components
    │   ├── config/       # Environment config
    │   ├── features/     # Feature-based screens
    │   ├── hooks/        # Custom hooks
    │   ├── navigation/   # React Navigation setup
    │   ├── store/        # Redux store
    │   ├── theme/        # Colors & styles
    │   └── utils/        # Utilities
    └── package.json
```

---

## Quick Start

### Prerequisites

- **Node.js** v18+
- **pnpm** — `npm install -g pnpm`
- **MongoDB** running locally

### 1. Install dependencies

```bash
# Backend
cd backend
pnpm install

# Mobile (in a new terminal)
cd mobile
pnpm install
```

### 2. Set environment variables

Create `backend/.env` from the example:

```bash
cd backend
cp .env.example .env
```

Required variables in `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/inventoryDB
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5001
JWT_SECRET=your_jwt_secret_key_here
```

> `GEMINI_API_KEY` is optional — the app uses deterministic fallback logic when the key is missing or the API fails.
> `JWT_SECRET` defaults to a dev value if not set, but should be changed for production.

Create `mobile/.env.dev` from the example:

```bash
cd mobile
cp .env.example .env.dev
```

Set `API_BASE_URL` in `mobile/.env.dev`:
- **iOS Simulator**: `http://localhost:5001/api`
- **Android Emulator**: `http://10.0.2.2:5001/api`
- **Physical Device**: `http://<your-computer-ip>:5001/api`

### 3. Run the seed script

```bash
cd backend
pnpm seed
```

This populates the DB with 9 inventory items across 3 stock states (in-stock, low-stock, out-of-stock).

### 4. Start the backend dev server

```bash
cd backend
pnpm dev
```

### 5. Start the Metro bundler

```bash
cd mobile

# Android
pnpm android:dev

# iOS (Mac only)
pnpm ios:dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/stats` | Dashboard statistics |
| GET | `/api/inventory/reorder-plan` | AI-powered reorder suggestions for low/out-of-stock items |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/health` | Health check |

### Reorder Plan Example

```bash
curl http://localhost:5001/api/inventory/reorder-plan
```

Returns suggestions with `shouldReorder`, `suggestedQuantity`, and `reason` for each item that needs attention.

---

## Key Design Decisions

### Backend: Graceful AI Fallback

The `aiService.ts` never throws — if Gemini is unavailable, returns a malformed response, or the API key is missing, the service falls back to deterministic logic (`minThreshold - currentStock`). This ensures the reorder plan **always** returns useful data, never a 500 error.

### Frontend: Lazy Fetching with RTK Query

The reorder plan uses `useLazyGetReorderPlanQuery()` — data is only fetched when the user explicitly taps the "Reorder Plan" button on the dashboard. This avoids unnecessary API calls and AI processing on every screen load.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot connect to MongoDB` | Make sure MongoDB is running: `brew services start mongodb-community` |
| `Network error` on mobile | Check `API_BASE_URL` in `mobile/.env.dev` matches your backend |
| Android emulator can't reach backend | Use `http://10.0.2.2:5001/api` instead of `localhost` |
| `Metro bundler cache issues` | Run `pnpm start:dev -- --reset-cache` |
| Login fails after seed | Re-run: `pnpm seed` |
