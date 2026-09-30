// Reusable loading skeleton components with full dark mode support

export const CardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-5 space-y-4 shadow-xs animate-pulse">
            <div className="w-full h-48 bg-gray-200 dark:bg-slate-800 rounded-xl" />
            <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-gray-200 dark:bg-slate-800 rounded-full" />
                <div className="h-4 w-20 bg-gray-100 dark:bg-slate-800/60 rounded" />
            </div>
            <div className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-gray-100 dark:bg-slate-800/60 rounded w-full" />
                <div className="h-4 bg-gray-100 dark:bg-slate-800/60 rounded w-3/4" />
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-slate-800/80">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 dark:bg-slate-800/60 rounded w-1/4" />
                </div>
            </div>
        </div>
    );
};

export const DetailSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 animate-pulse px-4">
            <div className="space-y-4">
                <div className="h-6 w-24 bg-gray-200 dark:bg-slate-800 rounded-full" />
                <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded-xl w-4/5" />
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-36" />
                        <div className="h-3 bg-gray-100 dark:bg-slate-800/60 rounded w-48" />
                    </div>
                </div>
            </div>
            <div className="w-full h-72 sm:h-96 bg-gray-200 dark:bg-slate-800 rounded-2xl" />
            <div className="space-y-3.5 pt-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-gray-100 dark:bg-slate-800/60 rounded w-4/5" />
                <div className="h-4 bg-gray-100 dark:bg-slate-800/60 rounded w-full" />
                <div className="h-4 bg-gray-100 dark:bg-slate-800/60 rounded w-2/3" />
            </div>
        </div>
    );
};

export const MetricCardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200/70 dark:border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1">
                <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded w-24" />
                <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-16" />
            </div>
        </div>
    );
};

export const TableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="p-6 space-y-4 animate-pulse">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-slate-800/80 last:border-none"
                >
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-800 shrink-0" />
                        <div className="space-y-1.5 flex-1 max-w-md">
                            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-4/5" />
                            <div className="h-3 bg-gray-100 dark:bg-slate-800/60 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-slate-800 rounded-full shrink-0" />
                    <div className="h-4 w-16 bg-gray-100 dark:bg-slate-800/60 rounded shrink-0 hidden sm:block" />
                </div>
            ))}
        </div>
    );
};

export const CommentSkeleton = ({ count = 3 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 space-y-3 animate-pulse"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-800" />
                        <div className="space-y-1 flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-32" />
                            <div className="h-3 bg-gray-100 dark:bg-slate-800/60 rounded w-20" />
                        </div>
                    </div>
                    <div className="space-y-2 pt-1">
                        <div className="h-3.5 bg-gray-100 dark:bg-slate-800/60 rounded w-full" />
                        <div className="h-3.5 bg-gray-100 dark:bg-slate-800/60 rounded w-4/5" />
                    </div>
                </div>
            ))}
        </div>
    );
};
