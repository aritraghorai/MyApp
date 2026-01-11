/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Client-side environment variables
  readonly VITE_APP_NAME: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Server-side environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DATABASE_URL: string;
      readonly NODE_ENV: "development" | "production" | "test";
      readonly AUTHELIA_ISSUER_URL: string;
      readonly AUTHELIA_CLIENT_ID: string;
      readonly AUTHELIA_CLIENT_SECRET: string;
      readonly BASE_URL: string;
    }
  }
}

export { };
