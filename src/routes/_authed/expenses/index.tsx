import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Calendar,
  Eye,
  Loader2,
  Pencil,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DeleteTransactionDialog } from "@/components/expenses/DeleteTransactionDialog";
import { TransactionDialog } from "@/components/expenses/TransactionDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TruncatedText } from "@/components/ui/truncated-text";
import { formatCurrency } from "@/lib/utils";
import { getTreaty } from "../../api.$";

export const Route = createFileRoute("/_authed/expenses/")({
  component: ExpensesDashboard,
  ssr: true,
});

const COLORS = [
  "hsl(217, 91%, 60%)", // Blue
  "hsl(0, 84%, 60%)", // Red
  "hsl(142, 71%, 45%)", // Green
  "hsl(38, 92%, 50%)", // Orange
  "hsl(271, 76%, 53%)", // Purple
  "hsl(328, 86%, 70%)", // Pink
  "hsl(189, 94%, 43%)", // Cyan
  "hsl(84, 81%, 44%)", // Lime
];

function ExpensesDashboard() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() =>
    now.getMonth().toString(),
  );
  const [selectedYear, setSelectedYear] = useState(() =>
    now.getFullYear().toString(),
  );
  const [transactionView, setTransactionView] = useState<"card" | "person">(
    "card",
  );
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);

  const selectedCycle = useMemo(
    () => `${selectedMonth}_${selectedYear}`,
    [selectedMonth, selectedYear],
  );

  const months = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    [],
  );

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

  const {
    data: transactionsData,
    isLoading,
    error,
    isError,
  } = useQuery({
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

    txs
      .filter((t: any) => t.type === "OUTFLOW")
      .forEach((t: any) => {
        const catName = t.category?.name || "Uncategorized";
        byCategory[catName] = (byCategory[catName] || 0) + Number(t.amount);

        const personName = t.person?.name || "No Person";
        byPerson[personName] = (byPerson[personName] || 0) + Number(t.amount);

        const accountName = t.account?.name || "Unknown Account";
        byAccount[accountName] =
          (byAccount[accountName] || 0) + Number(t.amount);
      });

    // Include CC_PAYMENT transactions in person and account breakdowns
    // Payments should be subtracted since they reduce credit card debt
    txs
      .filter((t: any) => t.type === "CC_PAYMENT")
      .forEach((t: any) => {
        const personName = t.person?.name || "No Person";
        byPerson[personName] = (byPerson[personName] || 0) - Number(t.amount);

        // For CC_PAYMENT, subtract from the credit card account (destination)
        const accountName = t.account?.name || "Unknown Account";
        byAccount[accountName] =
          (byAccount[accountName] || 0) - Number(t.amount);
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

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const daily: number[] = new Array(daysInMonth).fill(0);
    txs
      .filter((t: any) => t.type === "OUTFLOW")
      .forEach((t: any) => {
        const day = new Date(t.date).getDate() - 1;
        if (day >= 0 && day < daysInMonth) {
          daily[day] += Number(t.amount);
        }
      });

    const maxDaily = Math.max(...daily, 1);

    // Group transactions by account and person for list view
    const transactionsByAccount: Record<string, any[]> = {};
    const transactionsByPerson: Record<string, any[]> = {};

    txs.forEach((t: any) => {
      // Group by account
      if (t.type === "OUTFLOW" || t.type === "INCOME") {
        const accountName = t.account?.name || "Unknown Account";
        if (!transactionsByAccount[accountName]) {
          transactionsByAccount[accountName] = [];
        }
        transactionsByAccount[accountName].push(t);
      } else if (t.type === "CC_PAYMENT") {
        // For payments, group under the credit card being paid
        const accountName = t.account?.name || "Unknown Account";
        if (!transactionsByAccount[accountName]) {
          transactionsByAccount[accountName] = [];
        }
        transactionsByAccount[accountName].push(t);
      }

      // Group by person
      if (t.person) {
        const personName = t.person.name;
        if (!transactionsByPerson[personName]) {
          transactionsByPerson[personName] = [];
        }
        transactionsByPerson[personName].push(t);
      }
    });

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
      transactionsByAccount,
      transactionsByPerson,
    };
  }, [transactionsData]);

  if (isError) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Alert
          variant="destructive"
          className="border-red-500/50 bg-red-50 dark:bg-red-950/20"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load transactions. Please try again."}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="hover:scale-105 transition-transform"
          >
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
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <Sparkles className="h-6 w-6 absolute top-0 right-0 text-primary/50 animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">
              {formatCycleName(selectedCycle)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] hover:border-primary/50 transition-colors">
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
            <SelectTrigger className="w-[110px] hover:border-primary/50 transition-colors">
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

          <Button
            asChild
            variant="outline"
            className="hover:scale-105 transition-transform"
          >
            <Link
              to="/expenses/transactions"
              search={{
                page: 1,
                limit: 1000,
                billingCycle: selectedCycle,
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View All
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <Card className="relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute right-0 top-0 p-6 opacity-10">
            <ArrowUp size={100} className="text-green-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardHeader className="pb-3 relative">
            <CardDescription className="text-green-700 dark:text-green-400 font-medium">
              Total Income
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.income)}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="inline-flex items-center rounded-full border-2 border-green-300 bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 shadow-sm">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Inflow
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="relative overflow-hidden border-red-500/20 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute right-0 top-0 p-6 opacity-10">
            <ArrowDown size={100} className="text-red-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardHeader className="pb-3 relative">
            <CardDescription className="text-red-700 dark:text-red-400 font-medium">
              Total Expenses
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(stats.expense)}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="inline-flex items-center rounded-full border-2 border-red-300 bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700 shadow-sm">
              <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
              Outflow
            </div>
          </CardContent>
        </Card>

        {/* Net Balance Card */}
        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${stats.net >= 0
            ? "border-blue-500/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 hover:shadow-lg hover:shadow-blue-500/10"
            : "border-orange-500/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 hover:shadow-lg hover:shadow-orange-500/10"
            }`}
        >
          <div className="absolute right-0 top-0 p-6 opacity-10">
            <Wallet
              size={100}
              className={stats.net >= 0 ? "text-blue-500" : "text-orange-500"}
            />
          </div>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stats.net >= 0 ? "from-blue-500/5" : "from-orange-500/5"} to-transparent`}
          />
          <CardHeader className="pb-3 relative">
            <CardDescription
              className={
                stats.net >= 0
                  ? "text-blue-700 dark:text-blue-400 font-medium"
                  : "text-orange-700 dark:text-orange-400 font-medium"
              }
            >
              Net Balance
            </CardDescription>
            <CardTitle
              className={`text-4xl font-bold ${stats.net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}
            >
              {formatCurrency(stats.net)}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div
              className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold shadow-sm ${stats.net >= 0
                ? "border-blue-300 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                : "border-orange-300 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700"
                }`}
            >
              <Wallet className="h-3.5 w-3.5 mr-1.5" />
              {stats.net >= 0 ? "Saved" : "Deficit"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Activity Chart */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Daily Spending
              </span>
            </CardTitle>
            <CardDescription>
              Track your daily expenses throughout the month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1 sm:gap-2 p-4 bg-gradient-to-t from-primary/5 to-transparent rounded-lg">
              {stats.daily.map((amount, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col justify-end group relative h-full"
                >
                  <div
                    className="w-full bg-gradient-to-t from-primary/30 to-primary/60 rounded-t-md hover:from-primary hover:to-primary/80 transition-all duration-300 relative shadow-sm hover:shadow-md"
                    style={{ height: `${(amount / stats.maxDaily) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md border shadow-lg whitespace-nowrap z-10 pointer-events-none transition-opacity font-medium">
                      Day {index + 1}: {formatCurrency(amount)}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center mt-2 hidden sm:block font-medium">
                    {(index + 1) % 5 === 0 || index === 0 ? index + 1 : ""}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Top Categories
            </CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCategories.map((cat, index) => (
                <div key={index} className="space-y-2 group">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${(cat.amount / (stats.expense || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {stats.topCategories.length === 0 && (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  No expenses yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      {stats.pieChartData.length > 0 && (
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Expense Distribution
            </CardTitle>
            <CardDescription>
              Visual breakdown of spending by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={stats.pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {stats.pieChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Person */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Spend by Person
            </CardTitle>
            <CardDescription>Individual spending breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topPeople.map((person, index) => (
                <div key={index} className="space-y-2 group">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {person.name}
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(person.amount)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${(person.amount / (stats.expense || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {stats.topPeople.length === 0 && (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spend by Account */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Spend by Account
            </CardTitle>
            <CardDescription>Account-wise distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topAccounts.map((account, index) => (
                <div key={index} className="space-y-2 group">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {account.name}
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(account.amount)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${(account.amount / (stats.expense || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {stats.topAccounts.length === 0 && (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List View */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Transaction Details
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View transactions grouped by card or person
              </CardDescription>
            </div>
            <div className="flex gap-1.5">
              <Button
                variant={transactionView === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setTransactionView("card")}
                className="transition-all h-7 sm:h-8 text-xs px-2 sm:px-3"
              >
                By Card
              </Button>
              <Button
                variant={transactionView === "person" ? "default" : "outline"}
                size="sm"
                onClick={() => setTransactionView("person")}
                className="transition-all h-7 sm:h-8 text-xs px-2 sm:px-3"
              >
                By Person
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {transactionView === "card" ? (
            // Group by Card/Account
            Object.keys(stats.transactionsByAccount).length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {Object.entries(stats.transactionsByAccount).map(
                  ([accountName, transactions]) => (
                    <AccordionItem key={accountName} value={accountName}>
                      <AccordionTrigger className="hover:no-underline py-2.5 sm:py-3">
                        <div className="flex items-center justify-between w-full pr-3 sm:pr-4">
                          <h3 className="font-semibold text-xs sm:text-sm text-left truncate mr-2">
                            {accountName}
                          </h3>
                          <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                            {transactions.length} transaction
                            {transactions.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pt-1">
                          {transactions.map((transaction: any) => (
                            <div
                              key={transaction.id}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <TruncatedText className="text-xs sm:text-sm">
                                    {transaction.description || "Untitled"}
                                  </TruncatedText>
                                  {transaction.type === "CC_PAYMENT" && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shrink-0">
                                      Payment
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                  <span>
                                    {new Date(
                                      transaction.date,
                                    ).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: window.innerWidth < 640 ? undefined : 'numeric'
                                    })}
                                  </span>
                                  {transaction.category?.name && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">
                                        {transaction.category.name}
                                      </span>
                                    </>
                                  )}
                                  {transaction.person?.name && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">
                                        {transaction.person.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-2">
                                <span
                                  className={`font-bold text-xs sm:text-sm whitespace-nowrap ${transaction.type === "INCOME"
                                    ? "text-green-600 dark:text-green-400"
                                    : transaction.type === "CC_PAYMENT"
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-red-600 dark:text-red-400"
                                    }`}
                                >
                                  {transaction.type === "INCOME"
                                    ? "+"
                                    : transaction.type === "OUTFLOW"
                                      ? "-"
                                      : ""}
                                  {formatCurrency(Number(transaction.amount))}
                                </span>
                                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 md:h-6 md:w-6 p-0"
                                    onClick={() =>
                                      setEditingTransaction(transaction)
                                    }
                                  >
                                    <Pencil className="h-3.5 w-3.5 md:h-3 md:w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 md:h-6 md:w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    onClick={() =>
                                      setDeletingTransaction(transaction)
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
              </Accordion>
            ) : (
              <p className="text-center text-muted-foreground py-6 text-sm">
                No transactions found
              </p>
            )
          ) : // Group by Person
            Object.keys(stats.transactionsByPerson).length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {Object.entries(stats.transactionsByPerson).map(
                  ([personName, transactions]) => (
                    <AccordionItem key={personName} value={personName}>
                      <AccordionTrigger className="hover:no-underline py-2.5 sm:py-3">
                        <div className="flex items-center justify-between w-full pr-3 sm:pr-4">
                          <h3 className="font-semibold text-xs sm:text-sm text-left truncate mr-2">
                            {personName}
                          </h3>
                          <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                            {transactions.length} transaction
                            {transactions.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pt-1">
                          {transactions.map((transaction: any) => (
                            <div
                              key={transaction.id}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <TruncatedText className="text-xs sm:text-sm">
                                    {transaction.description || "Untitled"}
                                  </TruncatedText>
                                  {transaction.type === "CC_PAYMENT" && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shrink-0">
                                      Payment
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                  <span>
                                    {new Date(
                                      transaction.date,
                                    ).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: window.innerWidth < 640 ? undefined : 'numeric'
                                    })}
                                  </span>
                                  {transaction.category?.name && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">
                                        {transaction.category.name}
                                      </span>
                                    </>
                                  )}
                                  {transaction.account?.name && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">
                                        {transaction.account.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-2">
                                <span
                                  className={`font-bold text-xs sm:text-sm whitespace-nowrap ${transaction.type === "INCOME"
                                    ? "text-green-600 dark:text-green-400"
                                    : transaction.type === "CC_PAYMENT"
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-red-600 dark:text-red-400"
                                    }`}
                                >
                                  {transaction.type === "INCOME"
                                    ? "+"
                                    : transaction.type === "OUTFLOW"
                                      ? "-"
                                      : ""}
                                  {formatCurrency(Number(transaction.amount))}
                                </span>
                                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 md:h-6 md:w-6 p-0"
                                    onClick={() =>
                                      setEditingTransaction(transaction)
                                    }
                                  >
                                    <Pencil className="h-3.5 w-3.5 md:h-3 md:w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 md:h-6 md:w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    onClick={() =>
                                      setDeletingTransaction(transaction)
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
              </Accordion>
            ) : (
              <p className="text-center text-muted-foreground py-6 text-sm">
                No transactions found
              </p>
            )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Recent Transactions
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {transactionsData?.data?.slice(0, 5).map((transaction: any) => (
              <div
                key={transaction.id}
                className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-accent/50 transition-all duration-200 group"
              >
                {/* Mobile: Icon + Content + Amount stacked */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-md ${transaction.type === "INCOME"
                      ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 dark:from-green-950/50 dark:to-emerald-950/50 dark:text-green-400"
                      : transaction.type === "CC_PAYMENT"
                        ? "bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-400"
                        : "bg-gradient-to-br from-red-100 to-rose-100 text-red-600 dark:from-red-950/50 dark:to-rose-950/50 dark:text-red-400"
                      }`}
                  >
                    {transaction.type === "INCOME" ? (
                      <ArrowUp size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                    ) : transaction.type === "CC_PAYMENT" ? (
                      <Wallet size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                    ) : (
                      <ArrowDown size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <TruncatedText className="text-sm sm:text-base font-semibold group-hover:text-primary transition-colors">
                      {transaction.description || "Untitled"}
                    </TruncatedText>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                      {new Date(transaction.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: window.innerWidth < 640 ? undefined : 'numeric'
                      })}
                      {transaction.category?.name &&
                        ` • ${transaction.category.name}`}
                    </p>
                  </div>
                  {/* Amount on mobile - inline with content */}
                  <span
                    className={`sm:hidden font-bold text-base whitespace-nowrap shrink-0 ${transaction.type === "INCOME"
                      ? "text-green-600 dark:text-green-400"
                      : transaction.type === "CC_PAYMENT"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-red-600 dark:text-red-400"
                      }`}
                  >
                    {transaction.type === "INCOME"
                      ? "+"
                      : transaction.type === "OUTFLOW"
                        ? "-"
                        : ""}
                    {formatCurrency(Number(transaction.amount))}
                  </span>
                </div>
                {/* Desktop: Amount + Actions */}
                <div className="hidden sm:flex items-center gap-3">
                  <span
                    className={`font-bold text-lg whitespace-nowrap ${transaction.type === "INCOME"
                      ? "text-green-600 dark:text-green-400"
                      : transaction.type === "CC_PAYMENT"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-red-600 dark:text-red-400"
                      }`}
                  >
                    {transaction.type === "INCOME"
                      ? "+"
                      : transaction.type === "OUTFLOW"
                        ? "-"
                        : ""}
                    {formatCurrency(Number(transaction.amount))}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => setDeletingTransaction(transaction)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Mobile: Action buttons at bottom */}
                <div className="flex sm:hidden gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={() => setEditingTransaction(transaction)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                    onClick={() => setDeletingTransaction(transaction)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {!transactionsData?.data?.length && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No transactions found for this month
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <TransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}

      {/* Delete Transaction Dialog */}
      {deletingTransaction && (
        <DeleteTransactionDialog
          transaction={deletingTransaction}
          open={!!deletingTransaction}
          onOpenChange={(open) => !open && setDeletingTransaction(null)}
        />
      )}
    </div>
  );
}
