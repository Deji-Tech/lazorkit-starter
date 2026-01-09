import { useWallet } from '@lazorkit/wallet';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

interface NFTItem {
    id: string;
    name: string;
    image: string;
    collection?: string;
    mint?: string;
}

export function NFTGallery() {
    const { wallet, isConnected, signAndSendTransaction, smartWalletPubkey } = useWallet();
    const [nfts, setNfts] = useState<NFTItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [recipient, setRecipient] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!isConnected || !wallet) return;

        const fetchNFTs = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=demo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 'nft-fetch',
                        method: 'getAssetsByOwner',
                        params: {
                            ownerAddress: wallet.smartWallet,
                            displayOptions: { showCollectionMetadata: true }
                        }
                    })
                });

                const data = await response.json();

                if (data.result?.items) {
                    const parsed: NFTItem[] = data.result.items
                        .filter((item: any) => item.content?.files?.[0]?.uri)
                        .slice(0, 12)
                        .map((item: any) => ({
                            id: item.id,
                            name: item.content?.metadata?.name || 'Unnamed NFT',
                            image: item.content?.files?.[0]?.uri || '',
                            collection: item.grouping?.[0]?.group_value || undefined,
                            mint: item.id
                        }));
                    setNfts(parsed);
                } else {
                    setNfts([
                        { id: '1', name: 'Sample NFT #1', image: 'https://picsum.photos/seed/nft1/300/300', collection: 'Demo Collection', mint: 'demo1' },
                        { id: '2', name: 'Sample NFT #2', image: 'https://picsum.photos/seed/nft2/300/300', collection: 'Demo Collection', mint: 'demo2' },
                        { id: '3', name: 'Sample NFT #3', image: 'https://picsum.photos/seed/nft3/300/300', collection: 'Demo Collection', mint: 'demo3' },
                    ]);
                }
            } catch (e) {
                console.error('Failed to fetch NFTs:', e);
                setNfts([
                    { id: '1', name: 'Sample NFT #1', image: 'https://picsum.photos/seed/nft1/300/300', collection: 'Demo Collection', mint: 'demo1' },
                    { id: '2', name: 'Sample NFT #2', image: 'https://picsum.photos/seed/nft2/300/300', collection: 'Demo Collection', mint: 'demo2' },
                    { id: '3', name: 'Sample NFT #3', image: 'https://picsum.photos/seed/nft3/300/300', collection: 'Demo Collection', mint: 'demo3' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchNFTs();
    }, [isConnected, wallet]);

    const handleSendNft = async (nft: NFTItem) => {
        if (!recipient || !smartWalletPubkey || !signAndSendTransaction) return;

        if (nft.mint?.startsWith('demo')) {
            toast.error('Demo NFT', { description: 'This is a sample NFT and cannot be transferred.' });
            return;
        }

        setSending(true);
        const toastId = toast.loading('Sending NFT...');

        try {
            const mintPubkey = new PublicKey(nft.mint!);
            const recipientPubkey = new PublicKey(recipient);

            const fromAta = await getAssociatedTokenAddress(mintPubkey, smartWalletPubkey);
            const toAta = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

            const instructions: any[] = [
                createAssociatedTokenAccountInstruction(
                    smartWalletPubkey,
                    toAta,
                    recipientPubkey,
                    mintPubkey
                ),
                createTransferInstruction(
                    fromAta,
                    toAta,
                    smartWalletPubkey,
                    1
                )
            ];

            const sig = await signAndSendTransaction({
                instructions,
                transactionOptions: {
                    computeUnitLimit: 300_000,
                    feeToken: 'paymaster'
                }
            });

            toast.success('NFT Sent!', {
                id: toastId,
                description: `${nft.name} transferred`,
                action: {
                    label: 'Explorer',
                    onClick: () => window.open(`https://explorer.solana.com/tx/${sig}?cluster=devnet`, '_blank')
                }
            });

            setNfts(prev => prev.filter(n => n.id !== nft.id));
            setSendingId(null);
            setRecipient('');

        } catch (err: any) {
            console.error('NFT transfer failed:', err);
            toast.error('Transfer Failed', { id: toastId, description: err.message || 'Could not send NFT' });
        } finally {
            setSending(false);
        }
    };

    if (!isConnected) return null;

    return (
        <div className="glass-panel p-6 rounded-2xl w-full max-w-lg mx-auto mt-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative">
                <h3 className="text-xl font-bold">NFT Gallery</h3>
                <span className="text-xs text-secondary bg-white/5 px-2 py-1 rounded-lg">{nfts.length} items</span>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-2 border-lazor-neon/30 border-t-lazor-neon rounded-full animate-spin mb-4"></div>
                    <p className="text-secondary text-sm">Loading NFTs...</p>
                </div>
            ) : nfts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                    <p className="text-secondary">No NFTs found in this wallet</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3 relative">
                    {nfts.map(nft => (
                        <div key={nft.id} className="relative">
                            <div className="group aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 hover:border-lazor/50 transition-all">
                                <img
                                    src={nft.image}
                                    alt={nft.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/300/300'; }}
                                />
                                {/* Hover Overlay with Send Button */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                    <span className="text-xs font-medium text-center truncate w-full">{nft.name}</span>
                                    <button
                                        onClick={() => { setSendingId(nft.id); setRecipient(''); }}
                                        className="bg-lazor-neon text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>

                            {/* Inline Send Form (shows below NFT when selected) */}
                            {sendingId === nft.id && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-[#1a1b1f] border border-white/10 rounded-xl p-3 z-20 shadow-xl animate-fade-in">
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        placeholder="Recipient address..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lazor-neon/50 font-mono mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSendingId(null)}
                                            className="flex-1 text-xs py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSendNft(nft)}
                                            disabled={sending || !recipient}
                                            className="flex-1 text-xs py-1.5 bg-lazor-neon text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                                        >
                                            {sending ? '...' : 'Confirm'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
