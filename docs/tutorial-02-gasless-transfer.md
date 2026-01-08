# Tutorial 2: Gasless Transactions on Solana

This tutorial explains how to send gasless transactions using the LazorKit SDK. Traditionally, a user needs SOL to pay for transaction fees. With LazorKit's Paymaster integration, you can sponsor these fees for your users, removing a huge friction point.

## How it Works

1. **User signs message**: The user signs the instruction with their Passkey.
2. **Paymaster sponsorship**: The SDK sends the transaction to a Paymaster service.
3. **Execution**: The Paymaster pays the SOL fee and submits the transaction to the network.

## Implementation

The key function is `signAndSendTransaction` with the `feeMode: 'paymaster'` option.

```tsx
// src/components/GaslessTransfer.tsx
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey } from '@solana/web3.js';

export function GaslessTransfer() {
  const { signAndSendTransaction, smartWalletPubkey } = useWallet();

  const handleTransfer = async () => {
    // 1. Create the Instruction
    // Note: The 'fromPubkey' MUST be the smart wallet PDA
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey('RECIPIENT_ADDRESS'),
      lamports: 1000000 
    });

    // 2. Send via Paymaster
    const signature = await signAndSendTransaction({
      instructions: [instruction],
      transactionOptions: {
        feeToken: 'paymaster', // <--- Magic happens here
        computeUnitLimit: 500_000,
        clusterSimulation: 'devnet'
      }
    });

    console.log('Gasless Tx Sent:', signature);
  };
    
  return <button onClick={handleTransfer}>Send Free Tx</button>;
}
```

## Important Considerations

- **Verification**: The Paymaster service verifies that the transaction meets its sponsorship policies (e.g., only specific contracts, daily limits).
- **Smart Account Only**: This only works for Smart Accounts (PDAs), not traditional Keypair wallets.
- **Compute Budget**: Always set a `computeUnitLimit` to ensure the Paymaster can accurately estimate fees.
