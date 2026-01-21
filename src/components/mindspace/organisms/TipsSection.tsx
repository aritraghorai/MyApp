/**
 * Organism: Tips section for note view
 */
export const TipsSection = () => {
    return (
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>💡 Tips:</strong> Use{" "}
                <code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">- [ ]</code>{" "}
                for todos, add{" "}
                <code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">#high</code>{" "}
                for priority. Your notes auto-save!
            </p>
        </div>
    );
};
