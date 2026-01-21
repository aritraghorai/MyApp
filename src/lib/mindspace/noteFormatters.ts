/**
 * Format a date string to a human-readable format
 */
export const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
};

/**
 * Truncate text to a maximum length with ellipsis
 */
export const truncateContent = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};
