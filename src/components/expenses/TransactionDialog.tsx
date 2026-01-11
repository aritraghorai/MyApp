import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getTreaty } from "@/routes/api.$";
import { TransactionForm } from "./TransactionForm";

interface TransactionDialogProps {
	transaction: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TransactionDialog({
	transaction,
	open,
	onOpenChange,
}: TransactionDialogProps) {
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateMutation = useMutation({
		mutationFn: async (data: any) => {
			// Use dedicated payment endpoint for CC_PAYMENT transactions
			if (transaction.type === "CC_PAYMENT") {
				// Transform data for payment endpoint
				const paymentData = {
					amount: data.amount,
					categoryId: data.categoryId,
					accountId: data.destinationAccountId, // Credit card
					fromAccountId: data.accountId, // Bank account
					billingCycle: data.billingCycle,
					personId: data.personId,
				};
				const { error } = await getTreaty()
					.transactions.payment({ id: transaction.id })
					.patch(paymentData);
				if (error) throw error;
			} else {
				// Use regular transaction endpoint for other types
				const { error } = await getTreaty()
					.transactions({ id: transaction.id })
					.patch(data);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-transactions"] });
			onOpenChange(false);
		},
	});

	const handleSubmit = async (data: any) => {
		setIsSubmitting(true);
		try {
			await updateMutation.mutateAsync(data);
		} catch (error) {
			console.error("Failed to update transaction:", error);
			alert("Failed to update transaction");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Transaction</DialogTitle>
					<DialogDescription>
						Make changes to your transaction details below.
					</DialogDescription>
				</DialogHeader>
				<TransactionForm
					initialData={transaction}
					onSubmit={handleSubmit}
					isSubmitting={isSubmitting}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
