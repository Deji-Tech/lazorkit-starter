# Tutorial 1: Create a Passkey-Based Wallet

This tutorial will guide you through creating a passkey wallet using the LazorKit SDK. Passkey wallets use WebAuthn credentials (TouchID, FaceID, etc.) instead of seed phrases, providing superior security and UX.

## Prerequisite: `LazorkitProvider`

Before using any wallet hooks, your app must be wrapped in the `LazorkitProvider`.

```tsx
// src/providers/LazorkitWrapper.tsx
import { LazorkitProvider } from '@lazorkit/wallet';

export function LazorkitWrapper({ children }) {
  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
    >
      {children}
    </LazorkitProvider>
  );
}
```

## Step 1: The Connection Hook

The `useWallet` hook exposes everything you need to manage the wallet state.

```tsx
// src/components/ConnectWallet.tsx
import { useWallet } from '@lazorkit/wallet';

export function ConnectWallet() {
  const { 
    connect,      // Trigger connection flow
    disconnect,   // Sign out
    isConnected,  // Boolean state
    isConnecting  // Loading state
  } = useWallet();

  return (
    <button onClick={() => connect()}>
      {isConnecting ? 'Authenticating...' : 'Connect Wallet'}
    </button>
  );
}
```

## Step 2: Handling the Flow

1. **User Clicks Connect**: The `connect()` function is called.
2. **Portal Opens**: A secure popup from `portal.lazor.sh` appears.
3. **Biometric Prompt**: The browser asks the user for FaceID/TouchID.
4. **Key Generation**: A new key pair is generated in the Secure Enclave.
5. **Smart Wallet Creation**: On the first login, a smart account (PDA) is derived for this user.
6. **Session Established**: The user is logged in, and `isConnected` becomes `true`.

## Step 3: Accessing Wallet Data

Once connected, the `wallet` object contains critical information:

```tsx
const { wallet } = useWallet();

if (wallet) {
  console.log('Smart Account:', wallet.smartWallet); // Use this to receive funds
  console.log('Credential ID:', wallet.credentialId);
  console.log('Platform:', wallet.platform);
}
```

> [!IMPORTANT]
> Always use `wallet.smartWallet` as the public address for receiving funds. Do not use the raw passkey public key, as it cannot hold SOL directly.

## Next Steps

Now that you have a wallet, [learn how to send gasless transactions](./tutorial-02-gasless-transfer.md).
