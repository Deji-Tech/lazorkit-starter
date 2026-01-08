import { useWallet } from '@lazorkit/wallet';
import { useState } from 'react';

/**
 * WalletInfo Component
 * 
 * Displays detailed information about the connected Lazorkit wallet.
 * Includes smart wallet address, credential ID, and device platform.
 */
export function WalletInfo() {
    const { wallet, isConnected } = useWallet();
    const [copied, setCopied] = useState(false);

    if (!isConnected || !wallet) return null;

    const copyAddress = () => {
        navigator.clipboard.writeText(wallet.smartWallet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel p-6 rounded-xl w-full max-w-md mx-auto mt-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Wallet Details</h3>
                <span className="badge badge-success">Connected</span>
            </div>

            <div className="space-y-0">
                <div className="info-row">
                    <span className="info-label">Smart Account (PDA)</span>
                    <div className="flex items-center gap-2">
                        <span className="info-value text-lazor">
                            {wallet.smartWallet.slice(0, 4)}...{wallet.smartWallet.slice(-4)}
                        </span>
                        <button
                            onClick={copyAddress}
                            className="text-white/40 hover:text-white transition-colors"
                            title="Copy Address"
                        >
                            {copied ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="info-row">
                    <span className="info-label">Passkey ID</span>
                    <span className="info-value" title={wallet.credentialId}>
                        {wallet.credentialId.slice(0, 8)}...
                    </span>
                </div>

                <div className="info-row">
                    <span className="info-label">Platform</span>
                    <span className="info-value capitalize">{wallet.platform || 'Web'}</span>
                </div>
            </div>

            <div className="mt-6 p-4 bg-black/30 rounded-lg text-sm text-gray-400">
                <p>This is a smart wallet controlled by your biometrics. No private keys are stored in the browser.</p>
            </div>
        </div>
    );
}
