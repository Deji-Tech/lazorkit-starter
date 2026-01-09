import { useWallet } from '@lazorkit/wallet';
import { useEffect, useState } from 'react';
import { transactionStore, type TransactionItem } from '../utils/transactionStore';

export function TransactionHistory() {
    const { isConnected, wallet } = useWallet();
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);

    useEffect(() => {
        if (wallet?.smartWallet) {
            // Load initially
            setTransactions(transactionStore.getAll(wallet.smartWallet));
        }

        // Simple poll to keep updated if other tabs change it
        const interval = setInterval(() => {
            if (wallet?.smartWallet) {
                setTransactions(transactionStore.getAll(wallet.smartWallet));
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    if (!isConnected) return null;

    return (
        <div className="glass-panel p-6 rounded-2xl w-full max-w-lg mx-auto mt-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Activity</h3>
                <button
                    onClick={() => {
                        if (wallet?.smartWallet) {
                            transactionStore.clear(wallet.smartWallet);
                            setTransactions([]);
                        }
                    }}
                    className="text-xs text-secondary hover:text-white"
                >
                    Clear History
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 text-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <p className="text-secondary">No recent activity</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'swapped' ? 'bg-purple-500/20 text-purple-400' :
                                    tx.type === 'sent' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                                    }`}>
                                    {tx.type === 'swapped' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>}
                                    {tx.type === 'sent' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm capitalize">{tx.description || tx.type}</div>
                                    <div className="text-xs text-secondary">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString()}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-medium">{tx.type === 'sent' ? '-' : '+'}{tx.amount} {tx.token}</div>
                                {tx.signature ? (
                                    <a
                                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-lazor hover:underline opacity-80"
                                    >
                                        View On-Chain
                                    </a>
                                ) : (
                                    <a
                                        href={`https://explorer.solana.com/address/${wallet?.smartWallet || ''}?cluster=devnet`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-gray-500 hover:text-white hover:underline opacity-60"
                                        title="Simulated Transaction - View Wallet History"
                                    >
                                        View Wallet (Simulated)
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
