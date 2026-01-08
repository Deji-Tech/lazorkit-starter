/**
 * LazorKit Configuration
 * 
 * This file contains the configuration for the LazorKit SDK.
 * Defaults are set for Devnet to allow for easy testing without spending real funds.
 */

// Environment variables or defaults
export const LAZORKIT_CONFIG = {
    // Solana RPC Node URL (Devnet)
    rpcUrl: import.meta.env.VITE_RPC_URL || 'https://api.devnet.solana.com',

    // LazorKit Authentication Portal
    // This handles the biometric challenge UI securely
    portalUrl: import.meta.env.VITE_PORTAL_URL || 'https://portal.lazor.sh',

    // Paymaster Configuration for Gasless Transactions
    paymaster: {
        paymasterUrl: import.meta.env.VITE_PAYMASTER_URL || 'https://kora.devnet.lazorkit.com',
        // apiKey: import.meta.env.VITE_PAYMASTER_API_KEY // Optional if using a premium provider
    },

    // App Metadata for the passkey
    metadata: {
        name: 'LazorKit Starter',
        icon: 'https://lazorkit.com/favicon.ico'
    }
};
