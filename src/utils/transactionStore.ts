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

const STORAGE_KEY = 'lazorkit_transactions';

export const transactionStore = {
    getAll: (): TransactionItem[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to parse history', e);
            return [];
        }
    },

    add: (item: Omit<TransactionItem, 'id' | 'date'>) => {
        const history = transactionStore.getAll();
        const newItem: TransactionItem = {
            ...item,
            id: Math.random().toString(36).substring(7),
            date: Date.now()
        };
        // Add to beginning
        history.unshift(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50))); // Keep last 50
        return newItem;
    },

    clear: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
