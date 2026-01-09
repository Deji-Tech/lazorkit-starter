export interface TokenItem {
    id: string;
    symbol: string;
    name: string;
    balance: number;
    price: number;
    icon: string;
}

const STORAGE_KEY = 'lazorkit_tokens_v1';

const DEFAULT_TOKENS: TokenItem[] = [
    { id: 'sol', symbol: 'SOL', name: 'Solana', balance: 1.24, price: 150.0, icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
    { id: 'usdc', symbol: 'USDC', name: 'USD Coin', balance: 0.0, price: 1.0, icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    { id: 'bonk', symbol: 'BONK', name: 'Bonk', balance: 500000, price: 0.000012, icon: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I' },
];

export const tokenStore = {
    getAll: (): TokenItem[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : DEFAULT_TOKENS;
        } catch (e) {
            console.error('Failed to parse tokens', e);
            return DEFAULT_TOKENS;
        }
    },

    updateBalance: (tokenId: string, newBalance: number) => {
        const tokens = tokenStore.getAll();
        const updated = tokens.map(t =>
            t.id === tokenId ? { ...t, balance: newBalance } : t
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    },

    reset: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
