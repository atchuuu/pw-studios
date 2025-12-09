import React from 'react';
import { motion } from 'framer-motion';
import pwLogo from '../../assets/pw-logo.png';

const BrandLoader = ({ fullScreen = true, text = "Loading Experience..." }) => {
    return (
        <div className={`${fullScreen ? 'fixed inset-0 z-[9999]' : 'w-full h-full min-h-[400px]'} flex flex-col items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0A] overflow-hidden`}>
            <div className="relative flex flex-col items-center">
                {/* Pulsing Glow Background */}
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-brand-500/20 rounded-full blur-3xl z-0"
                    style={{ width: 150, height: 150 }}
                />

                {/* Logo Animation */}
                <motion.div
                    className="relative z-10 w-24 h-24 mb-6 bg-white dark:bg-black/40 rounded-3xl shadow-xl flex items-center justify-center border border-white/50 dark:border-white/10 backdrop-blur-md"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    <motion.img
                        src={pwLogo}
                        alt="PW"
                        className="w-14 h-14 object-contain"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Spinner Ring */}
                    <div className="absolute inset-0 rounded-3xl border-4 border-transparent border-t-brand-500/50 animate-spin-slow" />
                </motion.div>

                {/* Text Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-2"
                >
                    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                        Physics Wallah
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
                        {text}
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default BrandLoader;
