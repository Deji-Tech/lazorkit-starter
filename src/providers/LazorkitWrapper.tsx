import type { ReactNode } from 'react';
import { LazorkitProvider } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG } from '../config/lazorkit';

interface LazorkitWrapperProps {
    children: ReactNode;
}

/**
 * LazorkitWrapper component
 * 
 * Wraps the application with the LazorkitProvider context.
 * This makes the wallet hooks (useWallet) available throughout the app.
 */
export function LazorkitWrapper({ children }: LazorkitWrapperProps) {
    return (
        <LazorkitProvider
            rpcUrl={LAZORKIT_CONFIG.rpcUrl}
            portalUrl={LAZORKIT_CONFIG.portalUrl}
            paymasterConfig={LAZORKIT_CONFIG.paymaster}
        >
            {children}
        </LazorkitProvider>
    );
}
