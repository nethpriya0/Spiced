# 🌶️ Spice Platform

A decentralized marketplace for transparent spice provenance built with Web3 technology.

## 🎯 Project Overview

The Spice Platform empowers smallholder farmers in Sri Lanka to create immutable digital passports for their spices, enabling transparent provenance tracking and fair pricing in the global marketplace.

## 🏗️ Architecture

This is a monorepo built with:

- **Frontend**: Next.js with T3 Stack (TypeScript, Tailwind, tRPC)
- **Smart Contracts**: Hardhat with Solidity 0.8.20
- **Authentication**: Web3Auth for email-based wallet creation
- **Storage**: IPFS for decentralized data storage
- **Blockchain**: Ethereum Sepolia testnet

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 10+
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd spice-platform

# Install dependencies
npm install

# Copy environment files
cp .env.example .env
cp apps/nextjs/.env.example apps/nextjs/.env.local
cp packages/contracts/.env.example packages/contracts/.env

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Monorepo Structure

```
spice-platform/
├── apps/
│   └── nextjs/          # Next.js frontend application
├── packages/
│   ├── contracts/       # Hardhat smart contracts
│   ├── types/          # Shared TypeScript types
│   ├── ui/             # Shared React components
│   └── tsconfig/       # Shared TypeScript configuration
└── docs/               # Project documentation
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start Next.js development server
npm run build           # Build all packages
npm run test            # Run all tests
npm run lint            # Run linting across all packages

# Smart Contracts
npm run contracts:compile   # Compile smart contracts
npm run contracts:test     # Run contract tests
npm run contracts:deploy   # Deploy to Sepolia testnet
```

## 🌐 Environment Configuration

Key environment variables (see `.env.example`):

- `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` - Web3Auth client ID
- `NEXT_PUBLIC_RPC_URL` - Ethereum RPC endpoint
- `PINATA_API_KEY` - IPFS storage credentials
- `PRIVATE_KEY` - Deployment wallet private key

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run contract tests only
npm run contracts:test

# Run frontend tests only
npm run test --workspace=apps/nextjs
```

## 🚢 Deployment

### Smart Contracts

```bash
# Deploy to Sepolia testnet
npm run contracts:deploy

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Frontend

The frontend is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

## 📚 Project Documentation

- [Architecture Documents](./docs/architecture/)
- [Product Requirements](./docs/prd/)
- [User Stories](./docs/stories/)
- [UI/UX Specifications](./docs/ui-ux-spec.md)

## 🤝 Contributing

This project follows Epic-based development:

1. **Epic 1**: Foundation & Farmer Onboarding ✅
2. **Epic 2**: Digital Passport & Provenance Tracking
3. **Epic 3**: Marketplace Discovery & Verification  
4. **Epic 4**: End-to-End Transactions & Dispute Resolution
5. **Epic 5**: Advanced Features - ZKP & Farmer Tools

See individual story documents in `docs/stories/` for detailed implementation requirements.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🌟 Built With

- [Next.js](https://nextjs.org/) - React framework
- [T3 Stack](https://create.t3.gg/) - Full-stack TypeScript
- [Hardhat](https://hardhat.org/) - Smart contract development
- [Web3Auth](https://web3auth.io/) - Authentication
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract security
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [IPFS](https://ipfs.io/) - Decentralized storage