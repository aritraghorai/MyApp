import { createFileRoute, Link } from "@tanstack/react-router";
import { getTreaty } from "../api.$";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, TrendingUp, Wallet } from "lucide-react";

export const Route = createFileRoute("/expenses/")({
  component: ExpensesDashboard,
});

function ExpensesDashboard() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => now.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(() => now.getFullYear().toString());

  const selectedCycle = useMemo(() => `${selectedMonth}_${selectedYear}`, [selectedMonth, selectedYear]);

  const months = useMemo(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], []);

  const years = useMemo(() => {
    const currentYear = now.getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  }, []);

  const formatCycleName = (cycle: string) => {
    const [m, y] = cycle.split("_");
    const date = new Date(parseInt(y), parseInt(m), 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const { data: transactionsData } = useQuery({
    queryKey: ["dashboard-transactions", selectedCycle],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await getTreaty().transactions.index.get({
        query: {
          limit: 1000, // Fetch enough for the cycle
          page: 1,
          billingCycle: selectedCycle,
        },
      });
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    const txs = transactionsData?.data || [];
    const income = txs
      .filter((t: any) => t.type === "INCOME")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const expense = txs
      .filter((t: any) => t.type === "OUTFLOW")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    // Category Breakdown
    const byCategory: Record<string, number> = {};
    const byPerson: Record<string, number> = {};
    const byAccount: Record<string, number> = {};

    txs.filter((t: any) => t.type === "OUTFLOW").forEach((t: any) => {
      const catName = t.category?.name || "Uncategorized";
      byCategory[catName] = (byCategory[catName] || 0) + Number(t.amount);

      const personName = t.person?.name || "No Person";
      byPerson[personName] = (byPerson[personName] || 0) + Number(t.amount);

      const accountName = t.account?.name || "Unknown Account";
      byAccount[accountName] = (byAccount[accountName] || 0) + Number(t.amount);
    });

    const topCategories = Object.entries(byCategory)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const topPeople = Object.entries(byPerson)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const topAccounts = Object.entries(byAccount)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Daily Activity
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daily: number[] = new Array(daysInMonth).fill(0);
    txs.filter((t: any) => t.type === "OUTFLOW").forEach((t: any) => {
      const day = new Date(t.date).getDate() - 1;
      if (day >= 0 && day < daysInMonth) {
        daily[day] += Number(t.amount);
      }
    });

    const maxDaily = Math.max(...daily, 1);

    return {
      income,
      expense,
      net: income - expense,
      topCategories,
      topPeople,
      topAccounts,
      daily,
      maxDaily,
    };
  }, [transactionsData]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Overview for {formatCycleName(selectedCycle)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <Link
            to="/expenses/transactions"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            View All Transactions
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUp size={64} className="text-green-500" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Income</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.income)}</h3>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 w-fit px-2 py-1 rounded-full">
              <TrendingUp size={14} className="mr-1" />
              <span>Inflow</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDown size={64} className="text-red-500" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Expenses</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.expense)}</h3>
            <div className="mt-4 flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 w-fit px-2 py-1 rounded-full">
              <TrendingUp size={14} className="mr-1" />
              <span>Outflow</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} className="text-blue-500" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Net Balance</p>
            <h3 className={`text-3xl font-bold ${stats.net >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(stats.net)}
            </h3>
            <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 w-fit px-2 py-1 rounded-full">
              <span>{stats.net >= 0 ? 'Saved' : 'Deficit'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Daily Spending</h3>
          <div className="h-64 flex items-end gap-1 sm:gap-2">
            {stats.daily.map((amount, index) => (
              <div key={index} className="flex-1 flex flex-col justify-end group relative h-full">
                <div
                  className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm hover:bg-blue-500 dark:hover:bg-blue-500 transition-all duration-300 relative"
                  style={{ height: `${(amount / stats.maxDaily) * 100}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none transition-opacity">
                    {formatCurrency(amount)}
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 text-center mt-2 hidden sm:block">
                  {(index + 1) % 5 === 0 || index === 0 ? index + 1 : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Categories</h3>
          <div className="space-y-6">
            {stats.topCategories.map((cat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(cat.amount)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(cat.amount / (stats.expense || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.topCategories.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No expenses yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spend by Person */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Spend by Person</h3>
          <div className="space-y-6">
            {stats.topPeople.map((person, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{person.name}</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(person.amount)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(person.amount / (stats.expense || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.topPeople.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Spend by Account */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Spend by Account</h3>
          <div className="space-y-6">
            {stats.topAccounts.map((account, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{account.name}</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(account.amount)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(account.amount / (stats.expense || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.topAccounts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {transactionsData?.data?.slice(0, 5).map((transaction: any) => (
            <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'INCOME' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                  transaction.type === 'CC_PAYMENT' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                    'bg-red-100 text-red-600 dark:bg-red-900/30'
                  }`}>
                  {transaction.type === 'INCOME' ? <ArrowUp size={18} /> :
                    transaction.type === 'CC_PAYMENT' ? <Wallet size={18} /> :
                      <ArrowDown size={18} />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.description || "Untitled"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()} • {transaction.category?.name}
                  </p>
                </div>
              </div>
              <span className={`font-semibold ${transaction.type === 'INCOME' ? 'text-green-600 dark:text-green-400' :
                transaction.type === 'CC_PAYMENT' ? 'text-blue-600 dark:text-blue-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                {transaction.type === 'INCOME' ? '+' : transaction.type === 'OUTFLOW' ? '-' : ''}
                {formatCurrency(Number(transaction.amount))}
              </span>
            </div>
          ))}
          {!transactionsData?.data?.length && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No transactions found for this month
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
