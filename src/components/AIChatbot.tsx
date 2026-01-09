import { useWallet } from '@lazorkit/wallet';
import { useState, useRef, useEffect } from 'react';
import { tokenStore } from '../utils/tokenStore';
import { transactionStore } from '../utils/transactionStore';
import { toast } from 'sonner';

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const processQuery = async (query: string): Promise<string> => {
        const lowerQuery = query.toLowerCase();

        // Balance queries
        if (lowerQuery.includes('balance') || lowerQuery.includes('how much')) {
            const tokens = tokenStore.getAll();
            const balanceList = tokens.map(t => `${t.symbol}: ${t.balance.toFixed(4)} (~$${(t.balance * t.price).toFixed(2)})`).join('\n');
            return `Here are your current balances:\n\n${balanceList}\n\nThese are simulated balances on Devnet. Use the refresh button on the Transfer tab to sync with on-chain data.`;
        }

        // Transaction history
        if (lowerQuery.includes('transaction') || lowerQuery.includes('history') || lowerQuery.includes('recent')) {
            const txs = transactionStore.getAll().slice(0, 5);
            if (txs.length === 0) {
                return "You don't have any transactions yet. Try making a swap or sending some SOL!";
            }
            const txList = txs.map(tx => `• ${tx.type}: ${tx.amount} ${tx.token} (${tx.status})`).join('\n');
            return `Here are your recent transactions:\n\n${txList}\n\nCheck the History tab for more details.`;
        }

        // Wallet address
        if (lowerQuery.includes('address') || lowerQuery.includes('wallet')) {
            return `Your wallet address is:\n\n\`${wallet?.smartWallet}\`\n\nYou can share this to receive SOL or NFTs. Check the Receive tab for a QR code!`;
        }

        // Swap help
        if (lowerQuery.includes('swap') || lowerQuery.includes('exchange') || lowerQuery.includes('trade')) {
            return "To swap tokens, go to the **Swap** tab. Select the token you want to pay with, enter an amount, and click Swap. The conversion rate is calculated automatically.\n\nNote: Swaps are currently simulated on Devnet.";
        }

        // Send help
        if (lowerQuery.includes('send') || lowerQuery.includes('transfer')) {
            return "To send SOL, go to the **Transfer** tab:\n1. Enter a recipient address\n2. Enter the amount\n3. Choose Gasless (Paymaster sponsors fees) or Pay with SOL\n4. Click Send!\n\nPasskey confirmation will be required.";
        }

        // NFT help
        if (lowerQuery.includes('nft') || lowerQuery.includes('collectible')) {
            return "Check the **NFTs** tab to see your digital collectibles! If you don't have any NFTs yet, you'll see sample items. On mainnet, your real NFTs will appear here.";
        }

        // Passkey / security
        if (lowerQuery.includes('passkey') || lowerQuery.includes('security') || lowerQuery.includes('biometric')) {
            return "This wallet uses **Passkeys** (WebAuthn) for security. Your private key is protected by your device's biometric sensor (Face ID, fingerprint) or security key.\n\n✅ No seed phrases to remember\n✅ Hardware-level security\n✅ Works across devices with iCloud/Google sync";
        }

        // Fallback
        return "I can help you with:\n• **Balance** - Check your token balances\n• **Transactions** - View recent activity\n• **Swap** - How to exchange tokens\n• **Send** - How to transfer SOL\n• **NFTs** - View your collectibles\n• **Security** - Learn about passkeys\n\nWhat would you like to know?";
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
