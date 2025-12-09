import React from 'react';
import { motion } from 'framer-motion';
import { FaWifi, FaRedo, FaExclamationTriangle } from 'react-icons/fa';

const OfflinePage = ({ type = 'offline', error }) => {
    const isOffline = type === 'offline';

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] p-6 text-center select-none">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative mb-8"
            >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full" />

                {/* Icon Container */}
                <div className="relative z-10 w-32 h-32 bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
                    {isOffline ? (
                        <div className="relative">
                            <FaWifi className="text-6xl text-gray-300 dark:text-gray-600" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-red-500 rotate-45 rounded-full" />
                        </div>
                    ) : (
                        <FaExclamationTriangle className="text-6xl text-amber-500" />
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-md space-y-4"
            >
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                    {isOffline ? "No Connection" : "Captain, We Have a Problem!"}
                </h1>

                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                    {isOffline
                        ? "It seems you've wandered into a signal-free zone. Check your internet connection and try again."
                        : "Something unexpected happened on our end. We're working to fix it."}
                </p>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-mono mt-4 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                        Error: {error.message || "Unknown Error"}
                    </div>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRetry}
                    className="mt-8 flex items-center justify-center gap-2 w-full sm:w-auto mx-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-lg shadow-brand-600/30 transition-all"
                >
                    <FaRedo className={isOffline ? "" : "animate-spin-slow"} />
                    {isOffline ? "Try Again" : "Reload Page"}
                </motion.button>
            </motion.div>
        </div>
    );
};

export default OfflinePage;
