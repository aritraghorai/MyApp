import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTreaty } from "../../routes/api.$";
import { useNavigate } from "@tanstack/react-router";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getBilldingPeriodByDate } from "@/lib/utils";

interface TransactionFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting?: boolean;
    onCancel?: () => void;
}

export function TransactionForm({ initialData, onSubmit, isSubmitting, onCancel }: TransactionFormProps) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        amount: initialData?.amount || "",
        type: initialData?.type || "OUTFLOW",
        description: initialData?.description || "",
        date: initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        categoryId: initialData?.categoryId || "",
        // For CC_PAYMENT: accountId is the credit card, fromAccountId is the bank account
        // In the form: accountId is the source (bank for payment), destinationAccountId is the target (credit card)
        accountId: initialData?.type === "CC_PAYMENT" ? (initialData?.fromAccountId || "") : (initialData?.accountId || ""),
        destinationAccountId: initialData?.type === "CC_PAYMENT" ? (initialData?.accountId || "") : (initialData?.destinationAccountId || ""),
        personId: initialData?.personId || "",
        tagIds: initialData?.tags?.map((t: any) => t.tagId) || [],
        billingCycle: initialData?.billingCycle || "",
    });

    const { data: accounts } = useQuery({
        queryKey: ["expense-accounts"],
        queryFn: async () => {
            const { data, error } = await getTreaty()["expense-accounts"].get();
            if (error) throw error;
            return data;
        },
    });

    // Auto-calculate billing cycle when date or destination account changes
    useEffect(() => {
        if (formData.type === "CC_PAYMENT" && formData.destinationAccountId && accounts) {
            const creditCardAccount = accounts.find((a: any) => a.id === formData.destinationAccountId);
            if (creditCardAccount) {
                const cycle = getBilldingPeriodByDate(
                    new Date(formData.date),
                    creditCardAccount.dueDay || -1
                );
                setFormData(prev => ({ ...prev, billingCycle: cycle }));
            }
        }
    }, [formData.date, formData.destinationAccountId, formData.type, accounts]);

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

    const { data: tags } = useQuery({
        queryKey: ["tags"],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await getTreaty().tags.index.get();
            if (error) throw error;
            return data;
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            ...formData,
            amount: Number(formData.amount),
        };

        if (formData.type === "CC_PAYMENT") {
            if (!formData.destinationAccountId) {
                alert("Please select a destination account");
                return;
            }
            if (!formData.accountId) {
                alert("Please select a source account");
                return;
            }

            // If we're editing (initialData exists), pass the data to onSubmit
            // Otherwise, create a new payment via the payment endpoint
            if (initialData) {
                // Editing existing payment - pass data to TransactionDialog
                await onSubmit(payload);
            } else {
                // Creating new payment - use payment endpoint
                const paymentPayload = {
                    amount: Number(formData.amount),
                    type: "CC_PAYMENT" as const,
                    categoryId: formData.categoryId || undefined,
                    accountId: formData.destinationAccountId, // The Credit Card
                    fromAccountId: formData.accountId, // The Bank Account
                    billingCycle: formData.billingCycle,
                    personId: formData.personId || undefined,
                };

                // @ts-ignore
                const { error } = await getTreaty().transactions.payment.post(paymentPayload);
                if (error) {
                    console.error(error);
                    alert("Failed to create payment");
                    return;
                }
                await onSubmit(null); // Pass null to trigger refetch/close
            }
        } else {
            delete payload.destinationAccountId;
            delete payload.billingCycle;
            await onSubmit(payload);
        }
    };

    const getAccountLabel = () => {
        switch (formData.type) {
            case "INCOME": return "Deposit To";
            case "CC_PAYMENT": return "Paid From";
            default: return "Paid From";
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                        <SelectTrigger className="w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="OUTFLOW">Expense</SelectItem>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="CC_PAYMENT">Credit Card Payment / Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input
                        type="date"
                        required
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{getAccountLabel()}</label>
                    <Select
                        value={formData.accountId}
                        onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                    >
                        <SelectTrigger className="w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts
                                ?.filter((account: any) => {
                                    if (formData.type === "CC_PAYMENT") {
                                        return account.type === "BANK";
                                    }
                                    return true;
                                })
                                .map((account: any) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                {formData.type === "CC_PAYMENT" && (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid To (Credit Card)</label>
                            <Select
                                value={formData.destinationAccountId}
                                onValueChange={(value) => setFormData({ ...formData, destinationAccountId: value })}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <SelectValue placeholder="Select Credit Card" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts?.filter((a: any) => a.type === "CREDIT_CARD").map((account: any) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Billing Cycle</label>
                            <div className="flex gap-2">
                                <Select
                                    value={formData.billingCycle ? formData.billingCycle.split("_")[0] : ""}
                                    onValueChange={(month) => {
                                        const year = formData.billingCycle ? formData.billingCycle.split("_")[1] : new Date().getFullYear().toString();
                                        setFormData({ ...formData, billingCycle: `${month}_${year}` });
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <SelectItem key={i} value={i.toString()}>
                                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={formData.billingCycle ? formData.billingCycle.split("_")[1] : ""}
                                    onValueChange={(year) => {
                                        const month = formData.billingCycle ? formData.billingCycle.split("_")[0] : new Date().getMonth().toString();
                                        setFormData({ ...formData, billingCycle: `${month}_${year}` });
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                        <SelectTrigger className="w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories?.map((category: any) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Person</label>
                    <Select
                        value={formData.personId}
                        onValueChange={(value) => setFormData({ ...formData, personId: value })}
                    >
                        <SelectTrigger className="w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select Person (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {people?.map((person: any) => (
                                <SelectItem key={person.id} value={person.id}>
                                    {person.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {tags?.map((tag: any) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                    const newTags = formData.tagIds.includes(tag.id)
                                        ? formData.tagIds.filter((id: string) => id !== tag.id)
                                        : [...formData.tagIds, tag.id];
                                    setFormData({ ...formData, tagIds: newTags });
                                }}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.tagIds.includes(tag.id)
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Saving..." : "Save Transaction"}
                </button>
            </div>
        </form>
    );
}
