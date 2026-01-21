/**
 * Atom: Loading spinner with optional message
 */
export const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => {
    return (
        <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
        </div>
    );
};
