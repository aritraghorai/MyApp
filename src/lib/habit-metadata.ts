import { format } from "date-fns";

interface MetadataField {
    name: string;
    type: string;
    label?: string;
    unit?: string;
}

interface MetadataAnalytics {
    field: string;
    label: string;
    unit?: string;
    data: Array<{
        date: string;
        value: number | string;
    }>;
    stats: {
        min?: number;
        max?: number;
        avg?: number;
        total?: number;
        count: number;
    };
}

/**
 * Analyze habit metadata over a date range
 */
export function analyzeHabitMetadata(
    logs: Array<{ date: Date; metadata: any }>,
    metadataSchema: Record<string, string>
): MetadataAnalytics[] {
    if (!metadataSchema || Object.keys(metadataSchema).length === 0) {
        return [];
    }

    const analytics: MetadataAnalytics[] = [];

    for (const [fieldName, fieldType] of Object.entries(metadataSchema)) {
        const fieldData = logs
            .filter((log) => log.metadata && log.metadata[fieldName] !== undefined)
            .map((log) => ({
                date: format(new Date(log.date), "yyyy-MM-dd"),
                value: log.metadata[fieldName],
            }));

        if (fieldData.length === 0) continue;

        const stats: any = { count: fieldData.length };

        // Calculate stats for numeric fields
        if (fieldType === "number" || fieldType.startsWith("number")) {
            const numericValues = fieldData
                .map((d) => parseFloat(d.value as string))
                .filter((v) => !isNaN(v));

            if (numericValues.length > 0) {
                stats.min = Math.min(...numericValues);
                stats.max = Math.max(...numericValues);
                stats.avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
                stats.total = numericValues.reduce((a, b) => a + b, 0);
            }
        }

        // Parse label and unit from field type (e.g., "number:kg" or "number:Weight (kg)")
        let label = fieldName;
        let unit: string | undefined;

        if (fieldType.includes(":")) {
            const [, labelPart] = fieldType.split(":");
            if (labelPart.includes("(") && labelPart.includes(")")) {
                const match = labelPart.match(/(.+)\s*\((.+)\)/);
                if (match) {
                    label = match[1].trim();
                    unit = match[2].trim();
                }
            } else {
                label = labelPart;
            }
        }

        analytics.push({
            field: fieldName,
            label,
            unit,
            data: fieldData,
            stats,
        });
    }

    return analytics;
}

/**
 * Get template presets for common habit types
 */
export const HABIT_TEMPLATES = {
    workout: {
        name: "Workout",
        metadataSchema: {
            weight: "number:Weight (kg)",
            reps: "number:Reps",
            sets: "number:Sets",
            duration: "number:Duration (min)",
        },
    },
    leetcode: {
        name: "LeetCode",
        metadataSchema: {
            questions: "number:Questions Solved",
            difficulty: "select:Easy,Medium,Hard",
            time_minutes: "number:Time (min)",
        },
    },
    reading: {
        name: "Reading",
        metadataSchema: {
            pages: "number:Pages Read",
            book: "text:Book Title",
            minutes: "number:Time (min)",
        },
    },
    running: {
        name: "Running",
        metadataSchema: {
            distance: "number:Distance (km)",
            time: "number:Time (min)",
            pace: "number:Pace (min/km)",
        },
    },
    meditation: {
        name: "Meditation",
        metadataSchema: {
            minutes: "number:Duration (min)",
            technique: "text:Technique",
        },
    },
};
