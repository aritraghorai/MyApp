import { authClient } from "@/lib/authClient"


const useAuth = () => {
    const { data, isPending, error, } = authClient.useSession()

    const logWithAuthelia = () => {
        authClient.signIn.oauth2({
            providerId: "authelia",
        });
    }

    return {
        user: data?.user,
        isPending,
        error,
        isAuthenticated: !!data?.user,
        logWithAuthelia,
        logout: authClient.signOut
    }
}


export default useAuth
