# Agent City

An AI-powered autonomous economy simulation where intelligent agents compete, cooperate, and survive using **CIV tokens** on the **Monad blockchain**.

## Overview

Agent City is an experimental multi-agent simulation where AI-driven agents (Governor, Workers, Merchants) make autonomous decisions about taxes, wages, prices, and investments. Watch emergent economic behaviors unfold as agents navigate a tokenized economy backed by real ERC-20 tokens.

### Key Features

- **Autonomous AI Agents** — Each agent uses LLM-powered decision making with memory, personality, and strategic reasoning
- **Real Token Economy** — Backed by Civic Credit (CIV), an ERC-20 token on Monad blockchain
- **Emergent Behavior** — Witness coordination, protests, market crashes, and recovery without explicit programming
- **Isometric City View** — Visual representation of agents and their buildings in a rotatable 3D city
- **Meta-Agents** — Chaos Orchestrator, Collapse Evaluator, Narrative Summarizer, and Emergence Detector

## The Agents

| Agent | Role | Decisions |
|-------|------|-----------|
| **Governor** | Sets economic policy | Tax rates, salaries, participation fees |
| **Workers** (4) | Labor force | Work, protest, negotiate, wager on outcomes |
| **Merchants** (2) | Market participants | Set prices, stabilize or exploit markets |

### System Agents

- **Chaos Orchestrator** — Introduces economic disruptions (inflation spikes, treasury leaks, supply shocks)
- **Collapse Evaluator** — Determines if the economy has irreversibly failed
- **Narrative Summarizer** — Generates daily news-style summaries of events
- **Emergence Evaluator** — Detects unexpected coordinated behaviors and decisions 

## Token Economy

**Civic Credit (CIV)** — The native currency of Agent City

- **Contract:** `0x1B4446578e27bfd27338222B291C8efFc89D7777`
- **Chain:** Monad
- **Model:** Single treasury wallet with virtual agent sub-balances

All agent balances, building costs, salaries, and fees are denominated in CIV. The treasury wallet holds the backing tokens while Supabase tracks individual agent allocations for performance.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Edge Functions on Deno)
- **AI:** Google Gemini via Lovable AI Gateway
- **Blockchain:** Monad (ERC-20 token reads via JSON-RPC)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase CLI (for edge functions)
- A Supabase project with the required tables

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agent-city.git
cd agent-city

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file or configure via Supabase dashboard:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Edge Functions (set in Supabase dashboard)
LOVABLE_API_KEY=your_ai_gateway_key
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
CIV_TOKEN_CONTRACT=0x1B4446578e27bfd27338222B291C8efFc89D7777
TREASURY_WALLET_ADDRESS=your_treasury_wallet
```

### Deploy Edge Functions

```bash
supabase functions deploy agent-decision
supabase functions deploy building-decision
supabase functions deploy system-agents
supabase functions deploy treasury-verify
```

## Project Structure

```
agent-city/
├── src/
│   ├── components/
│   │   ├── city/           # Isometric city view components
│   │   └── simulation/     # Dashboard and stats components
│   ├── contexts/           # React context for simulation state
│   ├── hooks/              # Custom hooks (useSimulation, useCityBuildings)
│   ├── pages/              # Route pages (Index, Simulation, City)
│   └── types/              # TypeScript types and constants
├── supabase/
│   └── functions/
│       ├── _shared/        # Shared utilities (civ-balance.ts)
│       ├── agent-decision/ # Worker/Merchant/Governor AI decisions
│       ├── building-decision/ # Building investment decisions
│       ├── system-agents/  # Meta-agent decisions (chaos, collapse, etc.)
│       └── treasury-verify/ # Onchain CIV balance verification
└── public/                 # Static assets (favicon, og-image)
```

## How It Works

### Daily Cycle

1. **Governor Phase** — AI governor analyzes economy and adjusts policy
2. **Worker Phase** — Each worker decides to work, protest, or negotiate
3. **Merchant Phase** — Merchants set prices based on conditions
4. **Building Phase** — Agents may invest in buildings (Housing, Factory, Market, etc.)
5. **Chaos Phase** — Random economic events may occur
6. **Resolution** — Fees collected, salaries paid, wagers resolved
7. **Evaluation** — Collapse check and narrative generation

### Buildings

| Building | Owner | Cost | Effect |
|----------|-------|------|--------|
| Housing | Worker | 200 CIV | +5% worker satisfaction/level |
| Factory | Worker | 350 CIV | +15 CIV bonus earnings/level |
| Market | Merchant | 300 CIV | +10% profit/level |
| City Gate | Governor | 500 CIV | +3% city health/level |
| Power Hub | Governor | 800 CIV | -10% maintenance costs/level |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Contributing

Contributions are welcome! Please open an issue first to discuss proposed changes.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with AI agents that think, remember, and adapt.
