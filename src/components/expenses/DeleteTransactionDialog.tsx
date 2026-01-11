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
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Transaction</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this transaction? This action cannot
						be undone.
					</DialogDescription>
				</DialogHeader>

				<Alert
					variant="destructive"
					className="border-red-500/50 bg-red-50 dark:bg-red-950/20"
				>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						This will permanently delete the transaction.
					</AlertDescription>
				</Alert>

				<div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Description:</span>
						<span className="font-medium">
							{transaction.description || "Untitled"}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Amount:</span>
						<span className="font-bold">
							{formatCurrency(Number(transaction.amount))}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Date:</span>
						<span>{new Date(transaction.date).toLocaleDateString()}</span>
					</div>
					{transaction.category?.name && (
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Category:</span>
							<span>{transaction.category.name}</span>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={deleteMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete Transaction"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
