import type { LucideIcon } from "lucide-react";

interface TodoStatCardProps {
    icon: LucideIcon;
    value: number | string;
    label: string;
    colorScheme: "purple" | "green" | "orange";
}

const colorSchemes = {
    purple: {
        bg: "bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20",
        border: "border-purple-200 dark:border-purple-800",
        iconBg: "bg-purple-600 dark:bg-purple-500",
        text: "text-purple-600 dark:text-purple-400",
    },
    green: {
        bg: "bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
        border: "border-green-200 dark:border-green-800",
        iconBg: "bg-green-600 dark:bg-green-500",
        text: "text-green-600 dark:text-green-400",
    },
    orange: {
        bg: "bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
        border: "border-orange-200 dark:border-orange-800",
        iconBg: "bg-orange-600 dark:bg-orange-500",
        text: "text-orange-600 dark:text-orange-400",
    },
};

/**
 * Molecule: Todo stat card (total, active, completion rate)
 */
export const TodoStatCard = ({ icon: Icon, value, label, colorScheme }: TodoStatCardProps) => {
    const colors = colorSchemes[colorScheme];

    return (
        <div className={`${colors.bg} rounded-xl shadow-lg border ${colors.border} p-6`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 ${colors.iconBg} rounded-lg`}>
                    <Icon className="text-white" size={24} />
                </div>
                <div>
                    <div className={`text-3xl font-bold ${colors.text}`}>
                        {value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
                </div>
            </div>
        </div>
    );
};

/**
 * Molecule: Compact todo stat card (for sidebar)
 */
export const TodoStatCardCompact = ({ value, label, colorScheme }: Omit<TodoStatCardProps, "icon">) => {
    const colors = colorSchemes[colorScheme];

    return (
        <div className={`${colors.bg} rounded-lg p-3 border ${colors.border}`}>
            <div className={`text-2xl font-bold ${colors.text}`}>
                {value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
        </div>
    );
};
