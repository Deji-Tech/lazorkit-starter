import { useWallet } from '@lazorkit/wallet';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface NFTItem {
    id: string;
    name: string;
    image: string;
    collection?: string;
}

export function NFTGallery() {
    const { wallet, isConnected } = useWallet();
    const [nfts, setNfts] = useState<NFTItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isConnected || !wallet) return;

        const fetchNFTs = async () => {
            setLoading(true);
            try {
                // Using Helius DAS API for NFT fetching
                // For demo, we'll use a public endpoint with rate limits
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
                            collection: item.grouping?.[0]?.group_value || undefined
                        }));
                    setNfts(parsed);
                } else {
                    // Demo: Show sample NFTs if none found
                    setNfts([
                        { id: '1', name: 'Sample NFT #1', image: 'https://picsum.photos/seed/nft1/300/300', collection: 'Demo Collection' },
                        { id: '2', name: 'Sample NFT #2', image: 'https://picsum.photos/seed/nft2/300/300', collection: 'Demo Collection' },
                        { id: '3', name: 'Sample NFT #3', image: 'https://picsum.photos/seed/nft3/300/300', collection: 'Demo Collection' },
                    ]);
                }
            } catch (e) {
                console.error('Failed to fetch NFTs:', e);
                // Fallback to demo NFTs
                setNfts([
                    { id: '1', name: 'Sample NFT #1', image: 'https://picsum.photos/seed/nft1/300/300', collection: 'Demo Collection' },
                    { id: '2', name: 'Sample NFT #2', image: 'https://picsum.photos/seed/nft2/300/300', collection: 'Demo Collection' },
                    { id: '3', name: 'Sample NFT #3', image: 'https://picsum.photos/seed/nft3/300/300', collection: 'Demo Collection' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchNFTs();
    }, [isConnected, wallet]);

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
                            onClick={() => toast.info(nft.name, { description: nft.collection || 'No collection' })}
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
        </div>
    );
}
