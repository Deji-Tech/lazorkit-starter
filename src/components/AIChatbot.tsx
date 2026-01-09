import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useWallet } from '@lazorkit/wallet';

// Utilities
import { tokenStore } from '../utils/tokenStore';
import { transactionStore } from '../utils/transactionStore';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AIChatbot() {
    const { wallet, isConnected } = useWallet();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hey! I'm your AI wallet assistant. Ask me about your balance, recent transactions, or how to use this wallet!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Simple intent matching logic
    // In a production app, this would call an LLM API
    const processQuery = async (query: string): Promise<string> => {
        const text = query.toLowerCase();

        // 1. Check Balance
        if (text.includes('balance') || text.includes('how much')) {
            if (!wallet) return "Please connect your wallet first.";
            const tokens = tokenStore.getAll(wallet.smartWallet);
            const formatted = tokens
                .map(t => `${t.symbol}: ${t.balance.toFixed(4)} (~$${(t.balance * t.price).toFixed(2)})`)
                .join('\n');

            return `Here are your current balances (Devnet):\n\n${formatted}\n\nTip: Use the refresh button in the 'Send' tab to sync with the blockchain.`;
        }

        // 2. Transaction History
        if (text.includes('transaction') || text.includes('history') || text.includes('recent')) {
            if (!wallet) return "Please connect your wallet first.";
            const history = transactionStore.getAll(wallet.smartWallet).slice(0, 5);

            if (!history.length) {
                return "No transactions found yet. Try swapping some tokens or sending SOL!";
            }

            const list = history
                .map(tx => `• ${tx.type}: ${tx.amount} ${tx.token} (${tx.status})`)
                .join('\n');

            return `Here are your last 5 transactions:\n\n${list}\n\nCheck the History tab for the full list.`;
        }

        // 3. Wallet Address
        if (text.includes('address') || text.includes('wallet')) {
            return `Your wallet address is:\n\`${wallet?.smartWallet}\`\n\nShare this to receive funds. You can also view your QR code in the 'Receive' tab.`;
        }

        // 4. Usage Help (Swap/Send)
        if (text.includes('swap') || text.includes('exchange')) {
            return "To swap tokens:\n1. Go to the **Swap** tab\n2. Select your tokens\n3. Enter amount and confirm\n\nNote: Swaps are currently simulated for demo purposes.";
        }

        if (text.includes('send') || text.includes('transfer')) {
            return "To send funds:\n1. Go to the **Transfer** tab\n2. Enter recipient & amount\n3. Choose 'Gasless' (sponsored) or 'Pay with SOL'\n4. Confirm with your biometric passkey";
        }

        // 5. Educational (NFTs/Security)
        if (text.includes('nft') || text.includes('collectible')) {
            return "Your NFTs are in the **NFTs** tab. Click on any item to view details or send it to a friend (gasless transfers included!).";
        }

        if (text.includes('passkey') || text.includes('security')) {
            return "This wallet is secured by **Passkeys** (WebAuthn). Your private keys never leave your device's secure enclave (FaceID/TouchID), making it phishing-resistant.";
        }

        // Default Fallback
        return "I can help with:\n• Checking balances & history\n• Explaining how to Swap/Send\n• Wallet security info\n\nWhat would you like to know?";
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await processQuery(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (e) {
            toast.error('AI Error', { description: 'Failed to process your request' });
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) return null;

    return (
        <div className="glass-panel p-0 rounded-2xl w-full max-w-lg mx-auto mt-8 border border-white/5 relative overflow-hidden flex flex-col" style={{ height: '500px' }}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold">AI Wallet Assistant</h3>
                    <p className="text-xs text-secondary">Powered by LazorKit</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user'
                            ? 'bg-lazor-neon text-black rounded-br-sm'
                            : 'bg-white/10 text-white rounded-bl-sm'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-3 rounded-2xl rounded-bl-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your wallet..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lazor-neon/50 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="btn btn-primary px-4 py-3 rounded-xl disabled:opacity-50"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
