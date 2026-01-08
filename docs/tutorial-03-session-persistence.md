# Tutorial 3: Session Persistence

LazorKit automatically handles session persistence, allowing users to return to your app without re-authenticating every time.

## How it Works

When a user connects:
1. The SDK stores a session token in `localStorage`.
2. On page load, the SDK checks for this token.
3. If valid, the `isConnected` state is automatically set to `true`.
4. The `wallet` object is repopulated with the user's details.

## Implementation

Session persistence works out-of-the-box with the `LazorkitProvider`. You don't need to write custom logic.

### Auto-Connect Logic

You can check `isConnecting` to show a loading state while the SDK restores the session.

```tsx
// src/components/RequireAuth.tsx
import { useWallet } from '@lazorkit/wallet';

export function RequireAuth({ children }) {
  const { isConnected, isConnecting } = useWallet();

  if (isConnecting) {
    return <div>Restoring session...</div>;
  }

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return children;
}
```

### Disconnect

To clear the session, simply call `disconnect()`. This removes the local storage data.

```tsx
const { disconnect } = useWallet();

<button onClick={() => disconnect()}>Sign Out</button>
```

## Cross-Device Sessions

Passkeys are synced via the cloud provider (iCloud Keychain for Apple, Google Password Manager for Android).
- **Same Platform**: If a user creates a passkey on their iPhone, they can log in on their MacBook automatically if both are signed into the same iCloud.
- **Different Platform**: If a user moves from iPhone to Windows, they can use "Hybrid Transport" (scanning a QR code) to sign in securely. The Smart Account address remains the same across devices.
