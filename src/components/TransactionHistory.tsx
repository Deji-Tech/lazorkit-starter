import { useWallet } from '@lazorkit/wallet';

// Simple mock for transaction history since we don't have an indexer handy
// In a real app, you'd fetch this from Helius or similar
export function TransactionHistory() {
    const { isConnected, wallet } = useWallet();

    if (!isConnected || !wallet) return null;

    return (
        <div className="glass-panel p-6 rounded-xl w-full max-w-md mx-auto mt-6">
            <h3 className="text-xl font-semibold mb-4">Activity</h3>

            <div className="text-center py-8 text-gray-500">
                <p>Recent transactions will appear here.</p>
                <a
                    href={`https://explorer.solana.com/address/${wallet.smartWallet}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lazor text-sm mt-2 inline-block hover:underline"
                >
                    View on Explorer →
                </a>
            </div>
        </div>
    );
}
