import { useState, useEffect } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL, Connection, clusterApiUrl } from '@solana/web3.js';
import { transactionStore } from '../utils/transactionStore';
import { tokenStore } from '../utils/tokenStore';
import { toast } from 'sonner';

export function GaslessTransfer() {
    const { signAndSendTransaction, signMessage, smartWalletPubkey, isConnected } = useWallet();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('0.1');
    const [feeMode, setFeeMode] = useState<'paymaster' | 'user'>('paymaster');

    // UI state from TokenStore (Virtual Balance)
    const [balance, setBalance] = useState<number>(() => {
        const stored = tokenStore.getAll().find(t => t.id === 'sol');
        return stored ? stored.balance : 0;
    });

    const [loading, setLoading] = useState(false);
    const [airdropLoading, setAirdropLoading] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);
    const [errorDescription, setErrorDescription] = useState<string | null>(null);
    const [fullError, setFullError] = useState<string | null>(null);

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Initial Load: Sync Real Balance
    useEffect(() => {
        if (isConnected && smartWalletPubkey) {
            const currentStore = tokenStore.getAll().find(t => t.id === 'sol');
            connection.getBalance(smartWalletPubkey).then(lamports => {
                const real = lamports / LAMPORTS_PER_SOL;
                if ((currentStore?.balance === 1.24 && real !== 1.24) || (currentStore?.balance === 0 && real > 0)) {
                    tokenStore.updateBalance('sol', real);
                    setBalance(real);
                }
            });
        }
    }, [isConnected, smartWalletPubkey]);

    // Poll Store for UI
    useEffect(() => {
        const interval = setInterval(() => {
            const sol = tokenStore.getAll().find(t => t.id === 'sol');
            if (sol && sol.balance !== balance) {
                setBalance(sol.balance);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [balance]);

    const handleAirdrop = async () => {
        if (!smartWalletPubkey) return;
        setAirdropLoading(true);
        const toastId = toast.loading('Requesting Devnet Airdrop...');
        try {
            const sig = await connection.requestAirdrop(smartWalletPubkey, 1 * LAMPORTS_PER_SOL);
            await connection.confirmTransaction(sig);

            const newBal = await connection.getBalance(smartWalletPubkey);
            const val = newBal / LAMPORTS_PER_SOL;
            tokenStore.updateBalance('sol', val);
            setBalance(val);
            toast.success('Airdrop Successful!', { id: toastId, description: '1 SOL added to your wallet.' });
        } catch (e) {
            console.error('Airdrop failed', e);
            toast.error('Airdrop Failed', {
                id: toastId,
                description: 'Devnet is rate-limited.',
                action: {
                    label: 'Use Faucet',
                    onClick: () => window.open('https://faucet.solana.com/', '_blank')
                }
            });
        } finally {
            setAirdropLoading(false);
        }
    };

    const handleTestSign = async () => {
        if (!signMessage) {
            toast.error('Not Supported', { description: 'signMessage not supported by this wallet' });
            return;
        }
        const toastId = toast.loading('Waiting for biometric signature...');
        try {
            setLoading(true);
            await signMessage("Hello LazorKit!");
            toast.success('Message Signed!', { id: toastId, description: 'Passkey authentication verified.' });
        } catch (e: any) {
            console.error('Sign message failed', e);
            toast.error('Signing Failed', { id: toastId, description: 'Signature rejected or timed out.' });
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!smartWalletPubkey) return;

        setLoading(true);
        setErrorDescription(null);
        setFullError(null);
        setSignature(null);

        const toastId = toast.loading(feeMode === 'paymaster' ? 'Sending Gasless Transaction...' : 'Sending Transaction...');

        try {
            if (balance !== null && parseFloat(amount) > balance && feeMode === 'user') {
                throw new Error('Insufficient funds (Simulated).');
            }

            const destPubkey = new PublicKey(recipient || '11111111111111111111111111111111');
            const transferIx = SystemProgram.transfer({
                fromPubkey: smartWalletPubkey,
                toPubkey: destPubkey,
                lamports: parseFloat(amount) * LAMPORTS_PER_SOL
            });

            const options: any = {
                computeUnitLimit: 500_000,
                clusterSimulation: 'devnet'
            };

            if (feeMode === 'paymaster') {
                options.feeToken = 'paymaster';
            }

            const sig = await signAndSendTransaction({
                instructions: [transferIx],
                transactionOptions: options
            });

            const newBal = balance - parseFloat(amount);
            tokenStore.updateBalance('sol', newBal);
            setBalance(newBal);

            transactionStore.add({
                type: 'sent',
                amount: amount,
                token: 'SOL',
                description: `Sent SOL to ${recipient.slice(0, 4)}...${recipient.slice(-4)}`,
                signature: sig,
                status: 'success'
            });

            setSignature(sig);
            toast.success('Transfer Successful!', {
                id: toastId,
                description: `Sent ${amount} SOL`,
                action: {
                    label: 'Explorer',
                    onClick: () => window.open(`https://explorer.solana.com/tx/${sig}?cluster=devnet`, '_blank')
                }
            });
        } catch (err: any) {
            console.error('Transfer failed:', err);
            const msg = err.message || 'Transaction rejected';
            setErrorDescription(msg.includes('0x1') ? 'Insufficient funds' : msg);
            setFullError(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
            toast.error('Transfer Failed', { id: toastId, description: msg });
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) return null;

    return (
        <div className="glass-panel p-8 rounded-2xl w-full max-w-lg mx-auto mt-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lazor-neon/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Transfer SOL</h3>
                    <p className="text-secondary text-sm">Send SOL securely on Devnet.</p>
                </div>

                <div className="text-right">
                    <div className="text-secondary text-xs uppercase tracking-wider font-semibold mb-1 flex items-center justify-end gap-1">
                        Balance
                        <button
                            onClick={async () => {
                                if (!smartWalletPubkey) return;
                                const tId = toast.loading('Refreshing balance...');
                                try {
                                    const lamports = await connection.getBalance(smartWalletPubkey);
                                    const val = lamports / LAMPORTS_PER_SOL;
                                    tokenStore.updateBalance('sol', val);
                                    setBalance(val);
                                    toast.success('Balance Updated', { id: tId });
                                } catch (e) {
                                    toast.error('Refresh Failed', { id: tId });
                                }
                            }}
                            className="hover:text-white transition-colors"
                            title="Refresh Balance"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                        </button>
                    </div>
                    <div className="font-mono text-xl font-medium text-white">
                        {balance !== null ? balance.toFixed(4) : '...'} SOL
                    </div>
                    {balance !== null && balance < 0.5 && (
                        <button
                            onClick={handleAirdrop}
                            disabled={airdropLoading}
                            className="text-lazor-neon text-xs hover:underline mt-1 disabled:opacity-50 font-medium"
                        >
                            {airdropLoading ? 'Requesting...' : '+ Request Airdrop'}
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-6">
                <div className="flex p-1 bg-black/40 rounded-lg border border-white/10">
                    <button
                        type="button"
                        onClick={() => setFeeMode('paymaster')}
                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${feeMode === 'paymaster' ? 'bg-lazor-neon text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Gasless (Paymaster)
                    </button>
                    <button
                        type="button"
                        onClick={() => setFeeMode('user')}
                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${feeMode === 'user' ? 'bg-lazor-neon text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Pay with SOL
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary ml-1">Recipient</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="Solana Address (Base58)"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-lazor-neon/50 focus:ring-1 focus:ring-lazor-neon/50 transition-all font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary ml-1">Amount</label>
                    <div className="relative group">
                        <input
                            type="number"
                            step="0.001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-lazor-neon/50 focus:ring-1 focus:ring-lazor-neon/50 transition-all font-mono text-lg"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary font-medium pointer-events-none">
                            SOL
                        </div>
                    </div>
                </div>

                {errorDescription && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        <div className="flex items-start gap-3 mb-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <div>
                                <div className="font-semibold">Transaction Failed</div>
                                <div className="opacity-90">{errorDescription}</div>
                            </div>
                        </div>
                        <details className="mt-2 text-xs">
                            <summary className="cursor-pointer opacity-70 hover:opacity-100">Show Debug Details</summary>
                            <pre className="mt-2 p-2 bg-black/50 rounded overflow-x-auto whitespace-pre-wrap font-mono opacity-80">
                                {fullError}
                            </pre>
                        </details>
                    </div>
                )}

                {signature && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm break-all flex items-start gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <div>
                            <div className="font-semibold mb-1">Success!</div>
                            <a
                                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:text-green-300"
                            >
                                View Explorer
                            </a>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading || !recipient || (balance !== null && parseFloat(amount) > balance && feeMode === 'user')}
                        className="flex-1 btn btn-primary h-14 text-lg"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                Processing...
                            </span>
                        ) : feeMode === 'paymaster' ? 'Send Gasless' : 'Send with SOL'}
                    </button>

                    <button
                        type="button"
                        onClick={handleTestSign}
                        className="px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs text-secondary"
                    >
                        Debug: Sign
                    </button>
                </div>
                {feeMode === 'paymaster' && (
                    <p className="text-center text-xs text-secondary">
                        No SOL required for fees. Sponsored by Paymaster.
                    </p>
                )}
            </form>
        </div>
    );
}
