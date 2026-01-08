import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Creates a locally trusted certificate for HTTPS
    mkcert(),
    // Required polyfills for Solana SDK
    nodePolyfills({
      // EXCLUDE 'crypto' to avoid breaking native WebAuthn/Passkeys
      include: ['buffer', 'process', 'stream', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['@solana/web3.js', '@coral-xyz/anchor'],
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    // https: true // mkcert handles this automatically
  }
})
