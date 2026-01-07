import { createFileRoute, Link } from "@tanstack/react-router";
import { getTreaty } from "../api.$";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, TrendingUp, Wallet, Calendar, Eye, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export const Route = createFileRoute("/expenses/")({
  component: ExpensesDashboard,
  ssr: true,
});

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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

  const { data: transactionsData, isLoading, error, isError } = useQuery({
    queryKey: ["dashboard-transactions", selectedCycle],
    queryFn: async () => {
      const { data, error } = await getTreaty().transactions.get({
        query: {
          limit: 1000,
          page: 1,
          billingCycle: selectedCycle,
        },
      });
      if (error) throw new Error("Failed to fetch transactions");
      return data;
    },
    retry: 2,
    retryDelay: 1000,
  });

  const stats = useMemo(() => {
    const txs = transactionsData?.data || [];
    const income = txs
      .filter((t: any) => t.type === "INCOME")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const expense = txs
      .filter((t: any) => t.type === "OUTFLOW")
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

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

    const pieChartData = Object.entries(byCategory)
      .map(([name, amount]) => ({ name, value: amount }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

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
      pieChartData,
      daily,
      maxDaily,
    };
  }, [transactionsData]);

  if (isError) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load transactions. Please try again."}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatCycleName(selectedCycle)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button asChild variant="outline">
            <Link to="/expenses/transactions" search={{
              page: 1,
              limit: 1000,
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View All
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 p-6 opacity-5">
            <ArrowUp size={80} className="text-green-500" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(stats.income)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              Inflow
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 p-6 opacity-5">
            <ArrowDown size={80} className="text-red-500" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(stats.expense)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
              <ArrowDown className="h-3 w-3 mr-1" />
              Outflow
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 p-6 opacity-5">
            <Wallet size={80} className="text-blue-500" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription>Net Balance</CardDescription>
            <CardTitle className={`text-3xl ${stats.net >= 0 ? '' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(stats.net)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${stats.net >= 0
              ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
              : "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
              }`}>
              <Wallet className="h-3 w-3 mr-1" />
              {stats.net >= 0 ? 'Saved' : 'Deficit'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Spending</CardTitle>
            <CardDescription>Track your daily expenses throughout the month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1 sm:gap-2">
              {stats.daily.map((amount, index) => (
                <div key={index} className="flex-1 flex flex-col justify-end group relative h-full">
                  <div
                    className="w-full bg-primary/20 rounded-t-sm hover:bg-primary transition-all duration-300 relative"
                    style={{ height: `${(amount / stats.maxDaily) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border shadow-sm whitespace-nowrap z-10 pointer-events-none transition-opacity">
                      Day {index + 1}: {formatCurrency(amount)}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center mt-2 hidden sm:block">
                    {(index + 1) % 5 === 0 || index === 0 ? index + 1 : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCategories.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{cat.name}</span>
                    <span className="font-semibold">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(cat.amount / (stats.expense || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {stats.topCategories.length === 0 && (
                <p className="text-muted-foreground text-center py-8 text-sm">No expenses yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      {stats.pieChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Visual breakdown of spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={stats.pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Person */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Person</CardTitle>
            <CardDescription>Individual spending breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topPeople.map((person, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{person.name}</span>
                    <span className="font-semibold">{formatCurrency(person.amount)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(person.amount / (stats.expense || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {stats.topPeople.length === 0 && (
                <p className="text-muted-foreground text-center py-8 text-sm">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spend by Account */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Account</CardTitle>
            <CardDescription>Account-wise distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topAccounts.map((account, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{account.name}</span>
                    <span className="font-semibold">{formatCurrency(account.amount)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${(account.amount / (stats.expense || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {stats.topAccounts.length === 0 && (
                <p className="text-muted-foreground text-center py-8 text-sm">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {transactionsData?.data?.slice(0, 5).map((transaction: any) => (
              <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'INCOME'
                    ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
                    : transaction.type === 'CC_PAYMENT'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                    }`}>
                    {transaction.type === 'INCOME' ? <ArrowUp size={18} /> :
                      transaction.type === 'CC_PAYMENT' ? <Wallet size={18} /> :
                        <ArrowDown size={18} />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                      {transaction.category?.name && ` • ${transaction.category.name}`}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${transaction.type === 'INCOME'
                  ? 'text-green-600 dark:text-green-400'
                  : transaction.type === 'CC_PAYMENT'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400'
                  }`}>
                  {transaction.type === 'INCOME' ? '+' : transaction.type === 'OUTFLOW' ? '-' : ''}
                  {formatCurrency(Number(transaction.amount))}
                </span>
              </div>
            ))}
            {!transactionsData?.data?.length && (
              <div className="p-8 text-center text-muted-foreground">
                No transactions found for this month
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
