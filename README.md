<div align="center">
  
  # 🚀 XenoCopilot
  
  ### *The AI-First CRM Command Center for Modern Fashion Retail Brands*

  [![Next.js 14](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Fastify](https://img.shields.io/badge/Fastify-black?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
  [![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  
  [![Google Gemini](https://img.shields.io/badge/Gemini%202.5-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
  [![BullMQ](https://img.shields.io/badge/BullMQ-CC0000?style=for-the-badge&logo=redis&logoColor=white)](https://bullmq.io/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
  
  **[🔴 Live Demo](https://xenocopilot.vercel.app/)**
</div>

---

## 📖 Overview

**XenoCopilot** is an intelligent, high-performance full-stack CRM platform that reimagines marketing operations. Instead of manually building database queries, slicing segments, and writing copy, marketers interact with a powerful AI co-pilot. 

Simply type natural-language goals like:
> *"Win back high-value customers who haven't made a purchase in 90 days."*

XenoCopilot's AI engine securely translates goals into dynamic filters, performs cohort sizing, forecasts potential revenue, generates highly personalized copy variants, dispatches campaigns via robust asynchronous queues, and attributes conversion events in real-time.

---

## ✨ Key Features

- 💬 **Natural Language Segmentation & Insights:** Auto-translates human intentions into precise data segments. No SQL knowledge required.
- 👥 **Intelligent Persona Engine:** Dynamically categorizes customers based on purchase behavior (e.g., *Beauty Loyalist*, *Discount Hunter*, *Weekend Shopper*, *VIP*, *At Risk*).
- ✍️ **AI Copywriter (A/B Testing):** Drafts tailored, context-aware messages for Email, WhatsApp, and SMS, complete with personalization variables (e.g., `{{first_name}}`, `{{last_purchase}}`).
- ⚡ **Asynchronous Queue Pipeline:** Driven by **BullMQ** & **Redis** to ensure reliable, high-throughput campaign dispatching.
- 📊 **Real-time Funnel Analytics:** Tracks delivery statuses (`Pending` ➔ `Delivered` ➔ `Opened` ➔ `Clicked` ➔ `Purchased`) via Webhooks.
- 💰 **Revenue Attribution:** Connects live customer purchase events directly back to specific campaign variants.
- 🔮 **Customer 360:** Comprehensive, searchable profile dashboards displaying customer transaction histories, communication logs, and customer health scores.

---

## 🏗️ Architecture & Workflows

### System Architecture
XenoCopilot is designed as a **monorepo** managed with `pnpm workspaces`. This separation guarantees modularity and shared type-safety between the frontend, backend, and external services.

```mermaid
graph TD
    UI[Frontend: Next.js 14 App Router] -->|REST API Requests| API[Backend: Fastify 4 API Server]
    API -->|Shared Types| Shared[packages/shared-types]
    UI -->|Shared Types| Shared
    
    API -->|ORM| DB[(PostgreSQL + Prisma)]
    API -->|Queue Jobs / Cache| Redis[(Redis / Upstash)]
    
    subgraph AI Engine
        API -->|Primary LLM| Gemini[Google Gemini 2.5 Flash]
        API -.->|Fallback LLM| Groq[Groq LLaMA 3.3 70B]
    end

    subgraph Dispatcher & Sim
        API -->|BullMQ Worker| Worker[Send Queue Worker]
        Worker -->|Simulate Dispatch| Sim[Channel Simulator Service]
        Sim -->|Webhooks Status Update| API
    end
```

### Campaign Execution & Simulation Flow
When a user launches a campaign, the system schedules asynchronous deliveries and simulates real-world delays.

```mermaid
sequenceDiagram
    autonumber
    actor Marketer as Marketing Dashboard
    participant Backend as Fastify API
    participant Queue as Redis / BullMQ
    participant Worker as Send Worker
    participant Sim as Channel Simulator
    
    Marketer->>Backend: Post campaign launch
    Backend->>Backend: Create Campaign & Communication entries
    Backend->>Queue: Push dispatch job per customer
    Backend-->>Marketer: Confirm campaign launch
    
    Note over Queue, Worker: BullMQ processes job queue asynchronously
    
    Queue->>Worker: Pull message job
    Worker->>Sim: HTTP POST dispatch to Simulator
    Sim-->>Worker: Acknowledge receipt
    
    Note over Sim: Simulates network jitter (1-5s)<br/>and delivery/open/purchase actions
    
    Sim->>Backend: POST Webhook Status Update (Delivered / Opened / Clicked)
    Backend->>Backend: Update Communication Status & ChannelMetrics
    Backend-->>Marketer: Dynamic page polling shows real-time progress update
```

---

## 🛠️ Tech Stack Deep Dive

| Layer | Technologies | Key Libraries |
| :--- | :--- | :--- |
| **Frontend** | React 18, Next.js 14 (App Router), Tailwind CSS | Framer Motion, GSAP, Recharts, Iconoir React, OGL |
| **Backend** | Node.js, Fastify 4, TypeScript | Prisma ORM, BullMQ, Zod, dotenv, csv-parse, pino |
| **Database & Caching** | PostgreSQL (Neon / Local), Redis (Upstash / Local) | Prisma Client, ioredis |
| **AI Models** | Google GenAI SDK, Groq SDK | Gemini 2.5 Flash (Primary), LLaMA 3.3 70B (Fallback) |
| **Tooling & Monorepo** | pnpm workspaces, tsx, typescript | Concurrent dev server execution |

---

## ⚡ Local Development Setup

Get XenoCopilot running on your local machine in just a few steps.

### Prerequisites
- **Node.js** v20+
- **pnpm** v9+ (`npm i -g pnpm`)
- **PostgreSQL** database (Local or Neon)
- **Redis** instance (Local or Upstash)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))
- **Groq API Key** (Optional fallback, from [Groq Console](https://console.groq.com/))

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/Avisav24/XenoCopilot.git
cd XenoCopilot
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/xenocopilot"
REDIS_URL="redis://localhost:6379"
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"
PORT="3001"

# Fallbacks and Webhook Sim Configs
GEMINI_API_KEY_1="optional_gemini_key_fallback_1"
GEMINI_API_KEY_2="optional_gemini_key_fallback_2"
GROQ_API_KEY="optional_groq_api_key_here"
CHANNEL_SIM_URL="http://localhost:3002"
```

Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Create a `.env` file in the `services/channel-sim/` directory:
```env
PORT="3002"
BACKEND_URL="http://localhost:3001"
```

### 3. Database Initialization & Seeding

Deploy database migrations and run the seed script to populate demo datasets (300 mock customers, 1,500 historic orders, pre-seeded campaigns, and metrics):
```bash
cd backend
pnpm db:generate    # Generate Prisma Client
pnpm db:push        # Sync database schema
pnpm seed           # Seed demographic, transaction, and behavioral data
```

### 4. Start the Development Servers

From the root directory, run the concurrent dev environment:
```bash
pnpm run dev
```

This starts:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Server:** [http://localhost:3001](http://localhost:3001)
- **Queue Worker:** Asynchronous job processing
- **Channel Simulator:** [http://localhost:3002](http://localhost:3002)

---

## 🔮 AI Failover & Resiliency

To maintain 100% operational uptime during high traffic or rate-limiting events, XenoCopilot implements a multi-stage failover cascade:

```
[Gemini Key 1] ──(429 Rate Limit)──> [Gemini Key 2] ──(429 Rate Limit)──> [Groq LLaMA 3.3 70B] ──(Network Error)──> [Static Fallback Config]
```

1. **Key Rotation:** Cascades through alternative Gemini keys in the pool if rate-limits are hit.
2. **Model Cascade:** Switches to Groq LLaMA 3.3 70B if Gemini API service as a whole is unavailable.
3. **Graceful Degradation:** Serves structured, default templates to ensure the dashboard never hangs or crashes.

---

## 🌐 Deployment Options

- **Frontend:** Deploy to [Vercel](https://vercel.com) (handles Next.js serverless functions natively).
- **Backend & Worker:** Deploy to [Render](https://render.com) using the included `render.yaml` or to [Railway](https://railway.app).
- **Database:** PostgreSQL on [Neon](https://neon.tech), Redis on [Upstash](https://upstash.com).

---

<div align="center">
  <p>Built with ❤️ by Abhinav Vats | <b>XenoCopilot v1.0.0</b></p>
</div>
