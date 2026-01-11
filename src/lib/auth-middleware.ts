import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
    const data = await auth.api.getSession({
        headers: getRequestHeaders() as HeadersInit
    })
    return next({
        context: {
            user: {
                id: data?.user.id,
                name: data?.user.name,
                email: data?.user.email,
                image: data?.user.image,
            },
            isAuthenticated: !!data?.user
        }
    })
})
