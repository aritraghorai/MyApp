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
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [genericOAuthProvider(), openAPI()],
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://pm.dev.aritraghorai.in",
  ],
});
