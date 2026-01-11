import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowLeftRight,
	ArrowRight,
	ChevronLeft,
	ChevronRight,
	Filter,
	Pencil,
	Trash2,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { DeleteTransactionDialog } from "@/components/expenses/DeleteTransactionDialog";
import { TransactionDialog } from "@/components/expenses/TransactionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { TruncatedText } from "@/components/ui/truncated-text";
import { formatCurrency } from "@/lib/utils";
import { getTreaty } from "@/routes/api.$";

const transactionSearchSchema = z.object({
	page: z.number().optional().default(1),
	limit: z.number().optional().default(20),
	accountId: z.string().optional(),
	categoryId: z.string().optional(),
	personId: z.string().optional(),
	type: z.enum(["OUTFLOW", "INCOME", "CC_PAYMENT"]).optional(),
	fromDate: z.string().optional(),
	toDate: z.string().optional(),
	billingCycle: z
		.string()
		.optional()
		.default(() => {
			const now = new Date();
			return `${now.getMonth()}_${now.getFullYear()}`;
		}),
});

export const Route = createFileRoute("/_authed/expenses/transactions/")({
	component: TransactionsList,
	validateSearch: (search) => transactionSearchSchema.parse(search),
});

type TransactionResponse = Awaited<
	ReturnType<ReturnType<typeof getTreaty>["transactions"]["get"]>
>;
type Transaction = NonNullable<
	NonNullable<TransactionResponse>["data"]
>["data"][number];

function TransactionsList() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const [filters, setFilters] = useState(search);
	const [showFilters, setShowFilters] = useState(true);
	const [editingTransaction, setEditingTransaction] = useState<any>(null);
	const [deletingTransaction, setDeletingTransaction] = useState<any>(null);

	const { data: transactionsData, isLoading } = useQuery({
		queryKey: ["transactions", search],
		queryFn: async () => {
			const { data, error } = await getTreaty().transactions.get({
				query: {
					page: search.page,
					limit: search.limit,
					accountId: search.accountId,
					categoryId: search.categoryId,
					personId: search.personId,
					// @ts-expect-error
					type: search.type,
					fromDate: search.fromDate,
					toDate: search.toDate,
					billingCycle: search.billingCycle,
				},
			});
			if (error) throw error;
			return data;
		},
	});

	const { data: accounts } = useQuery({
		queryKey: ["expense-accounts"],
		queryFn: async () => {
			const { data, error } = await getTreaty()["expense-accounts"].get();
			if (error) throw error;
			return data;
		},
	});

	const { data: categories } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const { data, error } = await getTreaty().categories.get();
			if (error) throw error;
			return data;
		},
	});

	const { data: people } = useQuery({
		queryKey: ["people"],
		queryFn: async () => {
			const { data, error } = await getTreaty().people.get();
			if (error) throw error;
			return data;
		},
	});

	const handleFilterChange = (
		key: keyof typeof filters | "month" | "year",
		value: any,
	) => {
		if (value === "default") {
			value = undefined;
		}

		const newFilters = { ...filters, page: 1 };

		if (key === "month" || key === "year") {
			const currentCycle = filters.billingCycle || "";
			let [m, y] = currentCycle.split("_");

			if (key === "month") m = value;
			if (key === "year") y = value;

			if (m && y) {
				newFilters.billingCycle = `${m}_${y}`;
			} else if (!m && !y) {
				// @ts-expect-error
				newFilters.billingCycle = undefined;
			} else {
				// If only one is set, we still keep it in the cycle string or handle as partial
				newFilters.billingCycle = `${m || ""}_${y || ""}`;
			}

			// Clean up if both are empty
			if (newFilters.billingCycle === "_") {
				// @ts-expect-error
				newFilters.billingCycle = undefined;
			}
		} else {
			// @ts-expect-error
			newFilters[key] = value || undefined;
		}

		setFilters(newFilters);
		navigate({ search: newFilters });
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "OUTFLOW":
				return "Expense";
			case "INCOME":
				return "Income";
			case "CC_PAYMENT":
				return "Transfer";
			default:
				return type;
		}
	};

	const getTypeBadgeVariant = (type: string) => {
		switch (type) {
			case "INCOME":
				return "default";
			case "CC_PAYMENT":
				return "secondary";
			case "OUTFLOW":
				return "destructive";
			default:
				return "outline";
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "INCOME":
				return <TrendingUp className="w-3.5 h-3.5" />;
			case "CC_PAYMENT":
				return <ArrowLeftRight className="w-3.5 h-3.5" />;
			case "OUTFLOW":
				return <TrendingDown className="w-3.5 h-3.5" />;
			default:
				return null;
		}
	};

	const columns: ColumnDef<Transaction>[] = [
		{
			accessorKey: "date",
			header: "Date",
			cell: ({ row }) => {
				return (
					<div className="font-medium whitespace-nowrap">
						{new Date(row.getValue("date")).toLocaleDateString()}
					</div>
				);
			},
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => {
				const type = row.getValue("type") as string;
				return (
					<Badge
						variant={getTypeBadgeVariant(type)}
						className="whitespace-nowrap gap-1"
					>
						{getTypeIcon(type)}
						{getTypeLabel(type)}
					</Badge>
				);
			},
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => {
				return (
					<div className="font-medium max-w-[200px] truncate">
						{row.getValue("description")}
					</div>
				);
			},
		},
		{
			accessorKey: "billingCycle",
			header: "Billing Cycle",
			cell: ({ row }) => {
				const cycle = row.getValue("billingCycle") as string;
				if (!cycle) return <div className="text-muted-foreground">-</div>;
				const [month, year] = cycle.split("_");
				const monthName = new Date(0, parseInt(month)).toLocaleString(
					"default",
					{ month: "short" },
				);
				return (
					<div className="font-medium">
						<span className="text-muted-foreground">{monthName}</span> {year}
					</div>
				);
			},
		},
		{
			accessorKey: "category",
			header: "Category",
			cell: ({ row }) => {
				const category = row.original.category;
				return (
					<div className="text-muted-foreground">{category?.name || "-"}</div>
				);
			},
		},
		{
			accessorKey: "account",
			header: "Account",
			cell: ({ row }) => {
				const transaction = row.original;
				if (transaction.type === "CC_PAYMENT") {
					return (
						<div className="flex items-center gap-2 text-sm">
							<span className="text-muted-foreground truncate">
								{transaction.fromAccount?.name}
							</span>
							<ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
							<span className="text-muted-foreground truncate">
								{transaction.account?.name}
							</span>
						</div>
					);
				}
				return (
					<div className="text-muted-foreground">
						{transaction.account?.name}
					</div>
				);
			},
		},
		{
			accessorKey: "person",
			header: "Person",
			cell: ({ row }) => {
				const person = row.original.person;
				return (
					<div className="text-muted-foreground">{person?.name || "-"}</div>
				);
			},
		},
		{
			accessorKey: "amount",
			header: () => <div className="text-right">Amount</div>,
			cell: ({ row }) => {
				const transaction = row.original;
				const amount = Number(transaction.amount);
				const isIncome = transaction.type === "INCOME";
				const isTransfer = transaction.type === "CC_PAYMENT";
				const isOutflow = transaction.type === "OUTFLOW";

				return (
					<div
						className={`text-right font-semibold whitespace-nowrap ${
							isIncome
								? "text-green-600 dark:text-green-400"
								: isTransfer
									? "text-blue-600 dark:text-blue-400"
									: "text-red-600 dark:text-red-400"
						}`}
					>
						{isIncome ? "+" : isOutflow ? "-" : ""}
						{formatCurrency(amount)}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const transaction = row.original;
				return (
					<div className="flex gap-1">
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
				);
			},
		},
	];

	const table = useReactTable({
		data: transactionsData?.data || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
			<div className="p-4 md:p-8 space-y-6">
				{/* Header Section */}
				<div className="space-y-2">
					<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
						Transactions
					</h1>
					<p className="text-muted-foreground">
						Track and manage all your financial transactions
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-green-700 dark:text-green-400">
										Total Income
									</p>
									<p className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
										{formatCurrency(
											transactionsData?.data
												?.filter((t) => t.type === "INCOME")
												.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
										)}
									</p>
								</div>
								<div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-900/50 flex items-center justify-center">
									<TrendingUp className="w-6 h-6 text-green-700 dark:text-green-400" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-900">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-red-700 dark:text-red-400">
										Total Expenses
									</p>
									<p className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
										{formatCurrency(
											transactionsData?.data
												?.filter((t) => t.type === "OUTFLOW")
												.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
										)}
									</p>
								</div>
								<div className="w-12 h-12 rounded-full bg-red-200 dark:bg-red-900/50 flex items-center justify-center">
									<TrendingDown className="w-6 h-6 text-red-700 dark:text-red-400" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-blue-700 dark:text-blue-400">
										Transfers
									</p>
									<p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
										{formatCurrency(
											transactionsData?.data
												?.filter((t) => t.type === "CC_PAYMENT")
												.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
										)}
									</p>
								</div>
								<div className="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-900/50 flex items-center justify-center">
									<ArrowLeftRight className="w-6 h-6 text-blue-700 dark:text-blue-400" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filters Section */}
				<Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-lg border-gray-200 dark:border-gray-700">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Filter className="w-5 h-5 text-muted-foreground" />
								<h2 className="text-lg font-semibold">Filters</h2>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowFilters(!showFilters)}
								className="md:hidden"
							>
								{showFilters ? "Hide" : "Show"}
							</Button>
						</div>

						<div
							className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 ${!showFilters && "hidden md:grid"}`}
						>
							<Select
								value={filters.type || ""}
								onValueChange={(value) => handleFilterChange("type", value)}
							>
								<SelectTrigger className="bg-white dark:bg-gray-900">
									<SelectValue placeholder="All Types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="default">All Types</SelectItem>
									<SelectItem value="OUTFLOW">Expense</SelectItem>
									<SelectItem value="INCOME">Income</SelectItem>
									<SelectItem value="CC_PAYMENT">Transfer / Payment</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={filters.accountId || ""}
								onValueChange={(value) =>
									handleFilterChange("accountId", value)
								}
							>
								<SelectTrigger className="bg-white dark:bg-gray-900">
									<SelectValue placeholder="All Accounts" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="default">All Accounts</SelectItem>
									{accounts?.map((account: any) => (
										<SelectItem key={account.id} value={account.id}>
											{account.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={filters.categoryId || ""}
								onValueChange={(value) =>
									handleFilterChange("categoryId", value)
								}
							>
								<SelectTrigger className="bg-white dark:bg-gray-900">
									<SelectValue placeholder="All Categories" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="default">All Categories</SelectItem>
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
								<SelectTrigger className="bg-white dark:bg-gray-900">
									<SelectValue placeholder="All People" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="default">All People</SelectItem>
									{people?.map((person: any) => (
										<SelectItem key={person.id} value={person.id}>
											{person.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={filters.billingCycle?.split("_")[0] || ""}
								onValueChange={(value) => handleFilterChange("month", value)}
							>
								<SelectTrigger className="bg-white dark:bg-gray-900">
									<SelectValue placeholder="Month" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="default">All Months</SelectItem>
									{Array.from({ length: 12 }).map((_, i) => (
										<SelectItem key={i} value={i.toString()}>
											{new Date(0, i).toLocaleString("default", {
												month: "long",
											})}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={filters.billingCycle?.split("_")[1] || ""}
								onValueChange={(value) => handleFilterChange("year", value)}
							>
								<SelectTrigger className="bg-white dark:bg-gray-900">
									<SelectValue placeholder="Year" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="default">All Years</SelectItem>
									{Array.from({ length: 10 }).map((_, i) => {
										const year = new Date().getFullYear() - 5 + i;
										return (
											<SelectItem key={year} value={year.toString()}>
												{year}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Desktop Table View */}
				<Card className="hidden md:block backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-lg border-gray-200 dark:border-gray-700 overflow-hidden">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow
									key={headerGroup.id}
									className="bg-gray-50 dark:bg-gray-900/50"
								>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} className="font-semibold">
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-32 text-center"
									>
										<div className="flex items-center justify-center gap-2">
											<div
												className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
												style={{ animationDelay: "0ms" }}
											></div>
											<div
												className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
												style={{ animationDelay: "150ms" }}
											></div>
											<div
												className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
												style={{ animationDelay: "300ms" }}
											></div>
										</div>
									</TableCell>
								</TableRow>
							) : table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-32 text-center text-muted-foreground"
									>
										No transactions found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</Card>

				{/* Mobile Card View */}
				<div className="md:hidden space-y-3">
					{isLoading ? (
						<Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
							<CardContent className="p-8 text-center">
								<div className="flex items-center justify-center gap-2">
									<div
										className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
										style={{ animationDelay: "0ms" }}
									></div>
									<div
										className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
										style={{ animationDelay: "150ms" }}
									></div>
									<div
										className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
										style={{ animationDelay: "300ms" }}
									></div>
								</div>
							</CardContent>
						</Card>
					) : transactionsData?.data?.length ? (
						transactionsData.data.map((transaction: Transaction) => {
							const isIncome = transaction.type === "INCOME";
							const isTransfer = transaction.type === "CC_PAYMENT";
							const isOutflow = transaction.type === "OUTFLOW";

							return (
								<Card
									key={transaction.id}
									className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 hover:shadow-md transition-shadow"
								>
									<CardContent className="p-4 space-y-3">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<TruncatedText className="font-semibold text-base">
													{transaction.description}
												</TruncatedText>
												<div className="text-sm text-muted-foreground mt-0.5">
													{new Date(transaction.date).toLocaleDateString()}
												</div>
											</div>
											<div
												className={`font-bold text-lg whitespace-nowrap ${
													isIncome
														? "text-green-600 dark:text-green-400"
														: isTransfer
															? "text-blue-600 dark:text-blue-400"
															: "text-red-600 dark:text-red-400"
												}`}
											>
												{isIncome ? "+" : isOutflow ? "-" : ""}
												{formatCurrency(Number(transaction.amount))}
											</div>
										</div>

										<div className="flex items-center gap-2 flex-wrap">
											<Badge
												variant={getTypeBadgeVariant(transaction.type)}
												className="text-xs gap-1"
											>
												{getTypeIcon(transaction.type)}
												{getTypeLabel(transaction.type)}
											</Badge>
											{transaction.category?.name && (
												<Badge variant="outline" className="text-xs">
													{transaction.category.name}
												</Badge>
											)}
										</div>

										{transaction.type === "CC_PAYMENT" ? (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<span className="truncate">
													{transaction.fromAccount?.name}
												</span>
												<ArrowRight className="w-4 h-4 flex-shrink-0" />
												<span className="truncate">
													{transaction.account?.name}
												</span>
											</div>
										) : (
											<div className="text-sm text-muted-foreground">
												{transaction.account?.name}
												{transaction.person?.name &&
													` • ${transaction.person.name}`}
											</div>
										)}

										<div className="flex gap-2 mt-2">
											<Button
												size="sm"
												variant="outline"
												className="flex-1"
												onClick={() => setEditingTransaction(transaction)}
											>
												<Pencil className="h-3.5 w-3.5 mr-1.5" />
												Edit
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
												onClick={() => setDeletingTransaction(transaction)}
											>
												<Trash2 className="h-3.5 w-3.5 mr-1.5" />
												Delete
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})
					) : (
						<Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
							<CardContent className="p-8 text-center text-muted-foreground">
								No transactions found
							</CardContent>
						</Card>
					)}
				</div>

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

				{/* Pagination */}
				<Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
					<CardContent className="p-4">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="text-sm text-muted-foreground font-medium">
								Page {search.page} of {transactionsData?.meta?.totalPages || 1}
								<span className="hidden sm:inline ml-2">
									• {transactionsData?.meta?.total || 0} total transactions
								</span>
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleFilterChange("page", search.page - 1)}
									disabled={search.page <= 1}
									className="gap-1"
								>
									<ChevronLeft className="h-4 w-4" />
									<span className="hidden sm:inline">Previous</span>
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleFilterChange("page", search.page + 1)}
									disabled={
										search.page >= (transactionsData?.meta?.totalPages || 1)
									}
									className="gap-1"
								>
									<span className="hidden sm:inline">Next</span>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
