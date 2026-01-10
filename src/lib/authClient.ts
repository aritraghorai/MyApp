import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: `${process.env.VITE_BASE_URL}/api/auth`, // The base URL of your auth server
  plugins: [genericOAuthClient()],
});

export const { useSession } = authClient;
