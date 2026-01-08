# LazorKit Starter

A premium, production-ready starter kit for building Passkey-native Solana applications with [LazorKit](https://lazorkit.com).

![LazorKit Starter Preview](https://lazorkit.com/preview-image.png)

## Features

- 🔐 **Passkey Authentication**: Secure, seedless onboarding via FaceID/TouchID.
- ⛽ **Gasless Transactions**: Native integration with Paymaster to sponsor user fees.
- 🔄 **Smart Accounts**: Built on top of robust PDA-based smart wallets.
- 💾 **Session Persistence**: Auto-reconnect functionality out of the box.
- 🎨 **Premium UI**: Modern dark-mode interface with glassmorphism effects.

## Quick Start

### 1. Installation

Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd lazorkit-starter
npm install
```

### 2. Environment Setup

LazorKit works with valid defaults for Devnet, so no immediate configuration is required to get started.

To customize your setup (e.g., for Mainnet), edit `src/config/lazorkit.ts`:

```typescript
export const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  paymaster: {
    paymasterUrl: 'YOUR_PAYMASTER_URL'
  }
};
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

> **Note**: Passkeys require a secure context. They work on `localhost`, but if you access via network IP, you must use HTTPS.

## Tutorials

We have included step-by-step guides to help you understand the integration:

1. [**Create a Passkey Wallet**](./docs/tutorial-01-passkey-wallet.md) - Learn the auth flow.
2. [**Gasless Transactions**](./docs/tutorial-02-gasless-transfer.md) - Sponsor fees for users.
3. [**Session Persistence**](./docs/tutorial-03-session-persistence.md) - Manage user sessions.

## Project Structure

```
src/
├── components/       # UI Components
│   ├── ConnectWallet.tsx   # Auth button
│   ├── GaslessTransfer.tsx # Paymaster integration
│   └── WalletInfo.tsx      # Account details
├── config/           # App configuration
├── providers/        # LazorkitProvider wrapper
└── App.tsx           # Main entry point
```

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Premium Design System)
- **Solana SDK**: `@lazorkit/wallet`, `@solana/web3.js`

## License

MIT
