import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { TruncatedText } from "@/components/ui/truncated-text";
import { formatCurrency } from "@/lib/utils";
import { getTreaty } from "@/routes/api.$";

interface DeleteTransactionDialogProps {
	transaction: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DeleteTransactionDialog({
	transaction,
	open,
	onOpenChange,
}: DeleteTransactionDialogProps) {
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: async () => {
			const { error } = await getTreaty()
				.transactions({ id: transaction.id })
				.delete();
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-transactions"] });
			onOpenChange(false);
		},
		onError: (error) => {
			console.error("Failed to delete transaction:", error);
			alert("Failed to delete transaction");
		},
	});

	const handleDelete = () => {
		deleteMutation.mutate();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md sm:max-w-lg w-[calc(100vw-2rem)] sm:w-full">
				<DialogHeader className="space-y-2">
					<DialogTitle className="text-lg sm:text-xl">Delete Transaction</DialogTitle>
					<DialogDescription className="text-xs sm:text-sm">
						Are you sure you want to delete this transaction? This action cannot
						be undone.
					</DialogDescription>
				</DialogHeader>

				<Alert
					variant="destructive"
					className="border-red-500/50 bg-red-50 dark:bg-red-950/20"
				>
					<AlertCircle className="h-4 w-4 shrink-0" />
					<AlertDescription className="text-xs sm:text-sm">
						This will permanently delete the transaction.
					</AlertDescription>
				</Alert>

				<div className="space-y-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<div className="flex justify-between text-xs sm:text-sm gap-2">
						<span className="text-muted-foreground shrink-0">
							Description:
						</span>
						<TruncatedText className="font-medium text-right">
							{transaction.description || "Untitled"}
						</TruncatedText>
					</div>
					<div className="flex justify-between text-xs sm:text-sm">
						<span className="text-muted-foreground shrink-0">Amount:</span>
						<span className="font-bold">
							{formatCurrency(Number(transaction.amount))}
						</span>
					</div>
					<div className="flex justify-between text-xs sm:text-sm">
						<span className="text-muted-foreground shrink-0">Date:</span>
						<span>{new Date(transaction.date).toLocaleDateString(undefined, {
							month: 'short',
							day: 'numeric',
							year: 'numeric'
						})}</span>
					</div>
					{transaction.category?.name && (
						<div className="flex justify-between text-xs sm:text-sm">
							<span className="text-muted-foreground shrink-0">Category:</span>
							<span className="truncate ml-2">{transaction.category.name}</span>
						</div>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={deleteMutation.isPending}
						className="flex-1 sm:flex-none"
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
						className="flex-1 sm:flex-none"
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
