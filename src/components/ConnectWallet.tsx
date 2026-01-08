import { useWallet } from '@lazorkit/wallet';

/**
 * ConnectWallet Component
 * 
 * Handles strict passkey authentication flow.
 * Shows different states: connected (disconnect button) or disconnected (connect button).
 */
export function ConnectWallet() {
    const { connect, disconnect, isConnected, isConnecting, wallet } = useWallet();

    // If connected, show disconnect button with wallet address preview
    if (isConnected && wallet) {
        return (
            <button
                onClick={() => disconnect()}
                className="btn btn-secondary text-sm backdrop-blur-md"
            >
                <span>Disconnect</span>
                <span className="opacity-50">|</span>
                <span className="font-mono text-lazor">
                    {wallet.smartWallet.slice(0, 4)}...{wallet.smartWallet.slice(-4)}
                </span>
            </button>
        );
    }

    // If disconnected, show connect button
    return (
        <button
            onClick={() => connect()}
            disabled={isConnecting}
            className={`btn btn-primary ${isConnecting ? 'opacity-80' : ''}`}
        >
            {isConnecting ? (
                <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></span>
                    Authenticating...
                </>
            ) : (
                <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Connect with Passkey
                </>
            )}
        </button>
    );
}
