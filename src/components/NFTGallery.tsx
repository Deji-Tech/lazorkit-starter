import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { useWallet } from '@lazorkit/wallet';

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
    const [selectedNft, setSelectedNft] = useState<NFTItem | null>(null);
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
                    setNfts(parsed);
                } else {
                    // Fallback to demo NFTs if wallet is empty
                    const demoNfts = [
                        { id: '1', name: 'Cosmic Dreamer #42', image: 'https://picsum.photos/seed/nft1/400/400', collection: 'Cosmic Collection', mint: 'demo1' },
                        { id: '2', name: 'Ocean Serenity #18', image: 'https://picsum.photos/seed/nft2/400/400', collection: 'Nature Series', mint: 'demo2' },
                        { id: '3', name: 'Golden Horizon #7', image: 'https://picsum.photos/seed/nft3/400/400', collection: 'Sunset Dreams', mint: 'demo3' },
                    ];
                    setNfts(demoNfts);
                }
            } catch (e) {
                console.error('Failed to fetch NFTs:', e);
                // Graceful fallback on error
                setNfts([
                    { id: '1', name: 'Cosmic Dreamer #42', image: 'https://picsum.photos/seed/nft1/400/400', collection: 'Cosmic Collection', mint: 'demo1' },
                    { id: '2', name: 'Ocean Serenity #18', image: 'https://picsum.photos/seed/nft2/400/400', collection: 'Nature Series', mint: 'demo2' },
                    { id: '3', name: 'Golden Horizon #7', image: 'https://picsum.photos/seed/nft3/400/400', collection: 'Sunset Dreams', mint: 'demo3' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchNFTs();
    }, [isConnected, wallet]);

    const handleSendNft = async () => {
        if (!selectedNft || !recipient || !smartWalletPubkey || !signAndSendTransaction) return;

        if (selectedNft.mint?.startsWith('demo')) {
            toast.error('Demo NFT', { description: 'This is a sample NFT and cannot be transferred.' });
            return;
        }

        setSending(true);
        const toastId = toast.loading('Sending NFT...');

        try {
            const mintPubkey = new PublicKey(selectedNft.mint!);
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
                description: `${selectedNft.name} transferred`,
                action: {
                    label: 'Explorer',
                    onClick: () => window.open(`https://explorer.solana.com/tx/${sig}?cluster=devnet`, '_blank')
                }
            });

            setNfts(prev => prev.filter(n => n.id !== selectedNft.id));
            setSelectedNft(null);
            setRecipient('');

        } catch (err: any) {
            console.error('NFT transfer failed:', err);
            toast.error('Transfer Failed', { id: toastId, description: err.message || 'Could not send NFT' });
        } finally {
            setSending(false);
        }
    };

    const selectNft = (nft: NFTItem) => {
        if (selectedNft?.id === nft.id) {
            setSelectedNft(null);
            setRecipient('');
        } else {
            setSelectedNft(nft);
            setRecipient('');
        }
    };

    // Reorder NFTs so selected one is first
    const orderedNfts = selectedNft
        ? [selectedNft, ...nfts.filter(n => n.id !== selectedNft.id)]
        : nfts;

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
                    <p className="text-secondary">No NFTs found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Selected NFT - Expanded View */}
                    {selectedNft && (
                        <div className="flex gap-4 bg-black/40 border border-lazor/30 rounded-xl p-4 animate-fade-in">
                            {/* NFT Image - Left Side */}
                            <div className="w-32 h-32 shrink-0 rounded-xl overflow-hidden border-2 border-lazor/50 shadow-lg shadow-lazor/20">
                                <img
                                    src={selectedNft.image}
                                    alt={selectedNft.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Controls - Right Side */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <h4 className="font-bold text-white truncate">{selectedNft.name}</h4>
                                    {selectedNft.collection && (
                                        <p className="text-xs text-secondary truncate">{selectedNft.collection}</p>
                                    )}
                                </div>

                                <div className="space-y-2 mt-2">
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        placeholder="Recipient wallet address..."
                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-lazor-neon/50 font-mono"
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.open(`https://explorer.solana.com/address/${selectedNft.mint}?cluster=devnet`, '_blank')}
                                            className="flex-1 text-xs py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                <line x1="10" y1="14" x2="21" y2="3"></line>
                                            </svg>
                                            View
                                        </button>
                                        <button
                                            onClick={handleSendNft}
                                            disabled={sending || !recipient}
                                            className="flex-1 text-xs py-2 bg-lazor-neon text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                        >
                                            {sending ? (
                                                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                            ) : (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                </svg>
                                            )}
                                            {sending ? 'Sending' : 'Send'}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedNft(null)}
                                    className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* NFT Grid - Remaining NFTs */}
                    <div className="grid grid-cols-3 gap-3">
                        {orderedNfts.filter(n => n.id !== selectedNft?.id).map(nft => (
                            <div
                                key={nft.id}
                                onClick={() => selectNft(nft)}
                                className="group aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 hover:border-lazor/50 transition-all cursor-pointer relative"
                            >
                                <img
                                    src={nft.image}
                                    alt={nft.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/300/300'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                    <span className="text-[10px] font-medium truncate w-full">{nft.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
