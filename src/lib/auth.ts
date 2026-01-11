import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { genericOAuth, openAPI } from "better-auth/plugins";

const genericOAuthProvider = () =>
  genericOAuth({
    config: [
      {
        providerId: "authelia",
        clientId: process.env.AUTHELIA_CLIENT_ID,
        clientSecret: process.env.AUTHELIA_CLIENT_SECRET,
        authorizationUrl: `${process.env.AUTHELIA_ISSUER_URL}/api/oidc/authorization`,
        tokenUrl: `${process.env.AUTHELIA_ISSUER_URL}/api/oidc/token`,
        userInfoUrl: `${process.env.AUTHELIA_ISSUER_URL}/api/oidc/userinfo`,
        scopes: ["openid", "profile", "email"],
        discoveryUrl: `${process.env.AUTHELIA_ISSUER_URL}/.well-known/openid-configuration`,
        pkce: true,
      },
    ],
  });
// Custom logger for Better Auth with enhanced debugging
const authLogger = {
  log: (...args: any[]) => {
    console.log('[Better Auth]', new Date().toISOString(), ...args);
  },
  error: (...args: any[]) => {
    console.error('[Better Auth ERROR]', new Date().toISOString(), ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[Better Auth WARN]', new Date().toISOString(), ...args);
  },
  debug: (...args: any[]) => {
    console.debug('[Better Auth DEBUG]', new Date().toISOString(), ...args);
  },
  info: (...args: any[]) => {
    console.info('[Better Auth INFO]', new Date().toISOString(), ...args);
  },
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: false,
  },
  logger: authLogger,
  plugins: [genericOAuthProvider(), openAPI()],
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://pm.dev.aritraghorai.in",
  ],
});
