import { useState } from 'react';
import { LazorkitWrapper } from './providers/LazorkitWrapper';
import { ConnectWallet } from './components/ConnectWallet';
import { WalletInfo } from './components/WalletInfo';
import { GaslessTransfer } from './components/GaslessTransfer';
import { TransactionHistory } from './components/TransactionHistory';
import { useWallet } from '@lazorkit/wallet';

import { TokenSwap } from './components/TokenSwap';

function MainContent() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'transfer' | 'history' | 'swap'>('transfer');

  return (
    <div className="min-h-screen container pt-20 pb-12">
      {/* ... keeping header ... */}
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

      {/* Hero Section */}
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-2xl mx-auto animate-fade-in relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lazor-neon/10 blur-[100px] rounded-full pointer-events-none"></div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gradient leading-tight">
            The Passwordless <br /> Solana Wallet
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

          <div className="w-full max-w-md mx-auto mt-8">
            <div className="flex p-1 bg-white/5 rounded-xl mb-6">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'transfer' ? 'bg-lazor-neon text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('transfer')}
              >
                Transfer
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'swap' ? 'bg-lazor-neon text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('swap')}
              >
                Swap
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'history' ? 'bg-lazor-neon text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>

            {activeTab === 'transfer' && <GaslessTransfer />}
            {activeTab === 'swap' && <TokenSwap />}
            {activeTab === 'history' && <TransactionHistory />}
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
    </LazorkitWrapper>
  );
}
