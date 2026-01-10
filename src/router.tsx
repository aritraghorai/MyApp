import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import type { RouterContext } from './routes/__root'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: {
      isAuthenticated: false,
      user: null,
    } satisfies RouterContext,
  })

  return router
}
