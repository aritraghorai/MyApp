import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    console.log(context)
    if (!context.isAuthenticated) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
