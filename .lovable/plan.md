

# Autonomous Agent Economy Simulation

## Overview
A living, breathing economic simulation where AI-powered agents (Governor, Workers, Merchants) interact in a gated world. Users observe the drama unfold as agents make decisions, pay fees to survive, wager on outcomes, and remember past events.

---

## Core Features

### 1. The World Dashboard
- **Day Counter & Speed Controls** - Track simulation progress with pause/play/step controls
- **City Health Meter** - Visual indicator of overall economic stability
- **Treasury Display** - Government balance and daily tax revenue
- **Live Event Feed** - Scrolling log of agent actions and world events

### 2. Agent Cards Panel
Each agent type displayed with real-time stats:

**Governor Card (1)**
- Current policy stance (tax rate, salary rate, participation fee)
- Recent decisions with reasoning
- Confidence meter for each action

**Worker Cards (Multiple)**
- Individual balance and survival status
- Mood/satisfaction indicator
- Active wagers and predictions
- Memory highlights (recent impactful events)

**Merchant Cards (Multiple)**
- Current pricing strategy
- Profit trends
- Market position relative to others

### 3. Visual World Map
- Circular/network layout showing all agents
- Animated token flows between agents (payments, fees, wages)
- Visual connections showing economic relationships
- Color-coded agent states (thriving, struggling, expelled)

### 4. Economics Charts
- **Balance Over Time** - Line chart tracking all agent balances
- **Satisfaction Index** - Worker happiness trends
- **Price History** - Merchant pricing patterns
- **Treasury Health** - Government reserves over time
- **Expulsion Tracker** - Count of agents that have been eliminated

### 5. The Simulation Engine
- Configurable day cycle duration (real-time with dramatic pauses)
- Each day processes:
  1. Fee collection (participation costs)
  2. Governor AI decision (policy adjustments)
  3. Worker AI decisions (work, protest, negotiate, exit + wagers)
  4. Merchant AI decisions (pricing strategies)
  5. Wager resolution from previous predictions
  6. Memory updates for all agents

### 6. Memory & Emotion System
- Each agent maintains a memory log of significant events
- Emotional states influence decision confidence
- Past betrayals, successes, and losses shape future behavior
- Visual memory timeline for each agent

### 7. Wagering System
- Workers can stake tokens on predictions:
  - Tax increases/decreases
  - Salary changes
  - City collapse or stability
- 2x payout for correct predictions
- Adds gambling/risk element to survival strategy

---

## User Experience Flow

1. **Simulation Start** - World initializes with balanced economy
2. **Day Cycle Begins** - Dramatic pause as Governor contemplates policy
3. **Decisions Unfold** - Watch each agent think and act with AI reasoning displayed
4. **Consequences Ripple** - See token flows, balance changes, mood shifts
5. **Wagers Resolve** - Winners celebrate, losers despair
6. **Memory Updates** - Agents remember and react
7. **Repeat** - Until economic collapse or user stops

---

## Technical Architecture

**Frontend**
- React dashboard with multiple panels
- Real-time state updates and animations
- Charts using Recharts library
- Responsive design for different screen sizes

**Backend (Lovable Cloud)**
- Database tables for agents, world state, memories, wagers
- Edge function for AI agent decisions (Lovable AI integration)
- Simulation loop controller
- Wager resolution system

**AI Integration**
- Hybrid approach: Rule-based defaults with AI override for complex scenarios
- Each agent type has tailored prompts matching your specifications
- Confidence scores influence action execution
- Memory injection into every decision cycle

