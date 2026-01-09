import { useWallet } from '@lazorkit/wallet';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export function ReceiveQR() {
    const { wallet, isConnected } = useWallet();

    if (!isConnected || !wallet) return null;

    const address = wallet.smartWallet;

    const copyAddress = () => {
        navigator.clipboard.writeText(address);
        toast.success('Address Copied!', { description: 'Wallet address copied to clipboard.' });
    };

    return (
        <div className="glass-panel p-8 rounded-2xl w-full max-w-lg mx-auto mt-8 border border-white/5 relative overflow-hidden text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lazor-neon/10 blur-[100px] rounded-full pointer-events-none"></div>

            <h3 className="text-xl font-bold mb-2 relative">Receive SOL</h3>
            <p className="text-secondary text-sm mb-6 relative">Scan this QR code or copy your address below.</p>

            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-lg relative">
                <QRCodeSVG
                    value={address}
                    size={180}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                />
            </div>

            <div className="relative">
                <div
                    onClick={copyAddress}
                    className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-sm break-all cursor-pointer hover:bg-white/5 transition-colors group"
                >
                    <span className="block text-white/80 group-hover:text-white">{address}</span>
                    <span className="text-xs text-lazor mt-2 inline-block">Click to copy</span>
                </div>
            </div>

            <p className="text-xs text-secondary mt-4 relative">
                <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Solana Devnet
                </span>
            </p>
        </div>
    );
}
