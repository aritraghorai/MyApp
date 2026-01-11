import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

// Use VITE_API_URL if available, otherwise fall back to current origin
const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl !== 'undefined') {
    return `${apiUrl}/api/auth`;
  }
  // Fallback to current origin (only works on client-side)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/auth`;
  }
  // Server-side fallback - use localhost for SSR
  return `${process.env.BASE_URL}/api/auth`;
};



export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [genericOAuthClient()],
})

// Log the base URL for debugging
console.log('[Better Auth Client] Initialized with baseURL:', getBaseURL());

export const { useSession } = authClient
