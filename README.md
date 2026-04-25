# PocketCFO — AI-Powered CFO for Malaysian SMEs

Your neural financial strategist that navigates LHDN e-Invoicing mandates, optimizes cashflow, and makes strategic tax decisions — in real time.

---

## What is PocketCFO?

PocketCFO is an AI-powered financial decision engine built for Malaysian SMEs. It acts as your virtual CFO, analyzing every transaction against LHDN compliance rules and Malaysian tax law to give you instant, actionable recommendations.

**The core loop:**

1. You upload a receipt, invoice, or describe a transaction
2. The PocketCFO Engine (powered by Z.AI GLM-5) interprets, validates, and reasons
3. You get a strategic decision — approved, rejected, or pending — with tax optimization impact

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**
- A **Z.AI API key** (get one at [ilmu.ai](https://ilmu.ai))
- (Optional) A **Firebase** project for persistent storage — the app works without it using demo data

### Installation

```bash
cd pocketcfo
npm install
```

### Environment Setup

Create a `.env.local` file in the `pocketcfo/` directory with:

```env
# Z.AI Configuration (server-side only)
ZAI_API_KEY=your-zai-api-key-here
ZAI_BASE_URL=https://api.ilmu.ai/v1

# Firebase Configuration (optional — app works without these)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> **Note:** If you skip Firebase, the app runs in demo mode with mock data. The Z.AI key is required for live AI analysis; without it, the app falls back to a built-in rule-based engine.

### Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Interface Overview

### The 3-Panel Main Page

The primary interface is divided into three panels:

#### 1. Dashboard (Left Panel)

Your financial command center at a glance:

- **Company Profile** — Your registered SME details and SST ID
- **Compliance Score** — A circular gauge showing your LHDN compliance rate (0–100%). Drops when non-compliant invoices are detected
- **Tax Bracket** — Visual bar showing which tax bracket you're in (15%, 17%, or 24%) and how much chargeable income remains before the next bracket
- **Month-to-Date** — Running totals for revenue, expenses, pending invoices, and liquidity ratio

These numbers update in real time as you submit transactions.

#### 2. Chat (Center Panel)

Talk to your AI CFO directly:

- **Type a message** — Describe a transaction, e.g.:
  - `Receipt from IKEA Damansara for RM7,850`
  - `Invoice from Nasi Kandar Pelita RM485.60, no TIN`
  - `Should I buy a laptop for RM12,500 this month?`
- **Upload a file** — Click the paperclip icon to attach a receipt, invoice, PDF, or spreadsheet (supports images, PDFs, CSVs, and Excel files)
- **Get instant analysis** — The engine responds with compliance status, tax classification, and strategic recommendations

The chat includes a typing indicator and timestamps for every message. If the Z.AI API is unavailable, the built-in rule engine (`engine.ts`) provides intelligent fallback responses.

#### 3. Neural Decision Graph (Right Panel)

A visual map of how PocketCFO processes your transactions:

- **Input cards** (left) — Show the documents/receipts fed into the engine
- **Engine node** (center) — The PocketCFO brain with a breathing pulse animation
- **Outcome cards** (right) — Final decisions, color-coded by status:
  - **Green (Approved)** — Transaction is compliant and optimized
  - **Red (Rejected)** — Non-compliant, action required
  - **Amber (Pending)** — Needs more info or deferral recommended

Animated SVG connection lines with particle effects flow between nodes, showing data traveling through the engine pipeline. The graph updates live as new transactions are analyzed.

### Additional Components

Beyond the main 3-panel page, PocketCFO includes these reusable components:

- **Header** — Top navigation bar with PocketCFO branding, AI engine status pills (GLM-5 Online, LHDN Connected, Real-time), and notification bell with unread count
- **Sidebar** — Full-height alternative to the Dashboard panel, featuring an animated circular compliance ring, tax bracket meter with color-coded segments, and month-to-date stat rows
- **Tactical Feed** — A real-time scrolling feed of AI decisions, each rendered as expandable Tactical Cards with priority badges, LHDN compliance indicators, rationale blocks, and Confirm/Dismiss actions
- **Neural Brain (React Flow)** — An interactive node-graph visualization built on React Flow (`@xyflow/react`), with custom node types (Input, Brain, Process, Decision), animated glow edges, pan/zoom controls, and a dot-grid background

---

## What the AI Analyzes

Every transaction goes through the **Decision Intelligence Protocol**:

### Step 1 — Interpret

Extracts key entities: vendor name, amount (RM), SST ID, TIN, date, and category.

### Step 2 — Comply

Checks against LHDN e-Invoice mandate (Version 4.6):
- Is a valid TIN present?
- Are all 55 mandatory fields covered?
- Does the classification match MSIC codes?

### Step 3 — Reason

Compares the expense against your current financial state:
- Does this push expenses past 80% of revenue?
- Does it push you into the next tax bracket?
- Is there a cashflow risk (liquidity < 1.5x)?

### Step 4 — Decide

Generates a strategic action with one of these outcomes:

| Outcome | Meaning |
|---------|---------|
| **Approved** | Compliant and classified. Proceed. |
| **Rejected** | Non-compliant (e.g., missing TIN). Do not process until fixed. |
| **Pending** | Deferral or reclassification recommended (e.g., delay purchase to next FY). |

### AI Response Structure

The Z.AI engine returns a structured JSON decision:

```json
{
  "extracted_data": {
    "vendor": "string",
    "amount_myr": 0,
    "is_lhdn_compliant": true,
    "classification": "LHDN_REVENUE_EXPENDITURE | LHDN_CAPITAL_ALLOWANCE | LHDN_ENTERTAINMENT_50PCT | LHDN_SST_EXEMPT | LHDN_PERSONAL | LHDN_UNCLASSIFIED",
    "sst_id": "string or null",
    "tin": "string or null",
    "date": "ISO date string",
    "description": "Brief description"
  },
  "decision_logic": {
    "action_priority": "LOW | MEDIUM | CRITICAL",
    "recommendation": "The Decision",
    "rationale": "The Why — cites tax rules or cash flow",
    "tax_optimization_impact": "RM saved or risk avoided"
  },
  "ui_component": {
    "type": "TACTICAL_CARD | ALERT | OPPORTUNITY",
    "display_message": "Concise summary for the feed"
  }
}
```

---

## Tax Classification Reference

PocketCFO classifies transactions under Malaysian tax law:

| Classification | Deductibility | Tax Section |
|---|---|---|
| Revenue Expenditure | 100% deductible | Section 33(1), ITA 1967 |
| Capital Allowance | 20% initial + 14% annual | Schedule 3, ITA 1967 |
| Entertainment (50%) | Only 50% deductible | Section 39(1)(l), ITA 1967 |
| SST Exempt | No SST charged | SST Act 2018 |
| Personal | Not deductible | N/A |

### Malaysian Corporate Tax Brackets (SME)

| Chargeable Income | Tax Rate |
|---|---|
| First RM150,000 | 15% |
| RM150,001 – RM600,000 | 17% |
| Above RM600,000 | 24% |

---

## Example Conversations

**Compliant purchase with TIN:**
```
You: Receipt from IKEA Damansara RM7,850, TIN: C-99887766
Bot: LHDN Compliant — TIN verified. I've classified this RM7,850 purchase
     as Capital Allowance (Schedule 3, Income Tax Act 1967). This qualifies
     for 20% initial + 14% annual rate. Estimated tax savings: RM1,884
     over the asset's useful life.
```

**Non-compliant invoice (missing TIN):**
```
You: Invoice from Nasi Kandar Pelita RM485.60, no TIN
Bot: Warning: This invoice is missing a valid TIN number. Under LHDN
     e-Invoice mandate (effective Aug 2025), all B2B transactions require
     a TIN. Flagged as NON-COMPLIANT. Penalty risk: up to RM5,000.
     Action: Request TIN from the vendor before processing payment.
```

**Tax bracket optimization:**
```
You: Should I buy a Dell laptop for RM12,500?
Bot: Analysis: RM12,500 for laptop. Recommend classifying as Capital
     Allowance under Schedule 3. Initial allowance: RM2,500 (20%).
     If your total chargeable income approaches RM600k, consider
     deferring this to next fiscal year to stay in the 17% bracket.
     Potential savings: RM3,000.
```

**Recurring expense auto-categorization:**
```
You: Internet bill RM299
Bot: Auto-classified as Revenue Expenditure — Recurring. This is fully
     deductible under Section 33(1) of the Income Tax Act. I've added
     this to your monthly recurring expenses tracker.
```

---

## Architecture

```
pocketcfo/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts     # POST /api/analyze — calls Z.AI GLM-5
│   │   │   └── seed/route.ts        # GET /api/seed — populates Firestore with demo data
│   │   ├── page.tsx                 # Main 3-panel page (Dashboard | Chat | Neural Graph)
│   │   ├── layout.tsx               # Root layout + Font Awesome CDN
│   │   ├── globals.css              # All styles
│   │   └── favicon.ico
│   ├── components/
│   │   ├── chat/ChatPanel.tsx       # Chat interface with file upload
│   │   ├── dashboard/DashboardPanel.tsx  # Dashboard widgets (compliance, tax, MTD)
│   │   ├── graph/NeuralGraph.tsx    # SVG-based neural decision visualization
│   │   ├── feed/
│   │   │   ├── TacticalFeed.tsx     # Real-time scrolling decision feed
│   │   │   ├── TacticalCard.tsx     # Expandable card with priority badge & actions
│   │   │   └── ChatInput.tsx        # Chat input component
│   │   ├── neural/
│   │   │   ├── NeuralBrain.tsx      # React Flow canvas — interactive node graph
│   │   │   ├── nodes/
│   │   │   │   ├── BrainNode.tsx    # Central engine node
│   │   │   │   ├── InputNode.tsx    # Document/receipt input node
│   │   │   │   ├── ProcessNode.tsx  # Processing stage node (compliance/cashflow/tax)
│   │   │   │   └── DecisionNode.tsx # Decision outcome node
│   │   │   └── edges/
│   │   │       └── GlowEdge.tsx     # Custom animated glow edge
│   │   └── layout/
│   │       ├── Header.tsx           # Top bar — logo, status pills, notifications
│   │       └── Sidebar.tsx          # Side panel — company profile, health ring, tax meter
│   ├── lib/
│   │   ├── zai.ts                   # Z.AI client (OpenAI-compatible SDK)
│   │   ├── engine.ts                # Fallback rule-based engine (5 scenarios)
│   │   ├── prompts.ts               # System prompt + context template for Z.AI
│   │   ├── firebase.ts              # Firebase SDK init (Auth, Firestore, Storage)
│   │   ├── firestore.ts             # Firestore CRUD — profiles, invoices, tactical feed, health
│   │   ├── mock-data.ts             # Demo company, health snapshot, and 5 seed feed items
│   │   └── types.ts                 # TypeScript interfaces (PocketCFODecision, Invoice, etc.)
│   └── types/
│       └── index.ts                 # Shared UI types (ChatMessage, DashboardData, GraphInput/Outcome)
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| AI Engine | Z.AI GLM-5 via OpenAI-compatible SDK (`openai` v6) |
| Database | Firebase Firestore (optional — real-time sync, Auth, Storage) |
| Visualization | React Flow (`@xyflow/react` v12) + custom SVG |
| Animation | Framer Motion v12 |
| Icons | Lucide React + Font Awesome 6 |
| Styling | Tailwind CSS 4 + custom CSS |

---

## Firestore Data Model

When Firebase is configured, PocketCFO persists data across four collections:

| Collection | Purpose | Key Fields |
|---|---|---|
| `users` | Company profiles | name, sstId, tin, taxYear, annualRevenue, currentTaxBracket |
| `invoices` | Uploaded invoices | rawInput, inputType, isProcessed, lhdnStatus, extractedData |
| `tactical_feed` | AI decision feed (real-time) | extracted_data, decision_logic, ui_component, status |
| `financial_health` | Financial snapshots | liquidityRatio, monthToDateRevenue, expenses, complianceRate |

The tactical feed supports real-time updates via Firestore `onSnapshot` subscriptions, and items can be confirmed or dismissed through the UI.

---

## Fallback Rule Engine

If the Z.AI API is unavailable, the built-in rule engine (`engine.ts`) handles these scenarios:

1. **Compliant transactions with valid TIN** — Auto-classifies as Capital Allowance, Revenue Expenditure, or Entertainment based on keywords
2. **Non-compliant invoices missing TIN** — Flags as NON-COMPLIANT with penalty risk (RM5,000–RM20,000)
3. **Capital expenditure questions** — Recommends Capital Allowance classification with bracket deferral advice
4. **Recurring expenses** (internet, electricity, rent, subscriptions) — Auto-categorizes as Revenue Expenditure — Recurring
5. **General fallback** — Records transaction and prompts for more details if amount/vendor is missing

The fallback engine also updates the dashboard state and neural graph in real time.

---

## Demo Mode

The app ships with demo data for **Warung Pixel Sdn Bhd** — a fictional Malaysian SME:

- **SST ID:** W10-1234-56789012
- **TIN:** C-12345678
- **Annual Revenue:** RM520,000
- **Current Tax Bracket:** 17%
- **Compliance Score:** 94%
- **Liquidity Ratio:** 1.8x

Pre-loaded tactical feed items include:
1. **IKEA Damansara** (RM7,850) — Opportunity to reclassify as Capital Allowance, save RM1,884
2. **Nasi Kandar Pelita** (RM485.60) — CRITICAL: Missing TIN, non-compliant, RM20,000 penalty risk
3. **TIME Internet** (RM299) — Auto-classified as recurring Revenue Expenditure, fully deductible
4. **Petronas Mesra** (RM180) — Fuel trending 15% over budget, expenses at 79.9% of revenue
5. **Dell Technologies** (RM12,500) — CRITICAL: Delay purchase to May, save RM3,000 and preserve liquidity

Use `GET /api/seed` to populate Firestore with this demo data.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "Z.AI API key not configured" | Add `ZAI_API_KEY` to your `.env.local` file |
| Chat responses seem generic | The fallback engine is running. Check that your Z.AI key is valid |
| Neural graph lines not showing | Resize the browser window — lines are drawn based on DOM positions |
| Firebase errors in console | Safe to ignore if you're using demo mode. Add Firebase env vars to enable persistence |
| Build fails with EBUSY | Delete the `.next` folder and run `npm run build` again (OneDrive file lock issue) |
| 502 "AI returned invalid JSON" | The Z.AI response didn't match the expected schema. Check the model is `glm-5` and `response_format: json_object` is supported |

---

## License

Built for the UM Hackathon 2026 by XXX.
