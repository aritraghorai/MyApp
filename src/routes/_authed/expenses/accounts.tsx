import { createFileRoute } from "@tanstack/react-router";
import { getTreaty } from "../../api.$";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Plus, Wallet, Building2, CreditCard, X } from "lucide-react";

export const Route = createFileRoute("/_authed/expenses/accounts")({
  component: AccountsManagement,
});

type AccountType = "CASH" | "BANK" | "CREDIT_CARD";

function AccountsManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "CASH" as AccountType,
    balance: "",
    limit: "",
    closingDay: "",
    dueDay: "",
  });

  const { data: accounts, refetch } = useQuery({
    queryKey: ["expense-accounts"],
    queryFn: async () => {
      const { data, error } = await getTreaty()["expense-accounts"].get();
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: formData.name,
      type: formData.type,
      balance: Number(formData.balance),
    };

    if (formData.type === "CREDIT_CARD") {
      if (formData.limit) payload.limit = Number(formData.limit);
      if (formData.closingDay) payload.closingDay = Number(formData.closingDay);
      if (formData.dueDay) payload.dueDay = Number(formData.dueDay);
    }

    const { error } = await getTreaty()["expense-accounts"].post(payload);

    if (error) {
      alert("Failed to create account");
      return;
    }

    setIsCreating(false);
    setFormData({
      name: "",
      type: "CASH",
      balance: "",
      limit: "",
      closingDay: "",
      dueDay: "",
    });
    refetch();
  };

  const getIcon = (type: AccountType) => {
    switch (type) {
      case "CASH": return <Wallet className="w-5 h-5" />;
      case "BANK": return <Building2 className="w-5 h-5" />;
      case "CREDIT_CARD": return <CreditCard className="w-5 h-5" />;
    }
  };

  const calculateDueDate = (billingDay: number, gracePeriod: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Create billing date for current month
    // Note: If billingDay is 31 and month has 30 days, JS rolls over to next month 1st.
    // Ideally we should clamp, but for now let's rely on JS Date behavior or simple clamping if needed.
    // Let's clamp to last day of month to be safer for "Billing Day".
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const actualBillingDay = Math.min(billingDay, daysInMonth);

    const billingDate = new Date(currentYear, currentMonth, actualBillingDay);

    // Calculate due date (Billing Date + Grace Period)
    const dueDate = new Date(billingDate);
    dueDate.setDate(billingDate.getDate() + gracePeriod);

    // If today is past this due date, show next month's due date
    if (today > dueDate) {
      const nextMonthBillingDate = new Date(currentYear, currentMonth + 1, actualBillingDay);
      const nextMonthDueDate = new Date(nextMonthBillingDate);
      nextMonthDueDate.setDate(nextMonthBillingDate.getDate() + gracePeriod);
      return nextMonthDueDate;
    }

    return dueDate;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Account</h2>
              <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Main Wallet"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Account</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formData.type === "CREDIT_CARD" ? "Current Balance (Outstanding)" : "Current Balance"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {formData.type === "CREDIT_CARD" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Credit Limit</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={formData.limit}
                      onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Billing Day</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.dueDay}
                        onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                        placeholder="Day (1-31)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Grace Period (Days)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={formData.closingDay}
                        onChange={(e) => setFormData({ ...formData, closingDay: e.target.value })}
                        placeholder="e.g. 20"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts?.map((account: any) => (
          <div
            key={account.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${account.type === "CASH" ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
                  account.type === "BANK" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                    "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                  }`}>
                  {getIcon(account.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{account.type.replace("_", " ")}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                <p className={`text-xl font-bold ${account.type === 'CREDIT_CARD' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {formatCurrency(account.balance)}
                </p>
              </div>

              {account.type === "CREDIT_CARD" && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Limit</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(account.limit || 0)}</span>
                  </div>
                  {(account.dueDay || account.closingDay) && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Billing / Grace</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {account.dueDay ? `Day ${account.dueDay}` : "-"}
                          {" / "}
                          {account.closingDay ? `+${account.closingDay}d` : "-"}
                        </span>
                      </div>
                      {account.dueDay && account.closingDay && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Next Due</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {calculateDueDate(account.dueDay, account.closingDay).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
