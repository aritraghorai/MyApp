import { HeadContent, Scripts, createRootRouteWithContext, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Header from '../components/Header'

import appCss from '../styles.css?url'
import { getCurrentUser } from '@/lib/auth-server'
import '../registerSW'

const queryClient = new QueryClient()

export interface RouterContext {
  isAuthenticated: boolean
  user?: {
    id: string
    email: string
    name: string
    image?: string | null
    createdAt: Date
    updatedAt: Date
    emailVerified: boolean
  } | null
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location }) => {
    // Skip auth check for API routes
    if (location.pathname.startsWith('/api/')) {
      return {
        isAuthenticated: false,
        user: null
      }
    }

    const session = await getCurrentUser()


    return session
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Personal Manager',
      },
      {
        name: 'description',
        content: 'Personal management application for organizing your life',
      },
      {
        name: 'theme-color',
        content: '#000000',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo192.png',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <Header />
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  )
}
