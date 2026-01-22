import { Link } from "@tanstack/react-router";
import { CheckSquare, FileText, List, TrendingUp } from "lucide-react";

export const ViewTransitionNavBar = () => {
    const navItems = [
        { to: "/notes/journal", icon: FileText, label: "Journal" },
        { to: "/notes/list", icon: List, label: "History" },
        { to: "/notes/todos", icon: CheckSquare, label: "Tasks" },
        { to: "/notes/habits", icon: TrendingUp, label: "Habits" },
    ];

    return (
        <div className="flex items-center gap-1 p-1.5 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            {navItems.map((item) => (
                <Link
                    key={item.to}
                    to={item.to}
                    activeProps={{
                        className: "text-purple-600 dark:text-purple-400 font-medium",
                        style: { viewTransitionName: "active-nav-tab" } as any
                    }}
                    inactiveProps={{
                        className: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50",
                    }}
                    className="relative flex justify-between items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                    viewTransition
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div
                                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-600/50 -z-10"
                                    style={{ viewTransitionName: "nav-pill" } as any}
                                />
                            )}
                            <item.icon size={16} className={isActive ? "scale-110 transition-transform" : ""} />
                            <span className="text-xs hidden md:block ">{item.label}</span>
                        </>
                    )}
                </Link>
            ))}
        </div>
    );
};
