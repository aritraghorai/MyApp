import { Frown, Meh, Smile } from "lucide-react";

interface MoodSelectorProps {
    value: number | null;
    onChange: (mood: number) => void;
}

const moods = [
    { value: 1, emoji: "😞", label: "Bad", color: "from-red-500 to-orange-500", icon: Frown },
    { value: 2, emoji: "😕", label: "Poor", color: "from-orange-500 to-yellow-500", icon: Frown },
    { value: 3, emoji: "😐", label: "Okay", color: "from-yellow-500 to-green-400", icon: Meh },
    { value: 4, emoji: "🙂", label: "Good", color: "from-green-400 to-blue-500", icon: Smile },
    { value: 5, emoji: "😄", label: "Great", color: "from-blue-500 to-purple-500", icon: Smile },
];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                How are you feeling today?
            </label>
            <div className="flex gap-2">
                {moods.map((mood) => {
                    const isSelected = value === mood.value;
                    return (
                        <button
                            key={mood.value}
                            onClick={() => onChange(mood.value)}
                            className={`
                                flex-1 p-3 rounded-lg border-2 transition-all
                                ${isSelected
                                    ? `bg-gradient-to-br ${mood.color} border-transparent text-white scale-105 shadow-lg`
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105"
                                }
                            `}
                            title={mood.label}
                        >
                            <div className="text-2xl mb-1">{mood.emoji}</div>
                            <div
                                className={`text-xs font-medium ${isSelected
                                        ? "text-white"
                                        : "text-gray-600 dark:text-gray-400"
                                    }`}
                            >
                                {mood.label}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
