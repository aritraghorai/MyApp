import { authClient } from "@/lib/authClient"


const useAuth = () => {
    const { data, isPending, error, } = authClient.useSession()

    // Log session state changes
    console.log('[useAuth] Session state:', {
        hasData: !!data,
        isPending,
        hasError: !!error,
        user: data?.user,
        session: data?.session
    });

    const logWithAuthelia = async () => {
        try {
            console.log('[useAuth] Starting OAuth sign-in with Authelia...');
            const res2 = await authClient.signIn.oauth2({
                providerId: "authelia",
            });
            console.log('[useAuth] Sign-in response:', res2);
        } catch (err) {
            console.error('[useAuth] OAuth sign-in error:', err);
            throw err;
        }
    }

    return {
        user: data?.user,
        session: data?.session,
        isPending,
        error,
        isAuthenticated: !!data?.user,
        logWithAuthelia,
        logout: authClient.signOut
    }
}


export default useAuth
