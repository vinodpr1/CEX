# CEX-V1 — Spot Market Exchange

A centralized cryptocurrency **spot market** exchange built with a decoupled architecture: an Express REST API handles user-facing operations, while a separate **matching engine** processes orders asynchronously over Redis queues.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Order Flow](#order-flow)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Development Status](#development-status)
- [Troubleshooting](#troubleshooting)

---

## Overview

CEX-V1 is a work-in-progress spot trading platform. Users can register, authenticate, and submit **limit** or **market** orders. Orders are pushed to a Redis queue, consumed by the matching engine, and results are routed back to the API via a per-request response queue.

Supported order types:

| Type    | Description                                      |
|---------|--------------------------------------------------|
| `limit` | Buy or sell at a specified price                 |
| `market`| Buy or sell immediately at the best available price |

Supported sides: `buy`, `sell`

---

## Architecture

The system is split into two independently runnable services that communicate only through Redis:

```
┌─────────────┐         Redis Queues          ┌─────────────────┐
│   Backend   │  ──►  incoming_order   ──►    │ Matching Engine │
│  (Express)  │  ◄──  filled_order*  ◄──    │    (Worker)     │
└──────┬──────┘                               └─────────────────┘
       │
       ▼
┌─────────────┐
│  PostgreSQL │  Users, Orders, Fills, Stocks
└─────────────┘
```

- **Backend** — REST API on port `3000`. Validates requests, authenticates users, enqueues orders, and waits for fill responses.
- **Engine** — Long-running worker. Pops orders from `incoming_order`, runs matching logic, and pushes results to a backend-specific `filled_order{queueName}` list.
- **Redis** — Message broker between API and engine (Upstash or any Redis 6+ instance).
- **PostgreSQL** — Persistent storage for users, orders, fills, and listed assets.

Each backend instance generates a unique `QUEUE_NAME` at startup so multiple API replicas can receive their own fill responses without collision.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Runtime      | [Bun](https://bun.sh)               |
| API          | Express 5, TypeScript               |
| Validation   | Zod                                 |
| Auth         | JWT (jsonwebtoken)                  |
| Database     | PostgreSQL + Prisma 7               |
| Message Queue| Redis 6 (`redis` npm package)       |
| Engine       | Bun worker (standalone process)     |

---

## Project Structure

```
CEX-V1/
├── backend/                    # REST API service
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middlewares/        # JWT auth middleware
│   │   ├── reposotories/     # Database access layer
│   │   ├── routes/             # Express route definitions
│   │   ├── services/         # Business logic
│   │   ├── types/              # Zod schemas & TypeScript types
│   │   ├── utils/              # Auth, engine client, validation helpers
│   │   └── index.ts            # App entry point
│   └── prisma/
│       ├── schema.prisma       # Database models
│       └── migrations/         # SQL migrations
│
└── engine/                     # Matching engine worker
    └── index.ts                # Engine entry point
```

---

## Prerequisites

Install the following before setting up the project:

- **[Bun](https://bun.sh)** v1.3+ (runtime & package manager)
- **PostgreSQL** (local or hosted — e.g. Neon, Supabase, Railway)
- **Redis** (local or hosted — e.g. [Upstash](https://upstash.com))

> **Upstash note:** Upstash requires TLS. Your `REDIS_URL` **must** use the `rediss://` scheme (double `s`), not `redis://`.

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/vinodpr1/CEX.git
cd CEX-V1
```

### 2. Set up the backend

```bash
cd backend
bun install
```

Create a `.env` file in the `backend/` directory (see [Environment Variables](#environment-variables) below).

Run database migrations:

```bash
bunx prisma migrate deploy
bun run prisma:generate
```

### 3. Set up the engine

```bash
cd ../engine
bun install
```

Create a `.env` file in the `engine/` directory with at least `REDIS_URL` (same Redis instance as the backend).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `DATABASE_URL` | Yes      | PostgreSQL connection string                     |
| `REDIS_URL`    | Yes      | Redis connection URL (`rediss://` for Upstash)   |
| `JWT_SECRET`   | Yes      | Secret key for signing JWT tokens                |

**Example:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cex
REDIS_URL=rediss://default:your-token@your-host.upstash.io:6379
JWT_SECRET=your-super-secret-key
```

### Engine (`engine/.env`)

| Variable    | Required | Description                                    |
|-------------|----------|------------------------------------------------|
| `REDIS_URL` | Yes      | Same Redis instance as the backend               |

---

## Running the Project

Both services must be running simultaneously. Open two terminal tabs:

**Terminal 1 — Backend API**

```bash
cd backend
bun dev
# Server starts on http://localhost:3000
```

**Terminal 2 — Matching Engine**

```bash
cd engine
bun index.ts
```

Verify the backend is healthy:

```bash
curl http://localhost:3000/health
# {"message":"Server is running","timestamp":"..."}
```

You should see `client is connected` in both terminals when Redis connects successfully.

---

## Order Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as Backend API
    participant Redis
    participant Engine as Matching Engine

    Client->>API: POST /api/order (JWT + order body)
    API->>API: Validate with Zod, generate identifier
    API->>Redis: LPUSH incoming_order {order + identifier + queueName}
    API->>API: Await filled_order{queueName} response
    Engine->>Redis: BRPOP incoming_order
    Engine->>Engine: Match limit / market order
    Engine->>Redis: LPUSH filled_order{queueName} {identifier, quantity}
    Redis->>API: BRPOP filled_order{queueName}
    API->>Client: Order response
```

1. Client sends an authenticated `POST /api/order` request.
2. Backend validates the payload and assigns a random `identifier` and `queueName`.
3. Order is pushed to the `incoming_order` Redis list.
4. Backend starts polling `filled_order{queueName}` for a response with matching `identifier`.
5. Engine pops the order, runs matching logic, and pushes the fill result back.
6. Backend resolves the pending promise and returns the result to the client.

---

## API Reference

Base URL: `http://localhost:3000/api`

### Authentication

Protected routes require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

### User

#### Sign Up

```
POST /api/user/signup
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response `201`:**

```json
{
  "userId": 1,
  "userName": "user@example.com",
  "token": "<jwt>",
  "message": "Signup success vv"
}
```

---

#### Sign In

```
POST /api/user/signin
```

**Body:** Same as sign up.

**Response `201`:**

```json
{
  "userId": 1,
  "userName": "user@example.com",
  "token": "<jwt>",
  "message": "Signun success"
}
```

---

### Orders

#### Create Order

```
POST /api/order
Authorization: Bearer <token>
```

**Limit order body:**

```json
{
  "type": "limit",
  "side": "buy",
  "symbol": "BTC",
  "qty": 1,
  "price": 50000
}
```

**Market order body:**

```json
{
  "type": "market",
  "side": "sell",
  "symbol": "ETH",
  "qty": 2
}
```

**Response `200`:**

```json
{
  "message": "Order created successfully"
}
```

---

### Other Endpoints (stubs — in progress)

| Method | Endpoint        | Auth | Description              |
|--------|-----------------|------|--------------------------|
| GET    | `/api/balance`  | No   | User balance (stub)      |
| GET    | `/api/depth`    | No   | Order book depth (stub)  |
| GET    | `/api/fills`    | No   | Trade history (stub)     |
| GET    | `/api/stock`    | No   | Listed assets (stub)     |
| GET    | `/health`       | No   | Health check             |

---

## Database Schema

Managed with Prisma. Key models:

| Model   | Purpose                                      |
|---------|----------------------------------------------|
| `User`  | Registered users (email + hashed password)   |
| `Order` | Submitted orders                             |
| `Stocks`| Tradeable asset symbols                      |
| `Fill`  | Executed trade records (qty, side, type, price) |

Enums:

- `enumSide`: `BUY`, `Sell`
- `enumType`: `MARKET`, `LIMIT`

Apply schema changes:

```bash
cd backend
bunx prisma migrate dev --name <migration_name>
bun run prisma:generate
```

Open Prisma Studio to inspect data:

```bash
bunx prisma studio
```

---

## Development Status

| Feature                        | Status          |
|--------------------------------|-----------------|
| User signup / signin (JWT)     | ✅ Done          |
| Order submission (limit/market)| ✅ Done          |
| Redis queue communication      | ✅ Done          |
| Engine order consumption       | ✅ Done          |
| Limit order matching logic     | 🚧 In progress  |
| Market order matching logic    | 🚧 In progress  |
| Order book / depth             | 🚧 Stub          |
| User balances                  | 🚧 Stub          |
| Trade fills history            | 🚧 Stub          |
| Stock listing                  | 🚧 Stub          |
| Persisting fills to PostgreSQL | 🚧 Pending       |

---

## Troubleshooting

### `Socket closed unexpectedly` on Redis connect

Your Redis URL is likely missing TLS. For Upstash, change:

```
redis://...   →   rediss://...
```

Restart both the backend and engine after updating `.env`.

### Engine not picking up orders

- Confirm both services use the **same** `REDIS_URL`.
- Confirm the engine process is running (`bun index.ts` in the `engine/` directory).
- Check that `incoming_order` is the queue name in both backend and engine.

### `Unauthorized` on order requests

Obtain a JWT via `/api/user/signin` or `/api/user/signup` and pass it as:

```
Authorization: Bearer <your-token>
```

### Database connection errors

- Verify `DATABASE_URL` in `backend/.env`.
- Run `bunx prisma migrate deploy` to apply pending migrations.

---

## License

Private — not for public distribution.
