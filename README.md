# XenoCopilot — AI-Powered CRM Platform

> An intelligent, AI-first CRM campaign platform built for fashion retail brands. Marketers type a natural-language goal, get AI-generated audience segments and personalized message drafts, launch multi-channel campaigns, and watch real-time delivery analytics — all in one sleek interface.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Backend API Reference](#backend-api-reference)
- [Frontend Pages](#frontend-pages)
- [AI Engine](#ai-engine)
- [Campaign Lifecycle](#campaign-lifecycle)
- [Customer Intelligence](#customer-intelligence)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Key Design Decisions](#key-design-decisions)

---

## Overview

XenoCopilot is a full-stack, AI-native CRM built with the following core capabilities:

| Capability | Description |
|---|---|
| **Natural Language Segmentation** | Converts marketer goals into SQL `WHERE` clauses via Gemini AI |
| **Persona Engine** | Auto-assigns customers into behavioral segments (VIP, Beauty Loyalist, At Risk, etc.) |
| **AI Message Drafting** | Generates 2 personalized message variants (A/B) per campaign per channel |
| **Multi-Channel Campaigns** | Supports Email, WhatsApp, and SMS |
| **Funnel Analytics** | Tracks Sent → Delivered → Opened → Clicked → Purchased lifecycle |
| **Revenue Attribution** | Maps order revenue back to the originating campaign |
| **Customer 360** | Unified customer profile view with health score, personas, order history |

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        XenoCopilot                         │
│                                                            │
│   ┌──────────────────────┐    ┌──────────────────────────┐ │
│   │   FRONTEND (Next.js) │    │   BACKEND (Fastify API)  │ │
│   │   Port :3000         │◄──►│   Port :3001             │ │
│   │                      │    │                          │ │
│   │  /revenue            │    │  /api/campaigns          │ │
│   │  /chat               │    │  /api/campaigns/:id      │ │
│   │  /engagement         │    │  /api/campaigns/:id/     │ │
│   │  /intelligence       │    │    insights              │ │
│   │  /import             │    │  /api/customers          │ │
│   │  /architecture       │    │  /api/customers/stats    │ │
│   │                      │    │  /api/personas           │ │
│   └──────────────────────┘    │  /api/ai/segment         │ │
│                               │  /api/ai/draft-messages  │ │
│                               │  /api/ai/launch-campaign │ │
│                               │  /api/ai/strategize      │ │
│                               │  /api/revenue/insights   │ │
│                               └──────────┬───────────────┘ │
│                                          │                  │
│                               ┌──────────▼───────────────┐ │
│                               │  PostgreSQL (Neon/local)  │ │
│                               │  Redis (Upstash/local)    │ │
│                               └──────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

The system is a **pnpm monorepo** with two workspace packages:
- `backend/` — Fastify REST API server + Prisma ORM
- `frontend/` — Next.js 14 App Router

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Server components, fast routing, easy API proxying |
| **Styling** | Vanilla CSS + custom design tokens | Full control, no Tailwind lock-in |
| **Backend** | Fastify 4 + TypeScript | ~3x faster than Express, great TS DX, schema validation |
| **ORM** | Prisma | Type-safe queries, easy migrations, clear schema |
| **Database** | PostgreSQL | Relational integrity for customer/order/campaign data |
| **Cache** | Redis (Upstash) | Campaign insights caching, AI summary caching |
| **Primary AI** | Gemini 2.5 Flash (Google) | Structured JSON output, fast inference |
| **Fallback AI** | Groq (LLaMA 3.3 70B) | Free-tier fallback when Gemini keys are rate-limited |
| **Validation** | Zod | Runtime schema validation for all API inputs |
| **Package Manager** | pnpm workspaces | Fast installs, monorepo support |

---

## Project Structure

```
XenoCopilot/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          ← Database schema (single source of truth)
│   └── src/
│       ├── lib/
│       │   ├── prisma.ts          ← Prisma client singleton
│       │   ├── redis.ts           ← Redis client (Upstash / local)
│       │   └── queue.ts           ← BullMQ queue setup
│       ├── routes/
│       │   ├── ai.ts              ← All AI endpoints (segment, draft, launch, strategize)
│       │   ├── campaigns.ts       ← CRUD + /insights funnel endpoint
│       │   ├── customers.ts       ← Customer list, stats, detail, personas
│       │   ├── revenue.ts         ← Revenue operations insights
│       │   ├── import.ts          ← CSV data import endpoint
│       │   └── webhooks.ts        ← Channel delivery callbacks
│       ├── seed.ts                ← Seeds 300 customers, 1500 orders, personas
│       └── index.ts               ← Fastify server bootstrap
│
├── frontend/
│   └── src/
│       ├── app/
│       │   └── (main)/
│       │       ├── revenue/        ← Revenue Operations dashboard
│       │       ├── chat/           ← Campaign Studio (AI chat)
│       │       ├── engagement/     ← Campaign list + detail
│       │       │   └── [id]/       ← Campaign funnel analytics
│       │       ├── intelligence/   ← Customer 360 / persona browser
│       │       │   └── [id]/       ← Individual customer profile
│       │       ├── personas/       ← Persona management
│       │       ├── import/         ← CSV data import UI
│       │       └── architecture/   ← System architecture view
│       ├── components/
│       │   └── layout/
│       │       └── Sidebar.tsx     ← Global navigation sidebar
│       └── lib/
│           └── api/                ← Typed API client functions
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## Database Schema

```prisma
model Customer {
  id               String    @id @default(uuid())
  name             String
  email            String    @unique
  phone            String
  city             String
  signup_date      DateTime
  total_spent      Decimal   @default(0)
  last_order_date  DateTime?
  health_score     Int       @default(100)   // 0-100, computed on seed/update
  preferred_channel String?

  orders           Order[]
  customer_personas CustomerPersona[]
  communications   Communication[]
}

model Persona {
  id          String @id @default(uuid())
  name        String // e.g. "VIP Customer", "Beauty Loyalist"
  description String

  customers   CustomerPersona[]
  campaigns   Campaign[]
}

model CustomerPersona {
  customer_id String
  persona_id  String
  customer    Customer @relation(fields: [customer_id], references: [id])
  persona     Persona  @relation(fields: [persona_id], references: [id])
  @@id([customer_id, persona_id])
}

model Order {
  id           String   @id @default(uuid())
  customer_id  String
  amount       Decimal
  category     String   // Beauty, Apparel, Footwear, Accessories
  discount_used Boolean  @default(false)
  order_date   DateTime
  campaign_id  String?  // Attribution: which campaign influenced this order

  customer     Customer @relation(...)
  campaign     Campaign? @relation(...)
}

model Campaign {
  id          String   @id @default(uuid())
  name        String
  persona_id  String
  channel     String   // WhatsApp | Email | SMS
  message     String
  status      String   @default("draft")
  created_at  DateTime @default(now())

  persona          Persona         @relation(...)
  communications   Communication[]
  orders           Order[]
}

model Communication {
  id          String   @id @default(uuid())
  campaign_id String
  customer_id String
  status      String   @default("pending")
  // Status flow: pending → sent → delivered → opened → clicked → purchased

  campaign    Campaign @relation(...)
  customer    Customer @relation(...)
}

model ChannelMetric {
  id              String  @id @default(uuid())
  channel         String  @unique // WhatsApp | Email | SMS
  ctr             Decimal // Click-Through Rate %
  open_rate       Decimal // Open Rate %
  conversion_rate Decimal // Purchase Conversion Rate %
}
```

---

## Backend API Reference

### AI Routes (`/api/ai/*`)

#### `POST /api/ai/segment`
Converts a natural-language goal into a SQL `WHERE` clause, runs it against the `customers` table, and returns audience metrics.

**Request:**
```json
{ "goal": "Win back VIP customers who haven't purchased in 90 days" }
```

**Response:**
```json
{
  "id": "dyn_1234567890",
  "name": "Win-back",
  "count": 77,
  "channel": "WhatsApp",
  "expectedRevenue": 28746,
  "conversionRate": 2.4,
  "aov": "₹22,752",
  "risk": "High",
  "audienceMatch": "Medium"
}
```

**How it works:**
1. Sends the goal to Gemini with a prompt instructing it to return a JSON `{ where_clause, channel, goal_type }`.
2. Executes `SELECT COUNT(*) FROM customers WHERE <ai_generated_clause>` via `prisma.$queryRawUnsafe()`.
3. Looks up `ChannelMetric` for the recommended channel to calculate `expectedRevenue = expectedPurchasers × AOV`.

---

#### `POST /api/ai/draft-messages`
Generates 2 personalized A/B message variants for a persona + channel combination.

**Request:**
```json
{ "persona_name": "VIP Customer", "channel": "WhatsApp" }
```

**Response:**
```json
{
  "variantA": "Hi {{first_name}}, it's been 42 days since your last purchase — your skin misses you. Shop your usual routine at 15% off, today only.",
  "variantB": "You're among our top VIPs, {{first_name}}. We've reserved early access to our new collection based on your skincare history."
}
```

---

#### `POST /api/ai/launch-campaign`
Creates a campaign, assigns communications to all customers in the target persona, and simulates a realistic delivery funnel.

**Request:**
```json
{
  "name": "VIP Retention - June",
  "persona_id": "uuid-of-vip-persona",
  "channel": "Email",
  "message": "Hi {{first_name}}, we have something special for you..."
}
```

**How the funnel is simulated:**
```
For each customer in the persona:
  r = random()
  if r < 0.98  → "delivered"
  if r < openRate (e.g. 0.35) → "opened"
  if r < ctr (e.g. 0.05) → "clicked"
  if r < conversionRate (e.g. 0.012) → "purchased"
```
Rates are pulled live from the `ChannelMetric` table.

---

#### `POST /api/ai/strategize`
Full Revenue Strategy Agent — given a goal, runs a multi-step chain:
1. Segments the audience via SQL
2. Finds the best channel
3. Calculates revenue opportunity
4. Returns a complete strategy summary with confidence intervals

---

### Campaign Routes (`/api/campaigns/*`)

#### `GET /api/campaigns`
Lists all campaigns ordered by `created_at` descending.

#### `GET /api/campaigns/:id`
Returns a single campaign with its persona name, channel, status, and message.

#### `GET /api/campaigns/:id/insights`
The analytics powerhouse. Joins the `communications` table for a given campaign and computes the full funnel:

```
STATUS_PRIORITY = { pending: 0, sent: 1, delivered: 2, opened: 3, clicked: 4, purchased: 5 }

total     = communications.length
sent      = count where status >= "sent"
delivered = count where status >= "delivered"
opened    = count where status >= "opened"
clicked   = count where status >= "clicked"
purchased = count where status == "purchased"
```

Revenue attribution: For every `purchased` communication, looks up the customer's historical Average Order Value (`SUM(amount) / COUNT(orders)`).

Also fires an async Gemini call to generate a 2-sentence strategic AI summary, cached in Redis for 1 hour.

**Response:**
```json
{
  "campaign": { "name": "...", "persona": "VIP Customer", "channel": "Email" },
  "funnel": {
    "total": 90,
    "sent": 89, "sentRate": "98.9%",
    "delivered": 87, "deliveredRate": "97.8%",
    "opened": 31, "openRate": "35.6%",
    "clicked": 5, "clickRate": "16.1%",
    "purchased": 1, "purchaseRate": "1.1%"
  },
  "revenue": {
    "actual": 22752,
    "predicted": 2700,
    "performanceVsPrediction": "+742.7%"
  },
  "aiSummary": "Email campaigns targeting VIP customers generated 8.4x more revenue than predicted baseline...",
  "recentEvents": [...]
}
```

---

### Customer Routes (`/api/customers/*`)

#### `GET /api/customers`
Paginated customer list with full-text search across `name`, `email`, `phone`, `city`, and persona names. Also supports `?persona=VIP Customer` filter.

#### `GET /api/customers/stats`
Computes aggregate stats across all customers:
- Active (ordered in last 90 days)
- At Risk (health_score < 40)
- VIP count
- Dormant (no orders in 90+ days)
- Average LTV, Average AOV
- Health score distribution histogram
- Top personas by count and revenue

#### `GET /api/customers/:id`
Full customer profile with all orders and assigned personas.

#### `GET /api/personas`
Returns all defined personas.

---

## Frontend Pages

### Revenue Operations (`/revenue`)
**Purpose:** Command center — the marketer's first stop every day.

- **KPI Strip (5 cards):** Revenue Influenced, Revenue at Risk, Top Opportunity, Best Channel, Recommended Action
- **Revenue Opportunities Table:** Pre-analyzed segments ranked by revenue potential with a "Generate Campaign" deep-link
- **Quick Actions:** Shortcuts to Campaign Studio, Customer 360, Data Import

> Clicking "Generate Campaign" passes the opportunity name as `?audience=` query param to Campaign Studio, which auto-fills and auto-submits the chatbox.

---

### Campaign Studio (`/chat`)
**Purpose:** AI-first campaign creation via natural language.

**User Flow:**
1. Marketer types a goal (or clicks a pre-built opportunity) into the command bar
2. **Step 1 — Segment:** `POST /api/ai/segment` → returns audience count, AOV, risk, recommended channel
3. **Step 2 — Draft Messages:** `POST /api/ai/draft-messages` → returns 2 A/B variants
4. UI renders:
   - **Why This Campaign?** — dynamic rationale with real stats (count, AOV, channel, conversion rate, expected revenue)
   - **Strategy Summary** — 5 metric cards (Audience Size, Expected ROI, Recommended Channel, Expected Conversion, Campaign Cost)
   - **Channel Planner** — per-channel metric comparison (WhatsApp vs Email vs SMS)
   - **Message Workshop** — A/B variant cards with inline preview (Email template rendered, WhatsApp bubble style, SMS preview)
5. Marketer clicks **Approve & Launch** → `POST /api/ai/launch-campaign` → redirected to campaign analytics page

---

### All Campaigns (`/engagement`)
**Purpose:** Track all running and completed campaigns.

- Lists campaigns in card format with persona, channel, status, audience size, and days since creation
- Each card links to the Campaign Detail page
- "View Audience" button opens the persona's customer list

---

### Campaign Detail (`/engagement/:id`)
**Purpose:** Real-time operational funnel analytics for a specific campaign.

- **Communication Funnel:** Recipients → Delivered → Opened → Clicked → Purchased (with rates)
- **Revenue Attribution:** Actual revenue vs. predicted baseline, performance delta
- **AI Summary:** Auto-generated 2-sentence strategic insight (cached 1hr)
- **Recent Communication Events:** Chronological event log per customer

---

### Customer 360 (`/intelligence`)
**Purpose:** Unified view of the entire customer base with segmentation and search.

- **Stats Bar:** Total customers, Active, At Risk, Dormant, VIP count, Avg LTV
- **Searchable, Sortable Table:** Filter by name/email/city/persona. Sort by health score, LTV, last order
- **Persona Filter Dropdown:** Filter by behavioral persona (VIP, Beauty Loyalist, At Risk, etc.)
- **Priority Badges:**
  - 🔴 Red: Critical (health < 40) or High
  - 🟡 Yellow: Medium
  - 🔵 Blue: Low
- **Customer Detail Sidebar:** Clicking a row shows the full profile — health score, personas, total spend, last order date, recommended action, confidence score, and expected revenue recovery

---

### Data Import (`/import`)
**Purpose:** Upload customer and order data via CSV.

- Drag-and-drop CSV upload
- Supports customer data (name, email, phone, city) and order data (customer_id, amount, category, date)
- Backend upserts records and re-computes health scores and personas on import

---

### System Architecture (`/architecture`)
**Purpose:** Visual explanation of the system's technical design for stakeholders.

---

## AI Engine

### Multi-Key Fallback Strategy
The AI engine supports multiple API keys and falls back gracefully:

```
Gemini Key 1 → Gemini Key 2 → Gemini Key 3 → Groq LLaMA 3.3 70B
```

If all Gemini keys are rate-limited, it automatically switches to Groq. Each layer has individual error handling so a single key failure doesn't break the request.

### Segmentation (SQL Generation)
The AI receives a system prompt defining the `customers` table schema and is instructed to return:
```json
{ "where_clause": "total_spent > 5000 AND last_order_date < NOW() - INTERVAL '90 days'", "channel": "WhatsApp", "goal_type": "Win-back" }
```
This is then executed as a safe raw query via Prisma.

### Message Drafting
The AI is given strict copy constraints:
- No generic language ("Dear Customer", "Valued User")
- Must reference CRM attributes: `{{first_name}}`, `{{last_purchase}}`, `{{favorite_category}}`
- Max 3-5 lines per message
- Feels like it was written from a live database pull

---

## Campaign Lifecycle

```
1. CREATE    Campaign + Communication records created (one per customer in persona)
             ↓
2. SIMULATE  Each communication assigned a funnel status based on channel metrics:
             pending → delivered → opened → clicked → purchased
             ↓
3. ANALYTICS /api/campaigns/:id/insights aggregates status counts and computes:
             - Funnel rates at each stage
             - Revenue attribution (AOV × purchased count)
             - AI-generated strategic summary
             ↓
4. VIEW      Campaign Detail page renders real-time funnel with all stats
```

---

## Customer Intelligence

### Health Score Computation (0–100)
Computed during seeding and re-computed on data import:

```
Base score: 100
- Days since last order > 30:   -20
- Days since last order > 60:   -20
- Days since last order > 90:   -30  (churn risk)
- Total orders < 2:             -10
- Total spend in top 5% VIP:    +20
Clamped to [0, 100]
```

### Persona Assignment (Rule-Based)
| Persona | Rule |
|---|---|
| **Beauty Loyalist** | ≥70% of orders are in the Beauty category |
| **Discount Hunter** | ≥60% of orders used a discount |
| **Weekend Shopper** | ≥70% of orders placed on Saturday or Sunday |
| **VIP Customer** | Total spend is in the top 5% of all customers |
| **At Risk Customer** | Health score < 40 |

> Customers can belong to multiple personas simultaneously.

---

## Local Development Setup

### Prerequisites
- Node.js v20+
- pnpm v9+ (`npm install -g pnpm`)
- PostgreSQL database (local or Neon free tier)
- Redis (local or Upstash free tier)
- Gemini API Key (from [aistudio.google.com](https://aistudio.google.com))

### 1. Clone & Install
```bash
git clone https://github.com/Avisav24/XenoCopilot.git
cd XenoCopilot
pnpm install
```

### 2. Configure Environment
Create `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/xenocopilot
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=your_groq_key_here   # Optional fallback
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Database Setup
```bash
cd backend
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm seed           # Seed 300 customers + 1500 orders + personas
```

### 4. Run All Services
```bash
# From root — starts both frontend and backend in parallel
pnpm run dev

# OR individually:
cd backend && pnpm dev     # Starts on :3001
cd frontend && pnpm dev    # Starts on :3000
```

Open **http://localhost:3000**

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `GEMINI_API_KEY` | ✅ | Primary Gemini AI key |
| `GEMINI_MODEL` | ❌ | Model name (default: `gemini-2.5-flash`) |
| `GEMINI_API_KEY_1` | ❌ | Secondary Gemini key (failover) |
| `GEMINI_API_KEY_2` | ❌ | Tertiary Gemini key (failover) |
| `GROQ_API_KEY` | ❌ | Groq key (LLaMA fallback) |
| `CHANNEL_SIM_URL` | ❌ | External channel simulator URL (optional) |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend URL for frontend API calls |

---

## Key Design Decisions

| Decision | What was done | Production alternative |
|---|---|---|
| **AI Segmentation** | Single Gemini call → raw SQL execution | Vector embeddings + fine-tuned segment model |
| **Funnel Simulation** | Statistically realistic simulation using channel metrics | Real delivery receipts via webhook callbacks |
| **AI Fallback** | Gemini keys pool → Groq LLaMA 3.3 70B | Dedicated AI gateway with retry/circuit-breaker |
| **Caching** | Redis 60s cache on campaign insights, 1hr on AI summaries | CDN-level caching + server-sent events for live updates |
| **Revenue Attribution** | AOV × purchased communication count | Event-sourced attribution with multi-touch attribution models |
| **Persona Assignment** | Rule-based at seed time | ML clustering (K-Means / RFM model) with nightly recompute |
| **Auth** | None (demo scope) | JWT + multi-tenant brand isolation per workspace |
| **CSV Import** | Synchronous batch upserts | Async job queue with progress streaming |

---

## Data Seeded by Default

When you run `pnpm seed`:

| Entity | Count |
|---|---|
| Customers | 300 (Indian names, 6 major cities) |
| Orders | 1,500 (₹300–₹6,000 range, Beauty/Apparel/Footwear/Accessories) |
| Personas | 5 (Beauty Loyalist, Discount Hunter, Weekend Shopper, VIP Customer, At Risk) |
| Channel Metrics | 3 (WhatsApp: 12% CTR, Email: 5% CTR, SMS: 3% CTR) |
| Past Campaigns | 4 (pre-seeded with historical communications for demo analytics) |

---

## Contributing

This is a private project for Drape & Co. If you're extending it:

1. All new API routes go in `backend/src/routes/`
2. Register new routes in `backend/src/index.ts`
3. All new pages go in `frontend/src/app/(main)/`
4. Shared types live in `packages/` (if needed across workspaces)
5. Run `pnpm db:generate` after any `schema.prisma` changes

---

*Built with ❤️ by Abhinav | XenoCopilot v1.0.0*