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
    const [selectedNft, setSelectedNft] = useState<NFTItem | null>(null);
    const [sendMode, setSendMode] = useState(false);
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

    const handleSendNft = async () => {
        if (!selectedNft || !recipient || !smartWalletPubkey || !signAndSendTransaction) return;

        // Check if demo NFT
        if (selectedNft.mint?.startsWith('demo')) {
            toast.error('Demo NFT', { description: 'This is a sample NFT and cannot be transferred.' });
            return;
        }

        setSending(true);
        const toastId = toast.loading('Preparing NFT transfer...');

        try {
            const mintPubkey = new PublicKey(selectedNft.mint!);
            const recipientPubkey = new PublicKey(recipient);

            // Get associated token accounts
            const fromAta = await getAssociatedTokenAddress(mintPubkey, smartWalletPubkey);
            const toAta = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

            // Build instructions array - create destination ATA if needed
            const instructions: any[] = [];

            // Create ATA for recipient if it doesn't exist
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    smartWalletPubkey,
                    toAta,
                    recipientPubkey,
                    mintPubkey
                )
            );

            // Transfer the NFT (1 token since NFTs have 0 decimals)
            instructions.push(
                createTransferInstruction(
                    fromAta,
                    toAta,
                    smartWalletPubkey,
                    1
                )
            );

            const sig = await signAndSendTransaction({
                instructions,
                transactionOptions: {
                    computeUnitLimit: 300_000,
                    feeToken: 'paymaster'
                }
            });

            toast.success('NFT Sent!', {
                id: toastId,
                description: `${selectedNft.name} transferred successfully`,
                action: {
                    label: 'Explorer',
                    onClick: () => window.open(`https://explorer.solana.com/tx/${sig}?cluster=devnet`, '_blank')
                }
            });

            // Remove from local list
            setNfts(prev => prev.filter(n => n.id !== selectedNft.id));
            setSelectedNft(null);
            setSendMode(false);
            setRecipient('');

        } catch (err: any) {
            console.error('NFT transfer failed:', err);
            toast.error('Transfer Failed', { id: toastId, description: err.message || 'Could not send NFT' });
        } finally {
            setSending(false);
        }
    };

    const closeModal = () => {
        setSelectedNft(null);
        setSendMode(false);
        setRecipient('');
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
                    <p className="text-xs text-secondary/60 mt-1">NFTs you own will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3 relative">
                    {nfts.map(nft => (
                        <div
                            key={nft.id}
                            className="group relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 hover:border-lazor/50 transition-all cursor-pointer"
                            onClick={() => setSelectedNft(nft)}
                        >
                            <img
                                src={nft.image}
                                alt={nft.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/300/300'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <span className="text-xs font-medium truncate w-full">{nft.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* NFT Detail Modal */}
            {selectedNft && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-md bg-[#1a1b1f] border border-white/10 rounded-2xl overflow-hidden">
                        {/* Image */}
                        <div className="relative aspect-square">
                            <img
                                src={selectedNft.image}
                                alt={selectedNft.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 p-2 rounded-full transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Details */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-1">{selectedNft.name}</h3>
                            {selectedNft.collection && (
                                <p className="text-sm text-secondary mb-4">{selectedNft.collection}</p>
                            )}

                            {!sendMode ? (
                                <button
                                    onClick={() => setSendMode(true)}
                                    className="w-full btn btn-primary h-12"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                    Send NFT
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-secondary mb-1 block">Recipient Address</label>
                                        <input
                                            type="text"
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            placeholder="Enter Solana address..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lazor-neon/50 font-mono text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSendMode(false)}
                                            className="flex-1 btn btn-secondary h-12"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSendNft}
                                            disabled={sending || !recipient}
                                            className="flex-1 btn btn-primary h-12 disabled:opacity-50"
                                        >
                                            {sending ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                                    Sending...
                                                </span>
                                            ) : 'Confirm Send'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-center text-secondary">
                                        Transaction will be gasless via Paymaster
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
