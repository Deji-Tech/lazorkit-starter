export interface TransactionItem {
    id: string;
    type: 'swapped' | 'sent' | 'received';
    amount: string;
    token: string;
    description: string;
    date: number;
    signature?: string;
    status: 'success' | 'failed' | 'simulated';
}

// Local storage key for persistence
const STORAGE_KEY = 'lazorkit_transactions';

/**
 * Simple store for managing transaction history.
 * Persists to localStorage to keep data across reloads.
 */
export const transactionStore = {
    getAll: (walletAddress: string): TransactionItem[] => {
        if (!walletAddress) return [];
        try {
            const key = `${STORAGE_KEY}_${walletAddress}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to parse history', e);
            return [];
        }
    },

    add: (walletAddress: string, item: Omit<TransactionItem, 'id' | 'date'>) => {
        if (!walletAddress) return null;

        const history = transactionStore.getAll(walletAddress);

        const newItem: TransactionItem = {
            ...item,
            id: Math.random().toString(36).substring(7),
            date: Date.now()
        };

        // Add to the beginning of the list
        history.unshift(newItem);

        // Limit to last 50 transactions to save space
        const key = `${STORAGE_KEY}_${walletAddress}`;
        localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));

        return newItem;
    },

    clear: (walletAddress: string) => {
        if (!walletAddress) return;
        const key = `${STORAGE_KEY}_${walletAddress}`;
        localStorage.removeItem(key);
    }
};
