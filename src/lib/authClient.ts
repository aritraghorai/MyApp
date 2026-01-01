import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000/api/auth", // The base URL of your auth server
  plugins: [genericOAuthClient()],
});

export const { useSession } = authClient;
