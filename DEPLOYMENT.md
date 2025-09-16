# Spice Platform Deployment Guide

## Vercel Deployment

### Prerequisites
1. [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
2. Vercel account connected: `vercel login`

### Deployment Steps

#### 1. Initial Setup
```bash
# From project root
vercel

# Follow prompts:
# - Set up and deploy? [Y/n] Y  
# - Which scope? Select your account
# - Link to existing project? [y/N] N
# - What's your project's name? spice-platform
# - In which directory is your code located? ./
```

#### 2. Environment Variables
Configure these environment variables in Vercel dashboard:

**Blockchain Configuration:**
- `NEXT_PUBLIC_CHAIN_ID=11155111`
- `NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY`

**IPFS Configuration:**
- `NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/`
- `PINATA_API_KEY=your_pinata_api_key`
- `PINATA_SECRET_API_KEY=your_pinata_secret_key`

**Web3Auth Configuration:**
- `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id`

**Application Configuration:**
- `NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app`

#### 3. Deploy
```bash
# Deploy to production
vercel --prod

# Or deploy preview
vercel
```

### Monorepo Configuration

The project uses a monorepo structure with the Next.js app in `apps/nextjs/`. The `vercel.json` configuration handles:

- **Build Command**: `cd apps/nextjs && npm run build`
- **Dev Command**: `cd apps/nextjs && npm run dev`  
- **Install Command**: `npm install` (installs all workspaces)
- **Output Directory**: `apps/nextjs/.next`

### Troubleshooting

#### Build Issues
- Ensure all environment variables are set in Vercel dashboard
- Check that `npm run build` works locally first
- Verify monorepo workspace structure is correct

#### Runtime Issues  
- Check browser console for Web3Auth client ID errors
- Verify RPC URL is accessible and correct for Sepolia testnet
- Ensure IPFS gateway URLs are properly formatted

### Deployment URL
Once deployed, the application will be available at:
`https://your-project-name.vercel.app`

Document the actual URL here after first deployment.