import React from 'react';

const Skeleton = ({ className }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-white/5 rounded-xl ${className}`}
        />
    );
};

export const StudioCardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-[#111] rounded-3xl p-4 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
            {/* Image/Map Area */}
            <Skeleton className="w-full h-48 rounded-2xl" />

            {/* Content */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />

                <div className="grid grid-cols-2 gap-2 mt-4">
                    <Skeleton className="h-8 w-full rounded-lg" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                </div>

                <div className="pt-3 flex gap-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
};

export default Skeleton;
