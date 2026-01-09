export interface TokenItem {
    id: string;
    symbol: string;
    name: string;
    balance: number;
    price: number;
    icon: string;
}

const STORAGE_KEY = 'lazorkit_tokens_v1';

// Default tokens for the simulated environment
const DEFAULT_TOKENS: TokenItem[] = [
    {
        id: 'sol',
        symbol: 'SOL',
        name: 'Solana',
        balance: 1.24,
        price: 150.0,
        icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    {
        id: 'usdc',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: 0.0,
        price: 1.0,
        icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    { id: 'bonk', symbol: 'BONK', name: 'Bonk', balance: 500000, price: 0.000012, icon: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I' },
];

export const tokenStore = {
    getAll: (walletAddress: string): TokenItem[] => {
        if (!walletAddress) return DEFAULT_TOKENS;
        try {
            const key = `${STORAGE_KEY}_${walletAddress}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : DEFAULT_TOKENS;
        } catch (e) {
            console.error('Failed to parse tokens', e);
            return DEFAULT_TOKENS;
        }
    },

    updateBalance: (walletAddress: string, tokenId: string, newBalance: number) => {
        if (!walletAddress) return [];
        const tokens = tokenStore.getAll(walletAddress);

        const updated = tokens.map(t =>
            t.id === tokenId ? { ...t, balance: newBalance } : t
        );

        const key = `${STORAGE_KEY}_${walletAddress}`;
        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
    },

    reset: (walletAddress: string) => {
        if (!walletAddress) return;
        const key = `${STORAGE_KEY}_${walletAddress}`;
        localStorage.removeItem(key);
    }
};
