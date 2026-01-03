import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { z } from "zod";
import { getTreaty } from "@/routes/api.$";
import { ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const transactionSearchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  personId: z.string().optional(),
  type: z.enum(["OUTFLOW", "INCOME", "CC_PAYMENT"]).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const Route = createFileRoute("/expenses/transactions/")({
  component: TransactionsList,
  validateSearch: (search) => transactionSearchSchema.parse(search),
});

function TransactionsList() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [filters, setFilters] = useState(search);

  const { data: transactionsData, refetch } = useQuery({
    queryKey: ["transactions", search],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await getTreaty().transactions.index.get({
        query: {
          page: search.page,
          limit: search.limit,
          accountId: search.accountId,
          categoryId: search.categoryId,
          personId: search.personId,
          // @ts-ignore
          type: search.type,
          fromDate: search.fromDate,
          toDate: search.toDate,
        },
      });
      if (error) throw error;
      return data;
    },
  });

  const { data: accounts } = useQuery({
    queryKey: ["expense-accounts"],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await getTreaty().expenseAccounts.index.get();
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await getTreaty().categories.index.get();
      if (error) throw error;
      return data;
    },
  });

  const { data: people } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await getTreaty().people.index.get();
      if (error) throw error;
      return data;
    },
  });

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined, page: 1 };
    setFilters(newFilters);
    navigate({ search: newFilters });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "OUTFLOW": return "Expense";
      case "INCOME": return "Income";
      case "CC_PAYMENT": return "Transfer";
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
      </div>


      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4">
        <Select
          value={filters.type || ""}
          onValueChange={(value) => handleFilterChange("type", value)}
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_TYPES">All Types</SelectItem>
            <SelectItem value="OUTFLOW">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="CC_PAYMENT">Transfer / Payment</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.accountId || ""}
          onValueChange={(value) => handleFilterChange("accountId", value)}
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_ACCOUNTS">All Accounts</SelectItem>
            {accounts?.map((account: any) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId || ""}
          onValueChange={(value) => handleFilterChange("categoryId", value)}
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_CATEGORIES">All Categories</SelectItem>
            {categories?.map((category: any) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.personId || ""}
          onValueChange={(value) => handleFilterChange("personId", value)}
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <SelectValue placeholder="All People" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_PEOPLE">All People</SelectItem>
            {people?.map((person: any) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Description</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Account</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Person</th>
              <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactionsData?.data?.map((transaction: any) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <td className="p-4 text-gray-900 dark:text-white">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === "INCOME" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    transaction.type === "CC_PAYMENT" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                    {getTypeLabel(transaction.type)}
                  </span>
                </td>
                <td className="p-4 text-gray-900 dark:text-white">{transaction.description}</td>
                <td className="p-4 text-gray-500 dark:text-gray-400">{transaction.category?.name || "-"}</td>
                <td className="p-4 text-gray-500 dark:text-gray-400">
                  {transaction.type === "CC_PAYMENT" ? (
                    <div className="flex items-center gap-2">
                      <span>{transaction.account?.name}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span>{transaction.destinationAccount?.name}</span>
                    </div>
                  ) : (
                    transaction.account?.name
                  )}
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400">{transaction.person?.name || "-"}</td>
                <td
                  className={`p-4 text-right font-medium ${transaction.type === "INCOME" ? "text-green-600 dark:text-green-400" :
                    transaction.type === "CC_PAYMENT" ? "text-blue-600 dark:text-blue-400" :
                      "text-red-600 dark:text-red-400"
                    }`}
                >
                  {transaction.type === "INCOME" ? "+" : transaction.type === "OUTFLOW" ? "-" : ""}
                  {formatCurrency(Number(transaction.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!transactionsData?.data?.length && (
          <p className="p-8 text-center text-gray-500 dark:text-gray-400">No transactions found</p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          disabled={search.page <= 1}
          onClick={() => handleFilterChange("page", search.page - 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 dark:border-gray-600 dark:text-white"
        >
          Previous
        </button>
        <span className="text-gray-500 dark:text-gray-400">
          Page {search.page} of {transactionsData?.meta?.totalPages || 1}
        </span>
        <button
          disabled={search.page >= (transactionsData?.meta?.totalPages || 1)}
          onClick={() => handleFilterChange("page", search.page + 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 dark:border-gray-600 dark:text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}
