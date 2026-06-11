# Index-Aligner
One-click index rebalancing tool for SSI Protocol holders using SoSoValue API and SoDEX
---

Index Aligner

Keep your SSI index portfolio balanced — automatically.

Official Submission | Wave 2 | SoSoValue Buildathon 2026

---

Table of Contents

1. What Is Index Aligner?
2. The Problem We Solve
3. Who Is This For?
4. How It Works
5. Quick Start Guide
6. Features
7. For Developers
8. Technical Details
9. Roadmap
10. Support

---

What Is Index Aligner?

Index Aligner is a web tool that helps you maintain your SSI Protocol index portfolio at its target weights.

Instead of manually checking prices and doing complicated math, Index Aligner does everything for you:

· Fetches live market prices
· Compares your current holdings to your target
· Tells you exactly what to buy and sell
· (Optional) Executes the trades with one click

Time saved: 15 minutes of manual work → 30 seconds.

---

The Problem We Solve

Scenario

You bought $1,000 worth of the SSI Top 10 Index with these target weights:

Asset Target
Bitcoin 40%
Ethereum 30%
Solana 15%
Other 7 coins 15% (combined)

One month later

Bitcoin pumped. Ethereum dipped. Now your portfolio looks like this:

Asset Current Problem
Bitcoin 52% ⚠️ Too heavy
Ethereum 22% ⚠️ Too light
Solana 14% ✓ Okay
Others 12% ✓ Okay

What Index Aligner Does

It instantly tells you:

Sell: $120 worth of Bitcoin
Buy: $120 worth of Ethereum

One click. Problem solved.

---

Who Is This For?

User Type Why They Need Index Aligner
Beginner investors Don't know how to rebalance or calculate deviations
Busy professionals No time to monitor portfolios daily
DAO treasuries Need systematic portfolio maintenance
Solo fund managers Want automation without hiring a team
DeFi power users Want to stay true to their index strategy

No prior experience required. If you can use MetaMask, you can use Index Aligner.

---

How It Works

Simple Explanation (30 seconds)

```
┌─────────────────────────────────────────────────────────┐
│ │
│ 1. Connect Wallet │
│ ↓ │
│ 2. Index Aligner reads your index holdings │
│ ↓ │
│ 3. Fetches live prices from SoSoValue API │
│ ↓ │
│ 4. Calculates: Current vs Target weights │
│ ↓ │
│ 5. Shows you: "Buy this, Sell that" │
│ ↓ │
│ 6. One click → Trades execute via SoDEX │
│ │
└─────────────────────────────────────────────────────────┘
```

Technical Flow (For the curious)

Step Action Data Source
1 User connects Web3 wallet MetaMask / Ethers.js
2 Fetch index composition SSI Protocol (on-chain)
3 Fetch current prices SoSoValue API
4 Calculate weight deviations Local computation
5 Generate rebalance orders Algorithmic
6 Execute trades (optional) SoDEX API

---

Quick Start Guide

Requirements

Item Details
Browser Chrome, Firefox, or Brave
Wallet MetaMask extension installed
Token Any SSI Protocol index token
Gas Small amount of ETH for execution (if used)

Step-by-Step (3 minutes total)

Step 1: Open Index Aligner

Go to: [Insert your live demo link here]

Step 2: Connect Your Wallet

Click the "Connect Wallet" button in the top right.
Select MetaMask and approve the connection.

Step 3: Review Your Portfolio

Index Aligner will automatically:

· Detect which SSI index you hold
· Show your current weights
· Show your target weights
· Highlight deviations in red/green

Step 4: Get Your Rebalance Orders

The tool will display:

```
┌────────────────────────────────────┐
│ REBALANCE ORDERS │
├────────────────────────────────────┤
│ SELL: 0.032 BTC ($120) │
│ BUY: 0.85 ETH ($120) │
│ │
│ Estimated fee: $0.85 │
│ Risk level: Low │
└────────────────────────────────────┘
```

Step 5: Execute (Optional)

Click "Execute Rebalance" → Confirm in MetaMask → Done.

Your portfolio is now balanced.

---

Features

Core Features (Wave 2)

Feature Status Description
Live price fetching ✅ Complete Via SoSoValue API
Deviation calculation ✅ Complete Shows % over/under
Rebalance order generation ✅ Complete Exact buy/sell amounts
Wallet connection ✅ Complete MetaMask supported
Clean dashboard ✅ Complete Easy to read at a glance
Risk warnings ✅ Complete Shows fees and confirms before action

Bonus Features (Wave 3)

Feature Status Description
One-click execution 🔄 Planned Via SoDEX API
Historical log 🔄 Planned See past rebalances
Multiple index support 🔄 Planned Any SSI index
Email alerts 🔄 Planned Notify when rebalance needed
Dark mode 🔄 Planned Easier on the eyes

---

For Developers

Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/[your-username]/Index-Aligner.git

# 2. Enter the project folder
cd Index-Aligner

# 3. Open the app (no build required)
# Simply open index.html in your browser
# Or run a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

API Key Setup

1. Register for a free account at SoSoValue
2. Generate your API key from the developer dashboard
3. Open app.js and replace YOUR_API_KEY_HERE with your actual key

```javascript
// Before
const SOSO_API_KEY = "YOUR_API_KEY_HERE";

// After
const SOSO_API_KEY = "sk_live_abc123xyz789";
```

File Structure

```
Index-Aligner/
│
├── index.html # Main application page
├── style.css # Visual styling and layout
├── app.js # Core logic (API, calculations, wallet)
├── README.md # This documentation
│
└── /assets
└── /images # Icons and screenshots (if any)
```

Dependencies

Library Version Purpose
ethers.js v6 Wallet connection & on-chain reads
SoSoValue API v1 Real-time price data
SoDEX API v1 (optional) Trade execution

No framework required. Pure HTML/CSS/JavaScript.

---

Technical Details

API Integration

Endpoint Usage
GET /api/v1/prices Fetch current prices for BTC, ETH, SOL, etc.
GET /api/v1/index/composition Get SSI index target weights

Smart Contract Interaction

```javascript
// Example: Reading SSI index composition
const indexContract = new ethers.Contract(
"0x...", // SSI Protocol contract address
abi,
provider
);
const composition = await indexContract.getComponents();
```

Calculation Logic

```
Deviation (%) = (Current Weight - Target Weight) / Target Weight × 100

If deviation > +5% → Sell
If deviation < -5% → Buy
```

---

Roadmap

Wave 2 (Current) — May 23 to Jun 3, 2026

· ✅ SoSoValue API integration
· ✅ Deviation calculation engine
· ✅ Basic UI dashboard
· ✅ Wallet connection
· ✅ Risk controls

Wave 3 (Upcoming) — Jun 14 to Jun 25, 2026

· 🔲 SoDEX one-click execution
· 🔲 Support for all SSI indexes
· 🔲 Historical rebalance log
· 🔲 Email/discord alerts
· 🔲 Mobile responsive design

Demo Day (TBD)

· 🔲 Live presentation
· 🔲 Judge Q&A
· 🔲 Potential follow-up collaboration

---

Support

Contact

Channel Information
Discord [big_izi]
Email [olubusuyiisaiah27@gmail.com]

FAQ

Q: Do I need to know how to code?
A: No. Index Aligner works like any other web app. Connect your wallet and click buttons.

Q: Is this safe?
A: Yes. All transactions require your explicit approval in MetaMask. The app never holds your private keys.

Q: What does it cost?
A: The tool is free. You only pay gas fees when executing trades (same as any DeFi transaction).

Q: Which indexes are supported?
A: Currently supports SSI Top 10 Index. More coming in Wave 3.

Q: What chains does this work on?
A: Ethereum Mainnet (other chains coming in Wave 3).

---

Acknowledgments

Contributor Role
SoSoValue Data API provider
SoSoValueIndexes SSI Protocol infrastructure
SoDEX Execution layer
Buildathon Judges Evaluation and feedback

---

License

This project is submitted as part of the SoSoValue Buildathon 2026.
Source code is available for review by the judging committee.

---

Submission Status

Wave Status Allocation
Wave 1 Not entered —
Wave 2 ✅ Submitted 3,000 USDC (target)
Wave 3 🔜 Planned 4,000 USDC (target)

---

Built by a solo builder for the SoSoValue Buildathon
One-person empire, on-chain.

---

Quick Reference (For GitHub Preview)

```markdown
# Index Aligner

**Keep your SSI index portfolio balanced — automatically.**

[🔗 Live Demo](link) | [📹 Video Walkthrough](link)

## What it does
Fetches live prices via SoSoValue API, compares your current holdings to target weights, and tells you exactly what to buy/sell to rebalance.

## How to use (3 minutes)
1. Connect MetaMask
2. See your current vs target weights
3. Click "Execute" to trade

## Built with
- SoSoValue API (prices)
- SoDEX API (trades)
- Ethers.js (wallet)

## Wave 2 Buildathon
- Solo developer
- Complete research-to-execution flow
- Risk controls included
```
