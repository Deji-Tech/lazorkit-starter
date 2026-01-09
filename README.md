# LazorKit Starter

**A production-ready, premium starter kit for building Passkey-native Solana applications with [LazorKit](https://lazorkit.com).**

![LazorKit Starter Preview](https://github.com/lazorkit/assets/raw/main/starter-preview-v2.png)

## 🚀 Live Demo

**[View Live Deployment](https://lazorkit-starter.netlify.app)**
*(Use your device's biometric sensor to login - no seed phrase required)*

---

## ✨ Features

- 🔐 **Passkey Authentication**: Secure, biometric onboarding via FaceID/TouchID (WebAuthn).
- ⛽ **Gasless Transactions**: Native Kora Paymaster integration to sponsor user gas fees.
- 🤖 **AI Wallet Assistant**: Conversational interface for checking balances and asking identifying questions.
- 🖼️ **NFT Gallery**: Visual gallery with "Slide-to-Top" interaction and gasless sending.
- 🔄 **Token Swaps**: Built-in token selector and swap interface (Simulated on Devnet).
- 💾 **Session Persistence**: Robust `localStorage` management for history and sessions.
- 📱 **Premium UI**:  Glassmorphism design, smooth 6-tab navigation, and Sonner notifications.

---

## 🛠️ Tech Stack

- **Framework**: React + Vite + TypeScript
- **Styling**: TailwindCSS + Custom CSS Variables (`index.css`)
- **Solana SDKs**: `@lazorkit/wallet`, `@solana/web3.js`, `@solana/spl-token`
- **Data**: Helius DAS API (NFTs)
- **UI Libraries**: `sonner` (Toasts), `qrcode.react`

---

## 📚 Quick Start

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Deji-Tech/lazorkit-starter.git
cd lazorkit-starter
npm install
```

### 2. Environment Setup

The project comes pre-configured for **Solana Devnet**. No `.env` file is required to get started immediately.

To customize configuration (e.g., for Mainnet or custom RPC), edit `src/config/lazorkit.ts`:

```typescript
export const LAZORKIT_CONFIG = {
  // Your RPC URL
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://api.devnet.solana.com', 
  // Your Paymaster URL
  paymaster: {
    paymasterUrl: 'YOUR_PAYMASTER_URL' 
  }
};
```

### 3. Run Development Server

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the app.

> **Note**: Passkeys function best in secure contexts (`https://` or `localhost`). If testing on a mobile device via network IP, you must use a tunneling service like **ngrok**.

---

## 📖 Step-by-Step Tutorials

We have included detailed guides to help you understand the integration:

1. [**Create a Passkey Wallet**](./docs/tutorial-01-passkey-wallet.md)
   *Learn how to implement the `useWallet` hook and connection flow.*

2. [**Gasless Transactions**](./docs/tutorial-02-gasless-transfer.md)
   *How to use the Paymaster to sponsor transactions for your users.*

3. [**Session Persistence**](./docs/tutorial-03-session-persistence.md)
   *Managing user sessions and auto-reconnection across devices.*

---

## 📂 Project Structure

```bash
src/
├── components/         # React Components
│   ├── AIChatbot.tsx       # AI Assistant logic
│   ├── ConnectWallet.tsx   # Auth button
│   ├── GaslessTransfer.tsx # Paymaster transfer logic
│   ├── NFTGallery.tsx      # NFT fetching & display
│   ├── TokenSwap.tsx       # Simulated Swap UI
│   └── ...
├── config/             # App & SDK Configuration
├── providers/          # Context Providers (LazorkitProvider)
├── utils/              # Helper stores (tokenStore, transactionStore)
└── App.tsx             # Main Layout & Tab Navigation
```

## License

MIT
