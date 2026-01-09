import { useState } from 'react';
import { LazorkitWrapper } from './providers/LazorkitWrapper';
import { ConnectWallet } from './components/ConnectWallet';
import { WalletInfo } from './components/WalletInfo';
import { GaslessTransfer } from './components/GaslessTransfer';
import { TransactionHistory } from './components/TransactionHistory';
import { TokenSwap } from './components/TokenSwap';
import { ReceiveQR } from './components/ReceiveQR';
import { NFTGallery } from './components/NFTGallery';
import { AIChatbot } from './components/AIChatbot';
import { useWallet } from '@lazorkit/wallet';
import { Toaster } from 'sonner';

type TabType = 'transfer' | 'receive' | 'swap' | 'nfts' | 'history' | 'ai';

function MainContent() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('transfer');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'transfer', label: 'Send', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> },
    { id: 'receive', label: 'Receive', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> },
    { id: 'swap', label: 'Swap', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg> },
    { id: 'nfts', label: 'NFTs', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> },
    { id: 'history', label: 'History', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
    { id: 'ai', label: 'AI', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path></svg> },
  ];

  return (
    <div className="min-h-screen container pt-20 pb-12">
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lazor-neon rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">LazorKit <span className="text-lazor">Starter</span></h1>
        </div>
        <ConnectWallet />
      </header>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-2xl mx-auto animate-fade-in relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lazor-neon/10 blur-[100px] rounded-full pointer-events-none"></div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gradient leading-tight">
            The Passwordless <br />Solana Wallet
          </h2>
          <p className="text-xl text-secondary mb-10 leading-relaxed">
            Experience the future of Web3. No seed phrases, just your face or fingerprint.
            <br />Powered by Passkeys and Smart Accounts.
          </p>

          <div className="glass-panel p-8 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
            <div className="text-left">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lazor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Secure</h3>
              <p className="text-sm text-secondary">Hardware-grade security via WebAuthn.</p>
            </div>
            <div className="text-left">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lazor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Gasless</h3>
              <p className="text-sm text-secondary">Transactions sponsored by Paymaster.</p>
            </div>
            <div className="text-left">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lazor">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Simple</h3>
              <p className="text-sm text-secondary">No seed phrases to lose or manage.</p>
            </div>
          </div>

          <ConnectWallet />
        </div>
      ) : (
        <div className="animate-fade-in">
          <WalletInfo />

          <div className="w-full max-w-lg mx-auto mt-8">
            {/* Tab Navigation */}
            <div className="flex p-1 bg-white/5 rounded-xl mb-4 gap-1 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`flex-1 min-w-[60px] py-2 px-2 text-xs font-medium rounded-lg transition-all flex flex-col items-center gap-1 ${activeTab === tab.id
                    ? 'bg-lazor-neon text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'transfer' && <GaslessTransfer />}
            {activeTab === 'receive' && <ReceiveQR />}
            {activeTab === 'swap' && <TokenSwap />}
            {activeTab === 'nfts' && <NFTGallery />}
            {activeTab === 'history' && <TransactionHistory />}
            {activeTab === 'ai' && <AIChatbot />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LazorkitWrapper>
      <MainContent />
      <Toaster position="bottom-right" theme="dark" richColors closeButton />
    </LazorkitWrapper>
  );
}
