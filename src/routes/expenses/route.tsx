import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import { LayoutDashboard, Receipt, CreditCard, Settings, Plus, X } from 'lucide-react'
import { TransactionForm } from '@/components/expenses/TransactionForm'
import { getTreaty } from '../api.$'
import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/expenses')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isCreating, setIsCreating] = useState(false)
  const queryClient = useQueryClient()
  const location = useLocation()

  const handleCreate = async (data: any) => {
    if (data) {
      const { error } = await getTreaty().transactions.post(data)
      if (error) {
        alert('Failed to create transaction')
        return
      }
    }
    setIsCreating(false)
    // Invalidate all expense related queries to ensure fresh data everywhere
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-transactions'] })
    queryClient.invalidateQueries({ queryKey: ['recent-transactions'] })
    queryClient.invalidateQueries({ queryKey: ['expense-accounts'] })
  }

  const toggleCreating = () => {
    setIsCreating(!isCreating)
  }

  const navItems = [
    { to: '/expenses', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/expenses/transactions', label: 'Transactions', icon: Receipt },
    { to: '/expenses/accounts', label: 'Accounts', icon: CreditCard },
    { to: '/expenses/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-[calc(100vh-4rem)] hidden md:flex flex-col z-40">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">E</span>
            Expenses
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== '/expenses'

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            Add Transaction
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setIsCreating(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 transition-colors"
      >
        <Plus size={28} />
      </button>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 px-6 py-3 flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to) && item.to !== '/expenses'

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Global Add Transaction Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Transaction</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <TransactionForm onSubmit={handleCreate} onCancel={toggleCreating} />
          </div>
        </div>
      )}
    </div>
  )
}
