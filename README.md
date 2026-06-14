# 🚀 Xeno Copilot: AI-Native Mini CRM

**Built for the Xeno Engineering Take-Home Assignment**

Xeno Copilot is an AI-Native CRM designed to help consumer brands intelligently reach their shoppers. Instead of a traditional CRUD interface where marketers manually guess who to target, Xeno Copilot introduces an **Opportunity Engine**. Marketers simply describe their business goal in natural language, and the AI proactively discovers the optimal audience, mathematically predicts the expected revenue, and drafts personalized messaging.

---

## ✨ Core Features & The "AI-Native" Approach

### 1. The Opportunity Engine (Campaign Studio)
* **NLP-to-SQL Segmentation:** Marketers type goals (e.g., *"Recover dormant VIPs"*), and the multi-LLM cascade translates the intent into strict Postgres filters.
* **Deterministic Revenue Math:** The AI predicts campaign revenue by dynamically multiplying the live Audience Size by the real Average Order Value (AOV) from the database, preventing wild LLM financial hallucinations.
* **RAG-Driven Evidence System:** Instead of letting the AI hallucinate marketing statistics, the backend dynamically injects real conversion metrics (`open_rate`, `ctr`) from the `channel_metrics` table into the AI's generation context.
* **Variable Normalization:** A strict Regex sanitizer intercepts LLM outputs, converting hallucinated merge tags (like `{{first_name}}`) into standard system tags (`{{Name}}`) before rendering the live message previews.

### 2. Asynchronous Webhook Architecture (The Channel Simulator)
*Per the assignment requirements, the messaging provider is completely stubbed out to model a real-world, high-volume event-driven system.*
* **Decoupled Delivery Loop:** When a campaign launches, the CRM returns an immediate `202 Accepted` and pushes the payload to an isolated `channel-sim` microservice.
* **Realistic Simulation:** The simulator introduces artificial network jitter, randomized delivery delays, and mathematical failure rates.
* **Webhook Receipts:** As the simulator processes the queue, it fires asynchronous HTTP callbacks back to the CRM (`/api/webhooks/receipt`), automatically progressing the campaign status from *Pending → Sent → Delivered / Failed → Opened*.

### 3. Enterprise AI Guardrails (Resiliency)
* **Strict Schema Whitelisting:** Before executing AI-generated JSON against Prisma, a backend validator strips out unrecognized keys, preventing SQL injection and Prisma crashes.
* **Serverless Timeout Guard:** Synchronous LLM calls can hang serverless functions. I implemented an 8.5-second `Promise.race` timeout wrapper. If the LLM takes too long, the system gracefully aborts and serves a deterministic fallback.
* **Empty State Short-Circuiting:** If a database query returns 0 customers, the backend immediately halts the LLM generation and returns a hardcoded error, saving API costs and preventing "Empty State Delusions."

---

## 🏗️ Technical Architecture

### Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS (deployed on Vercel)
* **Backend:** Fastify Node.js (deployed on Render)
* **Database:** PostgreSQL hosted on Supabase, managed with Prisma ORM
* **AI Providers:** Google Gemini 2.5 Flash with fallback to Groq LLaMA 3.3

### Tradeoffs & Scalability Assumptions
I consciously chose a two-service, webhook-driven loop because synchronous HTTP requests do not scale for mass marketing campaigns. At a massive scale (e.g., dispatching 1 million WhatsApp messages), I would replace the internal Node queue with a robust message broker like **Kafka** or **AWS SQS**. However, for the scope of this assignment, this webhook architecture perfectly models a real-world event-driven system without over-engineering the infrastructure.

---

## 🚀 Running Locally

### Prerequisites
* Node.js (v24+)
* pnpm (`npm install -g pnpm`)
* A PostgreSQL Database (Supabase)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Avisav24/XenoCopilot.git
   cd XenoCopilot
   ```

2. Install dependencies (Monorepo):
   ```bash
   pnpm install
   ```

3. Setup Environment Variables:
   Create a `.env` file in `backend/` and add:
   ```env
   DATABASE_URL="postgresql://..."
   GEMINI_API_KEY="..."
   GROQ_API_KEY="..."
   ```
   Create a `.env.local` file in `frontend/` and add:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:8080"
   ```

4. Initialize the Database:
   ```bash
   cd backend
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

5. Run the Development Servers:
   From the root directory:
   ```bash
   pnpm dev
   ```
   The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8080`.
