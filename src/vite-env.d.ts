// src/vite-env.d.ts
/// <reference types="vite/client" />

/**
 * Types for environment variables exposed by Vite.
 * Prefix variables with VITE_ in .env files.
 */
interface ImportMetaEnv {
  readonly VITE_TOKEN_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
