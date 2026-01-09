import { useState, useEffect } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { transactionStore } from '../utils/transactionStore';
import { tokenStore } from '../utils/tokenStore';
import { toast } from 'sonner';

export function TokenSwap() {
    const { signMessage, isConnected } = useWallet();
    const [tokens, setTokens] = useState(() => tokenStore.getAll());

    const [payTokenId, setPayTokenId] = useState('sol');
    const [receiveTokenId, setReceiveTokenId] = useState('usdc');
    const [payAmount, setPayAmount] = useState('');
    const [receiveAmount, setReceiveAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectorMode, setSelectorMode] = useState<'pay' | 'receive'>('pay');

    const payToken = tokens.find(t => t.id === payTokenId) || tokens[0];
    const receiveToken = tokens.find(t => t.id === receiveTokenId) || tokens[1];

    useEffect(() => {
        if (!payAmount) {
            setReceiveAmount('');
            return;
        }
        const rate = payToken.price / receiveToken.price;
        setReceiveAmount((parseFloat(payAmount) * rate).toFixed(6));
    }, [payAmount, payToken, receiveToken]);

    const handleSwap = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) return;

        if (parseFloat(payAmount) > payToken.balance) {
            toast.error('Insufficient funds', { description: `You need more ${payToken.symbol} to swap.` });
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Swapping tokens...');

        try {
            if (signMessage) {
                await signMessage(`Swapping ${payAmount} ${payToken.symbol} to ${receiveAmount} ${receiveToken.symbol}`);
                toast.success('Swap Successful!', { id: toastId, description: `Swapped ${payAmount} ${payToken.symbol} for ${receiveToken.symbol}` });
            } else {
                await new Promise(r => setTimeout(r, 2000));
                toast.success('Swap Executed (Simulated)', { id: toastId, description: 'Balance updated locally.' });
            }

            // Update Balance
            let updatedTokens = tokens;
            updatedTokens = tokenStore.updateBalance(payTokenId, payToken.balance - parseFloat(payAmount));
            const currentReceive = updatedTokens.find(t => t.id === receiveTokenId);
            if (currentReceive) {
                updatedTokens = tokenStore.updateBalance(receiveTokenId, currentReceive.balance + parseFloat(receiveAmount));
            }
            setTokens(updatedTokens);

            // History
            transactionStore.add({
                type: 'swapped',
                amount: `${payAmount}`,
                token: `${payToken.symbol} → ${receiveToken.symbol}`,
                description: `Swapped ${payToken.symbol} to ${receiveToken.symbol}`,
                status: 'simulated'
            });

            setPayAmount('');
        } catch (err) {
            console.error('Swap failed:', err);
            toast.error('Swap Failed', { id: toastId, description: 'Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const switchTokens = () => {
        setPayTokenId(receiveTokenId);
        setReceiveTokenId(payTokenId);
        setPayAmount(receiveAmount);
    };

    const openSelector = (mode: 'pay' | 'receive') => {
        setSelectorMode(mode);
        setIsSelectorOpen(true);
    };

    const selectToken = (tokenId: string) => {
        if (selectorMode === 'pay') {
            if (tokenId === receiveTokenId) switchTokens();
            else setPayTokenId(tokenId);
        } else {
            if (tokenId === payTokenId) switchTokens();
            else setReceiveTokenId(tokenId);
        }
        setIsSelectorOpen(false);
    };

    if (!isConnected) return null;

    return (
        <div className="glass-panel p-6 rounded-2xl w-full max-w-lg mx-auto mt-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative">
                <h3 className="text-xl font-bold">Swap Tokens</h3>
                <div className="flex items-center gap-2 text-xs text-secondary bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Devnet Simulated
                </div>
            </div>

            <form onSubmit={handleSwap} className="space-y-2 relative">
                {/* Pay Section */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 transition-colors hover:border-white/20">
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-medium text-secondary">You Pay</label>
                        <span className="text-xs text-secondary">Balance: {payToken.balance.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input
                                type="number"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-transparent text-3xl font-bold text-white placeholder-white/10 focus:outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => openSelector('pay')}
                            className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                        >
                            <img src={payToken.icon} className="w-6 h-6 rounded-full" alt={payToken.symbol} />
                            <span className="font-bold">{payToken.symbol}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                    </div>
                    <div className="text-xs text-secondary mt-1">
                        ≈ ${(parseFloat(payAmount || '0') * payToken.price).toFixed(2)}
                    </div>
                </div>

                {/* Switch Button */}
                <div className="relative h-4 w-full flex items-center justify-center z-10">
                    <button
                        type="button"
                        onClick={switchTokens}
                        className="absolute bg-[#1a1b1f] border border-white/10 p-2 rounded-xl text-lazor hover:text-white hover:border-lazor transition-all hover:scale-110 shadow-lg"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 10v12" /><path d="M11 14l-4 4-4-4" /><path d="M11 6l4-4 4 4" /><path d="M21 21v-4" /><path d="M17 10V3" /></svg>
                    </button>
                </div>

                {/* Receive Section */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 transition-colors hover:border-white/20">
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-medium text-secondary">You Receive</label>
                        <span className="text-xs text-secondary">Balance: {receiveToken.balance.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input
                                type="number"
                                value={receiveAmount}
                                readOnly
                                placeholder="0.00"
                                className="w-full bg-transparent text-3xl font-bold text-whit focus:outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => openSelector('receive')}
                            className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                        >
                            <img src={receiveToken.icon} className="w-6 h-6 rounded-full" alt={receiveToken.symbol} />
                            <span className="font-bold">{receiveToken.symbol}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                    </div>
                    <div className="text-xs text-secondary mt-1">
                        1 {payToken.symbol} ≈ {(payToken.price / receiveToken.price).toFixed(4)} {receiveToken.symbol}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || !payAmount}
                        className="w-full btn btn-primary h-14 text-lg font-bold shadow-lg shadow-lazor-neon/20 hover:shadow-lazor-neon/40 transition-all"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                Swapping...
                            </span>
                        ) : 'Swap'}
                    </button>
                </div>
            </form>

            {/* Token Selector Modal */}
            {isSelectorOpen && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col animate-fade-in">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Select Token</h3>
                        <button onClick={() => setIsSelectorOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {tokens.map(token => (
                            <button
                                key={token.id}
                                onClick={() => selectToken(token.id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                            >
                                <img src={token.icon} className="w-8 h-8 rounded-full" alt={token.symbol} />
                                <div className="flex-1">
                                    <div className="font-bold">{token.symbol}</div>
                                    <div className="text-xs text-secondary">{token.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm">{token.balance.toFixed(4)}</div>
                                    <div className="text-xs text-secondary">${(token.balance * token.price).toFixed(2)}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
