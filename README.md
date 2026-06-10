# XenoCopilot — AI-Powered Mini CRM

XenoCopilot is an intelligent CRM campaign platform built for Drape & Co., a fashion retail brand. It lets marketers type a natural-language campaign goal, get an AI-generated audience segment and personalized message plan, launch campaigns across email/WhatsApp/SMS, and watch real-time delivery analytics — all in one sleek interface powered by Gemini 2.5 Flash.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    XENOCOPILOT                       │
│                                                     │
│  ┌────────────────────┐    ┌──────────────────────┐  │
│  │   FRONTEND (Next)  │    │  CRM API (Fastify)   │  │
│  │                    │◄──►│                      │  │
│  │  - Campaign Comp   │    │  - /api/campaigns    │  │
│  │  - Live Dispatch   │    │  - /api/segments     │  │
│  │  - Insights Dash   │    │  - /api/receipts     │  │
│  │  - Customer List   │    │  - /api/ai           │  │
│  └────────────────────┘    └──────────┬───────────┘  │
│          Vercel                       │ Railway       │
│                              ┌────────▼───────┐       │
│                              │  Postgres (Neon)│       │
│                              │  Redis (Upstash)│       │
│                              │  BullMQ Queue  │       │
│                              └────────┬───────┘       │
│                                       │               │
│                              ┌────────▼───────┐       │
│                              │ CHANNEL-SIM    │       │
│                              │  (Render.com)  │       │
│                              │  Async Callbacks│      │
│                              └────────────────┘       │
└─────────────────────────────────────────────────────┘
```

**Two separately deployed services:**
1. `apps/api` — Fastify CRM backend + BullMQ workers → Railway
2. `services/channel-sim` — Async delivery simulator → Render.com
3. `apps/web` — Next.js 14 frontend → Vercel

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js 14 + Tailwind CSS | Fast, deployable on Vercel instantly |
| Backend | Fastify 4 + TypeScript | Faster than Express, great TypeScript DX |
| ORM | Prisma | Type-safe DB queries, easy migrations |
| Database | PostgreSQL (Neon) | Free tier, serverless-friendly |
| Queue | BullMQ + Upstash Redis | Production-grade, free tier available |
| AI | Gemini 2.5 Flash | Reliable structured JSON output |
| Charts | Recharts | Easy Tailwind integration |
| Animations | Framer Motion | Polished transitions |
| Channel Sim | Express on Render | Separate service as spec requires |
| Deploy | Vercel + Railway + Render | All free tier, easy CI/CD |

---

## Folder Structure

```
xenocopilot/
├── apps/
│   ├── web/               ← Next.js 14 frontend (Vercel)
│   └── api/               ← Fastify CRM backend (Railway)
├── services/
│   └── channel-sim/       ← Stub channel service (Render.com)
├── packages/
│   └── shared-types/      ← Shared TypeScript types
├── .env.example
├── pnpm-workspace.yaml
└── README.md
```

---

## Setup & Local Development

### Prerequisites
- Node.js v20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database (Neon free tier recommended)
- Redis instance (Upstash free tier)
- Gemini API key (aistudio.google.com)

### 1. Clone & Install

```bash
git clone https://github.com/Avisav24/XenoCopilot.git
cd XenoCopilot
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual values:
# DATABASE_URL=postgresql://...
# REDIS_URL=redis://...
# GEMINI_API_KEY=...
# GEMINI_MODEL=gemini-2.5-flash
```

Also create `apps/api/.env` with the same values and `apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Database Setup

```bash
cd apps/api
pnpm db:push        # Push schema to DB
pnpm db:generate    # Generate Prisma client
pnpm seed           # Seed 500 customers + 2500 orders
```

### 4. Run All Services

```bash
# Terminal 1 — CRM API
cd apps/api && pnpm dev

# Terminal 2 — BullMQ Worker
cd apps/api && pnpm worker

# Terminal 3 — Channel Simulator
cd services/channel-sim && pnpm dev

# Terminal 4 — Frontend
cd apps/web && pnpm dev
```

Open http://localhost:3000

---

## Deployed URLs

| Service | URL |
|---------|-----|
| Frontend | https://your-app.vercel.app |
| CRM API | https://your-api.railway.app |
| Channel Sim | https://your-sim.render.com |

---

## Demo Flow

1. Open XenoCopilot → Dashboard shows 500 customers, channel distribution
2. Click **New Campaign** → type: *"Win back high-value dress buyers who spent over ₹3000 but haven't purchased in 45 days"*
3. AI generates: segment rules, rationale, 2-3 message variants with persona tags
4. Review audience preview (5 customer cards), edit message bodies inline
5. Click **Save & Continue** → **🚀 Launch Campaign**
6. Redirected to **Live Dispatch** view: real-time event feed, stat pills, funnel chart
7. After ~30s, navigate to **Insights** tab: funnel chart, channel donut, persona table, AI insight card

---

## Deliberate Tradeoffs

| Tradeoff | What we did | What we'd do at scale |
|----------|-------------|----------------------|
| Queue | BullMQ + Redis | Kafka for ordered, partitioned delivery |
| DB | Row-level updates per receipt | Append-only events table + materialized views |
| AI Segment | Single Gemini call, no caching | Vector embeddings + fine-tuned segment model |
| Auth | None (demo scope) | JWT + multi-tenant brand isolation |
| Channel Sim | Express with setTimeout | Full state machine with retry, idempotency keys |
| Receipts | Optimistic forward-only status | CRDT-based event sourcing for concurrent updates |
| Monitoring | Console logging | Structured logging + OpenTelemetry tracing |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/plan-campaign` | Generate AI campaign plan |
| GET | `/api/campaigns` | List all campaigns |
| POST | `/api/campaigns` | Create draft campaign |
| GET | `/api/campaigns/:id` | Get campaign |
| POST | `/api/campaigns/:id/send` | Launch campaign (queues send jobs) |
| GET | `/api/campaigns/:id/messages` | Get campaign messages (for live feed) |
| GET | `/api/campaigns/:id/insights` | Get aggregated analytics + AI summary |
| POST | `/api/receipts` | Ingest delivery event from channel-sim |
| GET | `/api/customers` | List customers with search + pagination |
| GET | `/api/customers/stats` | Aggregate customer stats |
| GET | `/health` | Health check |