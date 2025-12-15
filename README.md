# Tradewave - B2B Trade & Logistics Platform

A boutique B2B trade and logistics platform with blockchain-powered transparency and secure escrow payments.

## 🚀 Overview

Tradewave streamlines international B2B trade by combining:
- **Secure Escrow Payments** - FIAT-based payment protection
- **Blockchain Verification** - Immutable record-keeping and document verification
- **Smart Contract Automation** - Automated contract execution (non-payment)
- **Curated Supplier Network** - Verified and rated suppliers

> **Important**: Blockchain is used for transparency and audit trails, NOT for cryptocurrency payments. All payments are traditional FIAT-based.

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Ethereum wallet (for contract deployment)
- Infura/Alchemy account (for RPC access)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tradewave
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
# Optional: Seed the database
npx prisma db seed
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔗 Blockchain Setup

### Smart Contract Deployment

1. **Configure Hardhat**
   - Set `DEPLOYER_PRIVATE_KEY` in `.env.local`
   - Set `SEPOLIA_RPC_URL` or `POLYGON_MUMBAI_RPC_URL`

2. **Compile contracts**
```bash
npm run contracts:compile
```

3. **Deploy to testnet**
```bash
npm run contracts:deploy:sepolia
# or
npm run contracts:deploy:mumbai
```

4. **Verify contracts (optional)**
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Contract Architecture

| Contract | Purpose |
|----------|---------|
| `TradeAgreement.sol` | Records trade agreement details and milestones |
| `DocumentVerification.sol` | Stores document hashes for verification |
| `EscrowRecord.sol` | Records escrow status (NOT fund management) |
| `AuditLog.sol` | Immutable audit trail for all actions |

> **Note**: Smart contracts do NOT handle funds. They only record events and provide verification.

## 🏗️ Project Structure

```
tradewave/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── api/               # API routes
│   │   └── dashboard/         # Dashboard pages
│   ├── components/
│   │   ├── ui/                # Shadcn/ui components
│   │   ├── landing/           # Landing page sections
│   │   ├── layout/            # Layout components
│   │   └── blockchain/        # Blockchain UI components
│   ├── lib/
│   │   ├── blockchain/        # Web3 client, ABIs, services
│   │   ├── context/           # React context providers
│   │   ├── db/                # Prisma client
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
│   ├── styles/                # Global CSS and Tailwind
│   └── types/                 # TypeScript definitions
├── contracts/                  # Solidity smart contracts
├── scripts/                    # Deployment scripts
├── prisma/                     # Database schema
└── public/                     # Static assets
```

## 🔑 Environment Variables

Required variables for `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Blockchain
NEXT_PUBLIC_RPC_URL_SEPOLIA="https://sepolia.infura.io/v3/..."
DEPLOYER_PRIVATE_KEY="0x..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run contracts:compile` | Compile smart contracts |
| `npm run contracts:test` | Run contract tests |
| `npm run contracts:deploy:sepolia` | Deploy to Sepolia testnet |

## 🔒 Security Considerations

- All payments are FIAT-based via Stripe
- Smart contracts are documentation tools only
- No cryptocurrency transactions
- No token mechanics
- Private keys stored securely (never in code)
- Environment variables for sensitive data

## 📊 Key Features

### For Buyers
- Submit requirements with specifications
- Receive curated quotations
- Secure escrow payments
- Real-time order tracking
- Blockchain-verified documents

### For Admins
- Supplier management
- Requirement sourcing
- Transaction monitoring
- Escrow management
- Audit trail access

### Blockchain Features
- Document hash verification
- Immutable audit logs
- Trade agreement recording
- Escrow status tracking
- Smart contract automation

## 🧪 Testing

```bash
# Run Next.js tests
npm run test

# Run smart contract tests
npm run contracts:test
```

## 📄 License

Proprietary - All rights reserved.

## 🤝 Support

For support, email support@tradewave.io or visit our [Help Center](/help).
